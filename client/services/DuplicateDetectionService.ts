// services/DuplicateDetectionService.ts - Enhanced version
export interface ProductSummary {
  name: string;
  quantity: number;
  units: string;
  listName: string;
  listId: string;
  isPurchased: boolean;
  createdAt: string;
  productId?: string;
  selectedStore?: string; // Added for store comparison
}

export interface DuplicateMatch {
  productName: string;
  currentQuantity: number;
  currentUnits: string;
  currentStore?: string;
  matches: Array<{
    listName: string;
    listId: string;
    quantity: number;
    units: string;
    isPurchased: boolean;
    daysAgo: number;
    productId?: string;
    selectedStore?: string;
  }>;
  suggestedAction: 'reduce' | 'skip' | 'warning' | 'merge' | 'different-store';
  confidence: 'high' | 'medium' | 'low';
  isDifferentStore?: boolean; // New flag
}

export type ComparisonOption = 'last-1' | 'last-3' | 'last-5' | 'all' | 'custom';

export interface ComparisonSettings {
  option: ComparisonOption;
  customDays?: number;
  includeCompleted: boolean;
  similarityThreshold: number;
  checkDifferentStores?: boolean; // New setting
}

class DuplicateDetectionService {
  // Normalize product names for comparison
  private normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\b(kg|g|ml|l|pcs|pack|bottle|can|box)\b/gi, '');
  }

  // Calculate string similarity
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Filter lists based on comparison settings
  private filterListsBySettings(
    allLists: Array<{ listData: any; products: ProductSummary[] }>,
    currentListId: string,
    settings: ComparisonSettings
  ): Array<{ listData: any; products: ProductSummary[] }> {
    const allListsIncludingCurrent = allLists;
    
    const sortedLists = allListsIncludingCurrent.sort((a, b) => 
      new Date(b.listData.createdAt).getTime() - new Date(a.listData.createdAt).getTime()
    );

    let filteredLists: typeof sortedLists = [];

    switch (settings.option) {
      case 'last-1':
        const currentList = sortedLists.find(list => list.listData.listId === currentListId);
        const otherList = sortedLists.find(list => list.listData.listId !== currentListId);
        filteredLists = [currentList, otherList].filter(Boolean);
        break;
      case 'last-3':
        filteredLists = sortedLists.slice(0, 3);
        if (!filteredLists.some(list => list.listData.listId === currentListId)) {
          const currentList = sortedLists.find(list => list.listData.listId === currentListId);
          if (currentList) {
            filteredLists = [currentList, ...filteredLists.slice(0, 2)];
          }
        }
        break;
      case 'last-5':
        filteredLists = sortedLists.slice(0, 5);
        if (!filteredLists.some(list => list.listData.listId === currentListId)) {
          const currentList = sortedLists.find(list => list.listData.listId === currentListId);
          if (currentList) {
            filteredLists = [currentList, ...filteredLists.slice(0, 4)];
          }
        }
        break;
      case 'all':
        filteredLists = sortedLists;
        break;
      case 'custom':
        if (settings.customDays) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - settings.customDays);
          filteredLists = sortedLists.filter(list => 
            new Date(list.listData.createdAt) >= cutoffDate
          );
        } else {
          filteredLists = sortedLists;
        }
        if (!filteredLists.some(list => list.listData.listId === currentListId)) {
          const currentList = sortedLists.find(list => list.listData.listId === currentListId);
          if (currentList) {
            filteredLists.unshift(currentList);
          }
        }
        break;
    }

    return filteredLists;
  }

  // 🔥 NEW: Check for same product with different store in current list
  public checkSameListDifferentStore(
    productName: string,
    selectedStore: string | undefined,
    currentListProducts: ProductSummary[],
    similarityThreshold: number = 0.8
  ): { found: boolean; existingProduct?: ProductSummary } {
    const normalizedName = this.normalizeProductName(productName);
    
    for (const product of currentListProducts) {
      const normalizedExisting = this.normalizeProductName(product.name);
      const similarity = this.calculateSimilarity(normalizedName, normalizedExisting);
      
      if (similarity >= similarityThreshold) {
        // Check if stores are different
        const existingStore = product.selectedStore || '';
        const newStore = selectedStore || '';
        
        if (existingStore && newStore && existingStore !== newStore) {
          return {
            found: true,
            existingProduct: product
          };
        }
      }
    }
    
    return { found: false };
  }

  // Enhanced duplicate detection with store awareness
  public detectDuplicates(
    currentProducts: ProductSummary[],
    allLists: Array<{ listData: any; products: ProductSummary[] }>,
    currentListId: string,
    settings: ComparisonSettings = {
      option: 'last-3',
      includeCompleted: false,
      similarityThreshold: 0.8,
      checkDifferentStores: true
    }
  ): DuplicateMatch[] {
    console.log('🔍 Running duplicate detection with', currentProducts.length, 'current products');
    console.log('🔍 Checking against', allLists.length, 'total lists');
    
    const filteredLists = this.filterListsBySettings(allLists, currentListId, settings);
    console.log('🔍 After filtering, checking against', filteredLists.length, 'lists');
    
    const duplicates: DuplicateMatch[] = [];

    currentProducts.forEach(currentProduct => {
      const normalizedCurrentName = this.normalizeProductName(currentProduct.name);
      const matches: DuplicateMatch['matches'] = [];
      let isDifferentStore = false;

      filteredLists.forEach(list => {
        list.products.forEach(existingProduct => {
          // Skip if it's the exact same product instance
          const isSameInstance = (
            list.listData.listId === currentListId && 
            currentProduct.productId && 
            existingProduct.productId &&
            currentProduct.productId === existingProduct.productId
          ) || (
            list.listData.listId === currentListId &&
            currentProduct.createdAt === existingProduct.createdAt &&
            currentProduct.name === existingProduct.name &&
            currentProduct.quantity === existingProduct.quantity
          );

          if (isSameInstance) {
            return;
          }

          // Skip completed items if not included
          if (!settings.includeCompleted && existingProduct.isPurchased) {
            return;
          }

          const normalizedExistingName = this.normalizeProductName(existingProduct.name);
          const similarity = this.calculateSimilarity(normalizedCurrentName, normalizedExistingName);

          if (similarity >= settings.similarityThreshold) {
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(list.listData.createdAt).getTime()) / 
              (1000 * 60 * 60 * 24)
            );

            // Check if it's same list but different store
            if (list.listData.listId === currentListId && 
                settings.checkDifferentStores &&
                currentProduct.selectedStore && 
                existingProduct.selectedStore &&
                currentProduct.selectedStore !== existingProduct.selectedStore) {
              isDifferentStore = true;
            }

            matches.push({
              listName: list.listData.name,
              listId: list.listData.listId,
              quantity: existingProduct.quantity,
              units: existingProduct.units,
              isPurchased: existingProduct.isPurchased,
              daysAgo,
              productId: existingProduct.productId,
              selectedStore: existingProduct.selectedStore
            });
          }
        });
      });

      if (matches.length > 0) {
        let suggestedAction: DuplicateMatch['suggestedAction'] = 'warning';
        let confidence: DuplicateMatch['confidence'] = 'low';

        const recentMatches = matches.filter(m => m.daysAgo <= 7);
        const unpurchasedMatches = matches.filter(m => !m.isPurchased);
        const sameListMatches = matches.filter(m => m.listId === currentListId);

        // Special handling for different store scenario
        if (isDifferentStore) {
          suggestedAction = 'different-store';
          confidence = 'high';
        } else if (sameListMatches.length > 0) {
          confidence = 'high';
          suggestedAction = 'skip';
        } else if (recentMatches.length > 0) {
          confidence = 'high';
          if (unpurchasedMatches.length > 0) {
            suggestedAction = 'skip';
          } else {
            suggestedAction = 'reduce';
          }
        } else if (matches.length > 2) {
          confidence = 'medium';
          suggestedAction = 'reduce';
        }

        duplicates.push({
          productName: currentProduct.name,
          currentQuantity: currentProduct.quantity,
          currentUnits: currentProduct.units,
          currentStore: currentProduct.selectedStore,
          matches,
          suggestedAction,
          confidence,
          isDifferentStore
        });
      }
    });

    return duplicates.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }
      return b.matches.length - a.matches.length;
    });
  }

  public getDuplicateStats(duplicates: DuplicateMatch[]): {
    totalDuplicates: number;
    highConfidence: number;
    suggestedSkips: number;
    suggestedReductions: number;
    differentStores: number;
    potentialSavings: string;
  } {
    return {
      totalDuplicates: duplicates.length,
      highConfidence: duplicates.filter(d => d.confidence === 'high').length,
      suggestedSkips: duplicates.filter(d => d.suggestedAction === 'skip').length,
      suggestedReductions: duplicates.filter(d => d.suggestedAction === 'reduce').length,
      differentStores: duplicates.filter(d => d.isDifferentStore).length,
      potentialSavings: duplicates.length > 0 ? 'Avoid overbuying' : 'No duplicates found'
    };
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();