type ResultTableProps = {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
};

export function ResultTable({ data, columns }: ResultTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-primary/15 bg-background/90 shadow-sm backdrop-blur">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-primary/5 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, idx) => (
            <tr key={idx} className="transition-colors hover:bg-primary/5">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 align-middle text-foreground"
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
  );
}
