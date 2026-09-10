import { NextResponse } from "next/server";

import { fetchSeasonDetailsPage } from "@/lib/api/results";
import {
  SEASONS_PAGE_SIZE,
  parseSeasonsPage,
  seasonsCacheControl,
} from "@/lib/api/seasonsPage";

/**
 * Proxy de la liste des saisons.
 *
 * C'était le dernier endroit où le navigateur appelait f1api.dev directement.
 * En passant par ici : les politiques de cache de `lib/api/client` s'appliquent
 * (une saison close n'est jamais revalidée), la réponse est mutualisée entre
 * tous les visiteurs, et le navigateur ne reçoit que le modèle `Season` au lieu
 * des trois réponses brutes de l'API amont.
 */
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
    // 502 et non 500 : la panne est en amont, chez f1api.dev.
    console.error(`[api/seasons] page ${page} indisponible`, error);
    return NextResponse.json(
      { error: "Les saisons sont momentanément indisponibles." },
      { status: 502 },
    );
  }
}
