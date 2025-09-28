// Services for detecting duplicate products across shopping lists

export interface ProductSummary {
  name: string;
  quantity: number;
  units: string;
  listName: string;
  listId: string;
  isPurchased: boolean;
  createdAt: string;
  productId?: string; // Add this to help identify unique product instances
}

export interface DuplicateMatch {
  productName: string;
  currentQuantity: number;
  currentUnits: string;
  matches: Array<{
    listName: string;
    listId: string;
    quantity: number;
    units: string;
    isPurchased: boolean;
    daysAgo: number;
    productId?: string;
  }>;
  suggestedAction: 'reduce' | 'skip' | 'warning';
  confidence: 'high' | 'medium' | 'low';
}

export type ComparisonOption = 'last-1' | 'last-3' | 'last-5' | 'all' | 'custom';

export interface ComparisonSettings {
  option: ComparisonOption;
  customDays?: number;
  includeCompleted: boolean;
  similarityThreshold: number;
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
    
    // Sort by creation date (newest first)
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

  // 🔥 FIXED: Main duplicate detection method
  public detectDuplicates(
    currentProducts: ProductSummary[],
    allLists: Array<{ listData: any; products: ProductSummary[] }>,
    currentListId: string,
    settings: ComparisonSettings = {
      option: 'last-3',
      includeCompleted: false,
      similarityThreshold: 0.8
    }
  ): DuplicateMatch[] {
    console.log('🔍 Running duplicate detection with', currentProducts.length, 'current products');
    console.log('🔍 Checking against', allLists.length, 'total lists');
    
    const filteredLists = this.filterListsBySettings(allLists, currentListId, settings);
    console.log('🔍 After filtering, checking against', filteredLists.length, 'lists:', 
      filteredLists.map(l => `${l.listData.name} (${l.products.length} products)`));
    
    const duplicates: DuplicateMatch[] = [];

    currentProducts.forEach(currentProduct => {
      console.log('🔍 Checking product:', currentProduct.name);
      const normalizedCurrentName = this.normalizeProductName(currentProduct.name);
      const matches: DuplicateMatch['matches'] = [];

      filteredLists.forEach(list => {
        list.products.forEach(existingProduct => {
          // 🔥 FIXED: Better self-comparison logic
          // Skip if it's the exact same product instance (same ID if available, or same everything)
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
            console.log('⏭️ Skipping same product instance');
            return;
          }

          // Skip completed items if not included
          if (!settings.includeCompleted && existingProduct.isPurchased) {
            return;
          }

          const normalizedExistingName = this.normalizeProductName(existingProduct.name);
          const similarity = this.calculateSimilarity(normalizedCurrentName, normalizedExistingName);

          console.log(`🔍 Comparing "${currentProduct.name}" vs "${existingProduct.name}" in ${list.listData.name}: ${similarity.toFixed(2)} similarity`);

          if (similarity >= settings.similarityThreshold) {
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(list.listData.createdAt).getTime()) / 
              (1000 * 60 * 60 * 24)
            );

            console.log(`✅ Found duplicate: "${existingProduct.name}" in ${list.listData.name}`);

            matches.push({
              listName: list.listData.name,
              listId: list.listData.listId,
              quantity: existingProduct.quantity,
              units: existingProduct.units,
              isPurchased: existingProduct.isPurchased,
              daysAgo,
              productId: existingProduct.productId
            });
          }
        });
      });

      if (matches.length > 0) {
        console.log(`🎯 Product "${currentProduct.name}" has ${matches.length} matches`);
        
        // Determine suggestion and confidence
        let suggestedAction: DuplicateMatch['suggestedAction'] = 'warning';
        let confidence: DuplicateMatch['confidence'] = 'low';

        const recentMatches = matches.filter(m => m.daysAgo <= 7);
        const unpurchasedMatches = matches.filter(m => !m.isPurchased);
        const sameListMatches = matches.filter(m => m.listId === currentListId);

        // Higher confidence for same-list duplicates or recent duplicates
        if (sameListMatches.length > 0) {
          confidence = 'high';
          suggestedAction = 'skip'; // Definitely skip if it's in the same list
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
          matches,
          suggestedAction,
          confidence
        });
      }
    });

    console.log(`🎯 Final result: ${duplicates.length} duplicates found`);
    
    return duplicates.sort((a, b) => {
      // Sort by confidence (high first) then by number of matches
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }
      return b.matches.length - a.matches.length;
    });
  }

  // Get summary statistics
  public getDuplicateStats(duplicates: DuplicateMatch[]): {
    totalDuplicates: number;
    highConfidence: number;
    suggestedSkips: number;
    suggestedReductions: number;
    potentialSavings: string;
  } {
    return {
      totalDuplicates: duplicates.length,
      highConfidence: duplicates.filter(d => d.confidence === 'high').length,
      suggestedSkips: duplicates.filter(d => d.suggestedAction === 'skip').length,
      suggestedReductions: duplicates.filter(d => d.suggestedAction === 'reduce').length,
      potentialSavings: duplicates.length > 0 ? 'Avoid overbuying' : 'No duplicates found'
    };
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();