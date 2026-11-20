import { NextResponse } from "next/server";

import { fetchSeasonDetailsPage } from "@/lib/api/results";
import {
  SEASONS_PAGE_SIZE,
  parseSeasonsPage,
  seasonsCacheControl,
} from "@/lib/api/seasonsPage";

/** Pagination serveur de l'index des saisons. */
export async function GET(request: Request) {
  const page = parseSeasonsPage(new URL(request.url).searchParams.get("page"));

  if (page === null) {
    return NextResponse.json(
      { error: "Paramètre `page` invalide." },
      { status: 400 },
    );
  }

  try {
    const seasons = await fetchSeasonDetailsPage(page, SEASONS_PAGE_SIZE);

    return NextResponse.json(
      { seasons },
      { headers: { "Cache-Control": seasonsCacheControl(page) } },
    );
  } catch (error) {
    console.error(`[api/seasons] page ${page} indisponible`, error);
    return NextResponse.json(
      { error: "Les saisons sont momentanément indisponibles." },
      { status: 502 },
    );
  }
}
