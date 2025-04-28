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
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left px-3 py-2 capitalize">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-t hover:bg-muted/40 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
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
