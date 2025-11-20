export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU");
}

export function toIsoDateSafe(ddmmyyyy: string): string {
  try {
    const [d, m, y] = ddmmyyyy.split(".");
    const date = new Date(`${y}-${m}-${d}`);
    if (isNaN(date.getTime())) throw new Error();
    return date.toISOString().split("T")[0];
  } catch {
    console.error("Неверная дата:", ddmmyyyy);
    throw new Error("Неверный формат даты рождения");
  }
}
