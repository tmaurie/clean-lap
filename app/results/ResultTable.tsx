import type { ReactNode } from "react";

/**
 * Une colonne est liée à une clé de `T`, et son `render` reçoit la valeur
 * réellement typée pour cette clé (plus `any`). Le type mappé distribue sur
 * chaque clé pour conserver ce lien entre `key` et le type de `value`.
 */
export type ResultColumn<T> = {
  [K in Extract<keyof T, string>]: {
    key: K;
    label: string;
    render?: (value: T[K], row: T) => ReactNode;
  };
}[Extract<keyof T, string>];

type ResultTableProps<T> = {
  data: T[];
  columns: readonly ResultColumn<T>[];
  /** Décrit le tableau pour les lecteurs d'écran. */
  caption: string;
};

export function ResultTable<T extends { position?: string }>({
  data,
  columns,
  caption,
}: ResultTableProps<T>) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="overflow-x-auto border border-white/8">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        {/* Un tableau sans légende ne se distingue pas des autres pour un
            lecteur d'écran, surtout avec six onglets sur la même page. */}
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-white/8">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {!hasData && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-6 text-center text-sm text-foreground/50"
              >
                Aucun résultat disponible pour le moment.
              </td>
            </tr>
          )}

          {data.map((row, idx) => {
            const isNC = row.position === "NC";

            return (
              <tr
                key={idx}
                className={
                  "border-b border-white/8 transition-colors hover:bg-[#12151a]" +
                  (isNC ? " text-destructive" : "")
                }
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="px-5 py-3.5 align-middle">
                      {col.render
                        ? // Le type mappé garantit déjà que `value` correspond
                          // à `col.key`, mais TS perd le lien une fois la
                          // colonne extraite de l'union.
                          (col.render as (v: unknown, r: T) => ReactNode)(
                            value,
                            row,
                          )
                        : String(value)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
