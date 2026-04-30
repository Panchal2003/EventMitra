export function DataTable({
  columns,
  emptyDescription,
  emptyTitle,
  keyField = "_id",
  rows = [],
}) {
  if (!rows || !rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center">
        <h4 className="font-display text-lg font-semibold text-slate-900">{emptyTitle}</h4>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  const renderValue = (column, row) => {
    if (column.render) {
      return column.render(row);
    }

    return row[column.accessor] ?? "-";
  };

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="px-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row[keyField]}>
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className="rounded-2xl bg-white/70 px-4 py-4 align-top text-sm text-slate-600 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.28)]"
                  >
                    {renderValue(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {rows.map((row) => (
          <div key={row[keyField]} className="glass-panel p-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.header} className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {column.header}
                  </div>
                  <div className="text-sm text-slate-700">{renderValue(column, row)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
