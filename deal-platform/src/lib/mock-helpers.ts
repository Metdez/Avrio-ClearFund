import { DEFAULT_PAGE_SIZE } from "./constants";

export function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export function filterBy<T>(items: T[], key: keyof T, value: unknown): T[] {
  return items.filter((item) => item[key] === value);
}

export function searchByName<T extends Record<string, unknown>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] {
  if (!searchTerm || searchTerm.length < 2) return items;
  const lower = searchTerm.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const val = item[field];
      return typeof val === "string" && val.toLowerCase().includes(lower);
    })
  );
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number = DEFAULT_PAGE_SIZE
): { data: T[]; total: number; totalPages: number; page: number; perPage: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return { data, total, totalPages, page, perPage };
}

export function sortBy<T>(items: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === "asc" ? 1 : -1;
    if (bVal == null) return direction === "asc" ? -1 : 1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });
}
