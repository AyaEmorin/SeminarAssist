export function parseColor(input?: string): number | undefined {
  if (!input) return undefined;
  const normalized = input.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return undefined;
  return Number.parseInt(normalized, 16);
}
