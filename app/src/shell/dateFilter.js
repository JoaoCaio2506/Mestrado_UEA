export const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function yearsPresentIn(rows, getDate) {
  const years = new Set();
  rows.forEach((row) => {
    const value = getDate(row);
    if (value) years.add(new Date(value).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function matchesDateFilter(value, { day, month, year }) {
  if (!day && !month && !year) return true;
  if (!value) return false;
  const d = new Date(value);
  if (day && d.getDate() !== Number(day)) return false;
  if (month && d.getMonth() + 1 !== Number(month)) return false;
  if (year && d.getFullYear() !== Number(year)) return false;
  return true;
}
