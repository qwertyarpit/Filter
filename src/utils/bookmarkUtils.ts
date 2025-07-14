export function getRowKey(row: Record<string, string>): string {
  return Object.values(row).join("|");
}
