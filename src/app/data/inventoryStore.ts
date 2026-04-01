const INVENTORY_KEY = "funeral_inventory";

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

export function loadInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error loading inventory:", error);
    return [];
  }
}

export function saveInventory(items: InventoryItem[]): void {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
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

export function deleteInventoryItem(id: string): void {
  const items = loadInventory();
  const filtered = items.filter(i => i.id !== id);
  saveInventory(filtered);
}
