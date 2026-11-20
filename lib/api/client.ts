import { unstable_cache } from "next/cache";

const providers = {
  jolpica: { base: "https://api.jolpi.ca/ergast/f1/", spacing: 600 },
  openf1: { base: "https://api.openf1.org/v1/", spacing: 450 },
};

type Provider = keyof typeof providers;
type Queue = { nextRequest: number; blockedUntil: number };
type CachedResponse = { data: unknown; freshUntil: number };

type Runtime = {
  queues: Record<Provider, Queue>;
  inFlight: Map<string, Promise<unknown>>;
  responses: Map<string, CachedResponse>;
};

// App Router can load the same module from several route bundles in one process.
const globalRuntime = globalThis as typeof globalThis & {
  cleanLapApiRuntime?: Runtime;
};
const runtime = (globalRuntime.cleanLapApiRuntime ??= {
  queues: {
    jolpica: { nextRequest: 0, blockedUntil: 0 },
    openf1: { nextRequest: 0, blockedUntil: 0 },
  },
  inFlight: new Map(),
  responses: new Map(),
});

export function isLiveSeason(season?: string): boolean {
  return season === "current" || season === String(new Date().getFullYear());
}

async function takeTurn(provider: Provider) {
  const queue = runtime.queues[provider];
  while (true) {
    const now = Date.now();
    const wait = Math.max(queue.nextRequest, queue.blockedUntil) - now;
    if (queue.blockedUntil - now > 2500 || wait > 8000) {
      throw new Error(`${provider}: retry later (429)`);
    }
    if (wait <= 0) {
      queue.nextRequest = now + providers[provider].spacing;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

function retryAt(response: Response, now: number): number {
  const header = response.headers.get("Retry-After");
  const time =
    header && /^\d+$/.test(header)
      ? now + Number(header) * 1000
      : Date.parse(header ?? "");
  return Number.isFinite(time) ? Math.max(time, now + 350) : now + 1500;
}

async function fetchJson(provider: Provider, url: string): Promise<unknown> {
  const queue = runtime.queues[provider];
  for (let attempt = 0; attempt < 2; attempt++) {
    await takeTurn(provider);
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "CleanLap/0.1.0" },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 429) {
      const now = Date.now();
      queue.blockedUntil = Math.max(queue.blockedUntil, retryAt(response, now));
      if (attempt === 0 && queue.blockedUntil - now <= 2500) continue;
    }

    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(`${provider}: HTTP ${response.status} for ${url}`);

    const json: unknown = await response.json();
    if (
      provider === "jolpica"
        ? !json || typeof json !== "object" || !("MRData" in json)
        : !Array.isArray(json)
    ) {
      throw new Error(`${provider}: invalid response for ${url}`);
    }
    return json;
  }
  throw new Error(`${provider}: retry later (429)`);
}

function coalesce(
  provider: Provider,
  url: string,
  ttl: number,
): Promise<unknown> {
  const cached = runtime.responses.get(url);
  if (cached && cached.freshUntil > Date.now())
    return Promise.resolve(cached.data);

  const pending = runtime.inFlight.get(url);
  if (pending) return pending;

  const request = fetchJson(provider, url)
    .then((data) => {
      const responses = runtime.responses;
      responses.delete(url);
      responses.set(url, { data, freshUntil: Date.now() + ttl * 1000 });
      const oldest = responses.keys().next().value;
      if (responses.size > 256 && oldest) responses.delete(oldest);
      return data;
    })
    .finally(() => runtime.inFlight.delete(url));
  runtime.inFlight.set(url, request);
  return request;
}

export async function requestData<T>(
  provider: Provider,
  path: string,
  season?: string,
): Promise<T | null> {
  const url = `${providers[provider].base}${path}`;
  const revalidate = !season ? 3600 : isLiveSeason(season) ? 60 : 86400;
  try {
    // Next retains the last successful value when revalidation throws. The
    // process cache also covers reads from different route bundles.
    return await unstable_cache(
      (service: Provider, target: string, ttl: number) =>
        coalesce(service, target, ttl) as Promise<T | null>,
      ["f1-provider-v1"],
      { revalidate },
    )(provider, url, revalidate);
  } catch (error) {
    const stale = runtime.responses.get(url)?.data;
    if (stale != null) return stale as T;
    throw error;
  }
}
