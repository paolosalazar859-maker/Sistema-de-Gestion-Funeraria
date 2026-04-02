import { Expense } from "./mockData";

const EXPENSES_KEY = "funeral_expenses";
const CUSTOM_CATEGORIES_KEY = "funeral_custom_categories";

// ── Lectura local (síncrona, rápida) ─────────────────────────────────────────

import { jsonDb } from "./jsonDb";

export function loadExpenses(): Expense[] {
  try {
    const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);
    
    // Fallback síncrono para la UI inicial
    if (isTauri) {
      const raw = localStorage.getItem(EXPENSES_KEY);
      return raw ? JSON.parse(raw) : [];
    }

    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Expense[];
  } catch (err) {
    console.error("Error cargando gastos:", err);
    return [];
  }
}

/** Carga asíncrona para Tauri */
export async function loadExpensesAsync(): Promise<Expense[]> {
  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    const state = await jsonDb.load();
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(state.expenses));
    return state.expenses;
  }
  return loadExpenses();
}

// ── Escritura Local ──────────────────────────────────────────────────────────

export async function persistExpense(expense: Expense): Promise<void> {
  const current = loadExpenses();
  const idx = current.findIndex((e) => e.id === expense.id);
  if (idx >= 0) {
    current[idx] = expense;
  } else {
    current.unshift(expense);
  }
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(current));

  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    await jsonDb.updateSection('expenses', current);
  }
  
  window.dispatchEvent(new CustomEvent("expensesChanged"));
}

export async function deleteExpense(id: string): Promise<void> {
  const current = loadExpenses().filter((e) => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(current));

  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    await jsonDb.updateSection('expenses', current);
  }

  window.dispatchEvent(new CustomEvent("expensesChanged"));
}

// ── ID único ──────────────────────────────────────────────────────────────────

export function generateExpenseId(): string {
  const expenses = loadExpenses();
  let max = 0;
  expenses.forEach((e) => {
    const match = e.id.match(/^EXP-(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  });
  return `EXP-${String(max + 1).padStart(3, "0")}`;
}

// ── Estadísticas mensuales de gastos por Año ──────────────────────────────────

export function computeMonthlyExpenseData(expenses: Expense[], year: number) {
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const monthKey = `${year}-${String(monthIndex).padStart(2, "0")}`;
    const d = new Date(year, i, 1);
    const label = d.toLocaleDateString("es-CL", { month: "short" });
    
    return { 
      key: monthKey,
      month: label.charAt(0).toUpperCase() + label.slice(1), 
      total: 0 
    };
  });

  expenses.forEach(expense => {
    if (expense.date && expense.date.startsWith(`${year}-`)) {
      const monthPart = expense.date.split("-")[1];
      const monthIdx = parseInt(monthPart, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        monthsData[monthIdx].total += expense.amount;
      }
    }
  });

  return monthsData;
}

// ── Categorías Personalizadas ────────────────────────────────────────────────

export function loadCustomCategories(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err) {
    console.error("Error cargando categorías personalizadas:", err);
    return [];
  }
}

export function persistCustomCategory(category: string): void {
  const current = loadCustomCategories();
  if (!category || current.includes(category)) return;
  
  // No guardar categorías fijas si ya están en la UI
  const protectedCategories = ["Bencina / Traslado", "Servicios Básicos (Luz/Agua)", "Mantenimiento", "Artículos Funerarios", "Otros"];
  if (protectedCategories.includes(category)) return;

  current.push(category);
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(current));
}
