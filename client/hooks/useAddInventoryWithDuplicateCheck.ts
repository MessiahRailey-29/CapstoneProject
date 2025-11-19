// hooks/useAddInventoryWithDuplicateCheck.ts
import { useCallback } from 'react';
import { useAddInventoryItemsCallback, useInventoryItems } from '@/stores/InventoryStore';
import { StorageLocation } from '@/utils/storageMapping';

export interface InventoryItemInput {
  name: string;
  quantity: number;
  units: string;
  category?: string;
  selectedStore?: string;
  selectedPrice?: number;
  databaseProductId?: number;
  notes?: string;
  storageLocation?: StorageLocation;
}

export interface DuplicateInfo {
  newItem: InventoryItemInput;
  existingItem: {
    id: string;
    name: string;
    quantity: number;
    units: string;
    category: string;
    storageLocation: string;
  };
}

/**
 * Hook for adding inventory items with duplicate detection
 *
 * Returns an object with:
 * - checkForDuplicates: Function that checks if items would create duplicates
 * - addItems: Function to add items (skipping duplicates)
 * - addItemsAnyway: Function to force add items even if they're duplicates
 */
export function useAddInventoryWithDuplicateCheck() {
  const addInventoryItems = useAddInventoryItemsCallback();
  const existingItems = useInventoryItems();

  /**
   * Check if any of the items to be added are duplicates
   * Returns array of duplicate information
   */
  const checkForDuplicates = useCallback(
    (items: InventoryItemInput[]): DuplicateInfo[] => {
      const duplicates: DuplicateInfo[] = [];

      items.forEach(newItem => {
        const normalizedNewName = newItem.name.trim().toLowerCase();

        // Find matching items in existing inventory
        const matchingItem = existingItems.find(existing => {
          const normalizedExistingName = existing.name.trim().toLowerCase();

          // Match by name and optionally category
          const nameMatches = normalizedExistingName === normalizedNewName;
          const categoryMatches = !newItem.category ||
                                  existing.category === newItem.category;

          return nameMatches && categoryMatches;
        });

        if (matchingItem) {
          duplicates.push({
            newItem,
            existingItem: {
              id: matchingItem.id,
              name: matchingItem.name,
              quantity: matchingItem.quantity,
              units: matchingItem.units,
              category: matchingItem.category,
              storageLocation: matchingItem.storageLocation,
            },
          });
        }
      });

      return duplicates;
    },
    [existingItems]
  );

  /**
   * Add items, but only non-duplicates
   */
  const addItems = useCallback(
    (items: InventoryItemInput[], listId: string, userId: string): string[] => {
      const duplicates = checkForDuplicates(items);
      const duplicateNames = new Set(duplicates.map(d => d.newItem.name.trim().toLowerCase()));

      // Filter out duplicates
      const itemsToAdd = items.filter(item =>
        !duplicateNames.has(item.name.trim().toLowerCase())
      );

      if (itemsToAdd.length === 0) {
        console.log('⚠️ All items are duplicates, nothing to add');
        return [];
      }

      console.log(`✅ Adding ${itemsToAdd.length} items (${duplicates.length} duplicates skipped)`);
      return addInventoryItems(itemsToAdd, listId, userId);
    },
    [addInventoryItems, checkForDuplicates]
  );

  /**
   * Force add all items, even if they're duplicates
   */
  const addItemsAnyway = useCallback(
    (items: InventoryItemInput[], listId: string, userId: string): string[] => {
      console.log(`✅ Force adding ${items.length} items (including duplicates)`);
      return addInventoryItems(items, listId, userId);
    },
    [addInventoryItems]
  );

  return {
    checkForDuplicates,
    addItems,
    addItemsAnyway,
  };
}
