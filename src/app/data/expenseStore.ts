import { Expense } from "./mockData";

const EXPENSES_KEY = "funeral_expenses";
const CUSTOM_CATEGORIES_KEY = "funeral_custom_categories";

// ── Lectura local (síncrona, rápida) ─────────────────────────────────────────

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Expense[];
  } catch (err) {
    console.error("Error cargando gastos:", err);
    return [];
  }
}

// ── Escritura Local ──────────────────────────────────────────────────────────

export function persistExpense(expense: Expense): void {
  const current = loadExpenses();
  const idx = current.findIndex((e) => e.id === expense.id);
  if (idx >= 0) {
    current[idx] = expense;
  } else {
    current.unshift(expense);
  }
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(current));
  
  // Emitir evento para notificar cambios (opcional)
  window.dispatchEvent(new CustomEvent("expensesChanged"));
}

export function deleteExpense(id: string): void {
  const current = loadExpenses().filter((e) => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(current));
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

// ── Estadísticas mensuales de gastos ──────────────────────────────────────────

export function computeMonthlyExpenseData(expenses: Expense[]) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-CL", { month: "short" });
    months.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  return months.map(({ key, label }) => {
    // Filtrar gastos por mes (basado en el campo 'date' del gasto, no 'createdAt')
    const inMonth = expenses.filter((e) => e.date.startsWith(key));
    const total = inMonth.reduce((acc, e) => acc + e.amount, 0);
    return { month: label, total };
  });
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
