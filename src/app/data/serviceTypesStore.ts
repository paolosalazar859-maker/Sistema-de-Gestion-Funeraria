import { funeralServiceTypes } from "./mockData";

const KEY = "funeral_service_types";

export function loadServiceTypes(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [...funeralServiceTypes];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [...funeralServiceTypes];
  } catch {
    return [...funeralServiceTypes];
  }
}

export function saveServiceTypes(types: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(types));
}

export function addServiceType(name: string): string[] {
  const current = loadServiceTypes();
  const trimmed = name.trim();
  if (!trimmed || current.includes(trimmed)) return current;
  const updated = [...current, trimmed];
  saveServiceTypes(updated);
  return updated;
}

export function removeServiceType(name: string): string[] {
  const current = loadServiceTypes();
  const updated = current.filter((t) => t !== name);
  saveServiceTypes(updated);
  return updated;
}
