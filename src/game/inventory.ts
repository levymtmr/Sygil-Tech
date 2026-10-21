export type InventoryState = Record<string, number>;
export type InventoryOrder = Array<string | null>;

export function createInventoryOrder(items: string[], capacity: number): InventoryOrder {
  return [...items.slice(0, capacity), ...Array<string | null>(Math.max(0, capacity - items.length)).fill(null)];
}

export function addInventoryItem(inventory: InventoryState, order: InventoryOrder, itemId: string, quantity = 1): boolean {
  if (quantity <= 0) return false;
  if (inventory[itemId] !== undefined) {
    inventory[itemId] += quantity;
    return true;
  }
  const emptySlot = order.indexOf(null);
  if (emptySlot < 0) return false;
  inventory[itemId] = quantity;
  order[emptySlot] = itemId;
  return true;
}

export function removeInventoryItem(inventory: InventoryState, order: InventoryOrder, itemId: string, quantity = 1): number {
  const current = inventory[itemId] ?? 0;
  if (quantity <= 0 || current === 0) return 0;
  const removed = Math.min(current, quantity);
  const remaining = current - removed;
  if (remaining > 0) inventory[itemId] = remaining;
  else {
    delete inventory[itemId];
    const slot = order.indexOf(itemId);
    if (slot >= 0) order[slot] = null;
  }
  return removed;
}

export function swapInventorySlots(order: InventoryOrder, from: number, to: number): boolean {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return false;
  [order[from], order[to]] = [order[to], order[from]];
  return true;
}

export function countInventoryItems(inventory: InventoryState): number {
  return Object.values(inventory).reduce((sum, quantity) => sum + quantity, 0);
}
