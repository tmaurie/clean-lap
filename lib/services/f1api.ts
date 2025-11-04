import F1Api from "@f1api/sdk";

let client: F1Api | null = null;

export function getF1Api(): F1Api {
  if (!client) {
    client = new F1Api();
  }

  return client;
}
