const INVENTORY_KEY = "funeral_inventory";
const ENGRAVING_PRICE_KEY = "engraving_price_per_letter";

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

import { jsonDb } from "./jsonDb";

export function loadInventory(): InventoryItem[] {
  try {
    const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);
    
    // Si estamos en Tauri, intentamos cargar desde JSON
    if (isTauri) {
      // Nota: la carga asíncrona real se maneja en el componente, 
      // esto es un fallback síncrono para la UI inicial.
      const raw = localStorage.getItem(INVENTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    }

    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error loading inventory:", error);
    return [];
  }
}

/** Carga asíncrona real para Tauri */
export async function loadInventoryAsync(): Promise<InventoryItem[]> {
  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    const state = await jsonDb.load();
    // Cache en localStorage para velocidad
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(state.inventory));
    return state.inventory;
  }
  return loadInventory();
}

export async function saveInventory(items: InventoryItem[]): Promise<void> {
  try {
    const isTauri =!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
    
    // Guardar en localStorage siempre como caché
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));

    if (isTauri) {
      await jsonDb.updateSection('inventory', items);
    }
  } catch (error) {
    console.error("Error saving inventory:", error);
  }
}

export function addInventoryItem(item: Omit<InventoryItem, "id" | "createdAt">): InventoryItem {
  const items = loadInventory();
  const newItem: InventoryItem = {
    ...item,
    id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  saveInventory(items);
  return newItem;
}

export function addInventoryItems(itemsToAdd: Omit<InventoryItem, "id" | "createdAt">[]): void {
  const items = loadInventory();
  const now = new Date().toISOString();
  const newItems = itemsToAdd.map((it, idx) => ({
    ...it,
    id: `INV-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now
  }));
  
  saveInventory([...items, ...newItems]);
}

export function deleteInventoryItem(id: string): void {
  const items = loadInventory();
  const filtered = items.filter(i => i.id !== id);
  saveInventory(filtered);
}

export function getEngravingPrice(): number {
  try {
    const saved = localStorage.getItem(ENGRAVING_PRICE_KEY);
    return saved ? Number(saved) : 500; // Default price: 500
  } catch {
    return 500;
  }
}

export function saveEngravingPrice(price: number): void {
  try {
    localStorage.setItem(ENGRAVING_PRICE_KEY, price.toString());
  } catch (error) {
    console.error("Error saving engraving price:", error);
  }
}
