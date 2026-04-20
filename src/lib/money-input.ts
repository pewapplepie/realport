export function formatMoneyInput(value: number) {
  if (!Number.isFinite(value)) return "";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseMoneyInput(value: string | null | undefined) {
  if (typeof value !== "string") return 0;

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
