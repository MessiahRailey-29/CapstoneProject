import { useState, useEffect, useCallback } from 'react';
import { useShoppingListsValues, useShoppingListData } from '@/stores/ShoppingListsStore';
import { useShoppingListProductIds, useDelShoppingListProductCallback, useShoppingListProductCell } from '@/stores/ShoppingListStore';
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

  // Get all shopping lists
  const allListsData = useShoppingListsValues();
  
  // Get current list data
  const currentListData = useShoppingListData(currentListId);
  const currentProductIds = useShoppingListProductIds(currentListId);

  // 🔥 FIXED: Get current list products with productId
  const currentProducts: ProductSummary[] = currentProductIds.map(productId => {
    const [name] = useShoppingListProductCell(currentListId, productId, "name");
    const [quantity] = useShoppingListProductCell(currentListId, productId, "quantity");
    const [units] = useShoppingListProductCell(currentListId, productId, "units");
    const [isPurchased] = useShoppingListProductCell(currentListId, productId, "isPurchased");
    const [createdAt] = useShoppingListProductCell(currentListId, productId, "createdAt");

    return {
      name: name || '',
      quantity: quantity || 0,
      units: units || '',
      listName: currentListData.name || '',
      listId: currentListId,
      isPurchased: isPurchased || false,
      createdAt: createdAt || new Date().toISOString(),
      productId, // 🔥 ADDED: Include productId for proper duplicate detection
    };
  }).filter(product => product.name);

  // Extract product summaries from other lists' valuesCopy data
  const getAllListsWithProducts = useCallback(() => {
    console.log('Processing lists for duplicate detection:', allListsData.length);
    console.log('Raw allListsData structure:', allListsData.map(listData => ({
      keys: Object.keys(listData),
      values: listData.values,
      tables: listData.tables,
      hasProducts: !!listData.tables?.products,
      productCount: listData.tables?.products ? Object.keys(listData.tables.products).length : 0
    })));
    
    const otherLists = allListsData.map(listData => {
      // First, try to get basic list info
      const listInfo = {
        listId: listData.values?.listId || listData.listId || '',
        name: listData.values?.name || listData.name || '',
        createdAt: listData.values?.createdAt || listData.createdAt || new Date().toISOString(),
      };

      console.log(`Processing list "${listInfo.name}" (ID: ${listInfo.listId})`);
      console.log('List data structure:', {
        hasValues: !!listData.values,
        hasTables: !!listData.tables,
        hasProducts: !!listData.tables?.products,
        tablesKeys: listData.tables ? Object.keys(listData.tables) : [],
        productsKeys: listData.tables?.products ? Object.keys(listData.tables.products) : []
      });

      // Extract products from the tables.products in valuesCopy
      let products: ProductSummary[] = [];
      
      try {
        if (listData.tables?.products) {
          console.log(`Found ${Object.keys(listData.tables.products).length} products in list "${listInfo.name}"`);
          
          products = Object.entries(listData.tables.products).map(([productId, productData]: [string, any]) => {
            console.log(`Processing product ${productId}:`, productData);
            
            return {
              name: productData.name || '',
              quantity: productData.quantity || 0,
              units: productData.units || '',
              listName: listInfo.name,
              listId: listInfo.listId,
              isPurchased: productData.isPurchased || false,
              createdAt: productData.createdAt || new Date().toISOString(),
              productId, // Include productId from the data
            };
          }).filter(product => {
            const hasName = !!product.name;
            if (!hasName) {
              console.log('Filtering out product with empty name:', product);
            }
            return hasName;
          });
        } else {
          console.log(`No products table found in list "${listInfo.name}"`);
          console.log('Available keys in listData:', Object.keys(listData));
          if (listData.tables) {
            console.log('Available keys in tables:', Object.keys(listData.tables));
          }
        }
      } catch (error) {
        console.error('Error extracting products from list:', listInfo.name, error);
      }

      console.log(`List "${listInfo.name}" final product count: ${products.length}`);
      console.log('Product names:', products.map(p => p.name));

      return {
        listData: listInfo,
        products
      };
    }).filter(list => {
      const isValid = list.listData.listId && list.listData.name;
      const isNotCurrent = list.listData.listId !== currentListId;
      
      console.log(`List "${list.listData.name}" - Valid: ${isValid}, NotCurrent: ${isNotCurrent}, Products: ${list.products.length}`);
      
      return isValid && isNotCurrent;
    });

    // Add current list with LIVE store data
    if (currentListData?.name && currentProducts.length > 0) {
      const currentListWithLiveProducts = {
        listData: {
          listId: currentListId,
          name: currentListData.name,
          createdAt: currentListData.createdAt || new Date().toISOString(),
        },
        products: currentProducts.map(product => ({
          ...product,
          listName: currentListData.name,
          listId: currentListId,
        }))
      };
      
      console.log(`✅ Adding current list "${currentListData.name}" with ${currentProducts.length} LIVE products:`, 
        currentProducts.map(p => p.name));
      
      otherLists.push(currentListWithLiveProducts);
    }

    return otherLists;
  }, [allListsData, currentListId, currentListData, currentProducts]);

  // 🔥 FIXED: Test duplicate detection with manual duplicates
  const runDuplicateDetection = useCallback(async (customSettings?: Partial<ComparisonSettings>) => {
    console.log('Running duplicate detection...');
    console.log('Current products:', currentProducts.length, currentProducts.map(p => p.name));

    if (currentProducts.length === 0) {
      console.log('No current products to check');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const settings = customSettings ? { ...state.settings, ...customSettings } : state.settings;
      const allListsWithProducts = getAllListsWithProducts();

      console.log('Available lists for comparison:', allListsWithProducts.length);
      console.log('Lists:', allListsWithProducts.map(l => ({ 
        name: l.listData.name, 
        products: l.products.length,
        productNames: l.products.map(p => p.name)
      })));


      const duplicates = duplicateDetectionService.detectDuplicates(
        currentProducts,
        allListsWithProducts,
        currentListId,
        settings
      );

      console.log('Duplicate detection results:', duplicates.length, duplicates);

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
  }, [currentProducts, currentListId, getAllListsWithProducts, state.settings]);

  // Update settings
  const updateSettings = useCallback((newSettings: ComparisonSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  }, []);

  // Add debug function to inspect data
  const debugAllListsData = useCallback(() => {
    console.log('=== DEBUG: Raw allListsData ===');
    allListsData.forEach((listData, index) => {
      console.log(`\n--- List ${index} ---`);
      console.log('Full listData object:', listData);
      console.log('Type of listData:', typeof listData);
      console.log('Keys in listData:', Object.keys(listData));
      
      if (listData.values) {
        console.log('listData.values:', listData.values);
        console.log('Keys in values:', Object.keys(listData.values));
      }
      
      if (listData.tables) {
        console.log('listData.tables:', listData.tables);
        console.log('Keys in tables:', Object.keys(listData.tables));
        
        if (listData.tables.products) {
          console.log('Products in tables.products:', Object.keys(listData.tables.products).length);
          Object.entries(listData.tables.products).forEach(([pid, pdata]) => {
            console.log(`  Product ${pid}:`, pdata);
          });
        }
      }
    });
  }, [allListsData]);

  return {
    ...state,
    runDuplicateDetection,
    updateSettings,
    debugAllListsData, // Add this for debugging
    hasProducts: currentProducts.length > 0,
  };
}

// Enhanced useDuplicateActions with actual functionality
export function useDuplicateActions(listId: string) {
  const productIds = useShoppingListProductIds(listId);

  // Find product ID by name
  const findProductByName = useCallback((productName: string): string | null => {
    for (const productId of productIds) {
      const [name] = useShoppingListProductCell(listId, productId, "name");
      if (name === productName) {
        return productId;
      }
    }
    return null;
  }, [listId, productIds]);

  const skipProduct = useCallback((productName: string) => {
    const productId = findProductByName(productName);
    if (productId) {
      const deleteCallback = useDelShoppingListProductCallback(listId, productId);
      deleteCallback();
      console.log('✅ Skipped product:', productName);
    } else {
      console.warn('❌ Product not found for skipping:', productName);
    }
  }, [listId, findProductByName]);

  const reduceQuantity = useCallback((productName: string, newQuantity: number) => {
    const productId = findProductByName(productName);
    if (productId) {
      const [, setQuantity] = useShoppingListProductCell(listId, productId, "quantity");
      setQuantity(newQuantity);
      console.log('✅ Reduced quantity for', productName, 'to', newQuantity);
    } else {
      console.warn('❌ Product not found for quantity reduction:', productName);
    }
  }, [listId, findProductByName]);

  return {
    skipProduct,
    reduceQuantity,
  };
}