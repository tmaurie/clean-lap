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
    <div className="overflow-x-auto border border-white/8">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/45"
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
                      {col.render ? col.render(value, row) : String(value)}
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
