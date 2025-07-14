export function applyFilters(
  data: Record<string, string>[],
  filters: Record<string, string[]>,
  filterColumns: string[]
): Record<string, string>[] {
  return data.filter((row) =>
    filterColumns.every(
      (col) =>
        !filters[col] ||
        filters[col].length === 0 ||
        filters[col].includes(row[col])
    )
  );
}
