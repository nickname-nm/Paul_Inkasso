export function formatMoney(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatDate(value?: string) {
  if (!value) return "Noch kein Kontakt";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(value));
}
