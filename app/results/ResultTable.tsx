type ResultTableProps = {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
};

export function ResultTable({ data, columns }: ResultTableProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-background via-background to-primary/5 shadow-lg backdrop-blur">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-gradient-to-r from-primary/10 via-background to-primary/10 text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
            <tr className="border-b border-border/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-left font-semibold text-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/80">
            {!hasData && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-6 text-center text-sm text-muted-foreground"
                >
                  Aucun résultat disponible pour le moment.
                </td>
              </tr>
            )}

            {data.map((row, idx) => (
              <tr
                key={idx}
                className="group transition-all duration-200 odd:bg-background/80 even:bg-muted/20 hover:-translate-y-[1px] hover:bg-primary/5"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-5 py-4 align-middle text-foreground transition-colors group-hover:text-foreground"
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
