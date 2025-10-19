import { useState, useCallback, useMemo } from 'react';
import { useShoppingListsValues, useShoppingListData } from '@/stores/ShoppingListsStore';
import { useShoppingListProductIds } from '@/stores/ShoppingListStore';
import { 
  duplicateDetectionService, 
  ComparisonSettings, 
  DuplicateMatch, 
  ProductSummary 
} from '@/services/DuplicateDetectionService';

export interface DuplicateDetectionState {
  isLoading: boolean;
  duplicates: DuplicateMatch[];
  settings: ComparisonSettings;
  stats: {
    totalDuplicates: number;
    highConfidence: number;
    suggestedSkips: number;
    suggestedReductions: number;
    potentialSavings: string;
  };
}

export function useDuplicateDetection(currentListId: string) {
  const [state, setState] = useState<DuplicateDetectionState>({
    isLoading: false,
    duplicates: [],
    settings: {
      option: 'last-3',
      includeCompleted: false,
      similarityThreshold: 0.8
    },
    stats: {
      totalDuplicates: 0,
      highConfidence: 0,
      suggestedSkips: 0,
      suggestedReductions: 0,
      potentialSavings: 'No analysis run'
    }
  });

  const allListsData = useShoppingListsValues();
  const currentListData = useShoppingListData(currentListId);
  const currentProductIds = useShoppingListProductIds(currentListId) || [];

  // 🔥 FIXED: Don't call hooks for products - just return the data we need
  const getAllListsWithProducts = useCallback(() => {
    console.log('Processing lists for duplicate detection:', allListsData.length);
    
    const otherLists = allListsData.map(listData => {
      const listInfo = {
        listId: listData.values?.listId || listData.listId || '',
        name: listData.values?.name || listData.name || '',
        createdAt: listData.values?.createdAt || listData.createdAt || new Date().toISOString(),
      };

      let products: ProductSummary[] = [];
      
      try {
        if (listData.tables?.products) {
          products = Object.entries(listData.tables.products).map(([productId, productData]: [string, any]) => {
            return {
              name: productData.name || '',
              quantity: productData.quantity || 0,
              units: productData.units || '',
              listName: listInfo.name,
              listId: listInfo.listId,
              isPurchased: productData.isPurchased || false,
              createdAt: productData.createdAt || new Date().toISOString(),
              productId,
            };
          }).filter(product => !!product.name);
        }
      } catch (error) {
        console.error('Error extracting products from list:', listInfo.name, error);
      }

      return {
        listData: listInfo,
        products
      };
    }).filter(list => {
      const isValid = list.listData.listId && list.listData.name;
      const isNotCurrent = list.listData.listId !== currentListId;
      return isValid && isNotCurrent;
    });

    return otherLists;
  }, [allListsData, currentListId]);

  // 🔥 FIXED: Get current list products from valuesCopy, not from hooks
  const getCurrentProducts = useCallback(() => {
    const currentList = allListsData.find(list => 
      (list.values?.listId || list.listId) === currentListId
    );
    
    if (!currentList || !currentList.tables?.products) {
      return [];
    }

    const products = Object.entries(currentList.tables.products).map(([productId, productData]: [string, any]) => {
      return {
        name: productData.name || '',
        quantity: productData.quantity || 0,
        units: productData.units || '',
        listName: currentListData?.name || '',
        listId: currentListId,
        isPurchased: productData.isPurchased || false,
        createdAt: productData.createdAt || new Date().toISOString(),
        productId,
      };
    }).filter(product => !!product.name);

    return products;
  }, [allListsData, currentListId, currentListData]);

  const runDuplicateDetection = useCallback(async (customSettings?: Partial<ComparisonSettings>) => {
    const currentProducts = getCurrentProducts();
    
    if (currentProducts.length === 0) {
      console.log('No current products to check');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const settings = customSettings ? { ...state.settings, ...customSettings } : state.settings;
      const allListsWithProducts = getAllListsWithProducts();

      // Add current list to the comparison
      const allListsIncludingCurrent = [
        ...allListsWithProducts,
        {
          listData: {
            listId: currentListId,
            name: currentListData?.name || '',
            createdAt: currentListData?.createdAt || new Date().toISOString(),
          },
          products: currentProducts
        }
      ];

      const duplicates = duplicateDetectionService.detectDuplicates(
        currentProducts,
        allListsIncludingCurrent,
        currentListId,
        settings
      );

      const stats = duplicateDetectionService.getDuplicateStats(duplicates);

      setState(prev => ({
        ...prev,
        duplicates,
        stats,
        settings,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error running duplicate detection:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [getCurrentProducts, getAllListsWithProducts, currentListId, currentListData, state.settings]);

  const updateSettings = useCallback((newSettings: ComparisonSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  }, []);

  const debugAllListsData = useCallback(() => {
    console.log('=== DEBUG: Raw allListsData ===');
    allListsData.forEach((listData, index) => {
      console.log(`\n--- List ${index} ---`);
      console.log('Full listData object:', listData);
    });
  }, [allListsData]);

  // Build a product name to ID map from valuesCopy
  const productNameToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    const currentProducts = getCurrentProducts();
    
    currentProducts.forEach(product => {
      if (product.name && product.productId) {
        map.set(product.name, product.productId);
      }
    });
    
    return map;
  }, [getCurrentProducts]);

  const hasProducts = currentProductIds.length > 0;

  return {
    ...state,
    runDuplicateDetection,
    updateSettings,
    debugAllListsData,
    hasProducts,
    productNameToIdMap,
  };
}