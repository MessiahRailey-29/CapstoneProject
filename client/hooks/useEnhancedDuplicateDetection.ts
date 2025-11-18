// hooks/useEnhancedDuplicateDetection.ts
import { useState, useCallback } from 'react';
import { duplicateDetectionService, ProductSummary } from '@/services/DuplicateDetectionService';
import { DuplicateInfo, DuplicateActionType } from '@/components/DuplicateActionModal';

interface UseEnhancedDuplicateDetectionProps {
  currentListProducts: ProductSummary[];
  similarityThreshold?: number;
}

export function useEnhancedDuplicateDetection({
  currentListProducts,
  similarityThreshold = 0.8,
}: UseEnhancedDuplicateDetectionProps) {
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<{
    name: string;
    quantity: number;
    units: string;
    selectedStore?: string;
    resolve: (action: DuplicateActionType) => void;
  } | null>(null);

  /**
   * Check if a product being added has a duplicate with a different store
   */
  const checkForDifferentStore = useCallback((
    productName: string,
    quantity: number,
    units: string,
    selectedStore?: string
  ): Promise<DuplicateActionType> => {
    return new Promise((resolve) => {
      const result = duplicateDetectionService.checkSameListDifferentStore(
        productName,
        selectedStore,
        currentListProducts,
        similarityThreshold
      );

      if (result.found && result.existingProduct) {
        const info: DuplicateInfo = {
          productName,
          existingQuantity: result.existingProduct.quantity,
          newQuantity: quantity,
          units,
          existingStore: result.existingProduct.selectedStore,
          newStore: selectedStore,
          isDifferentStore: true,
        };

        setDuplicateInfo(info);
        setIsModalVisible(true);
        setPendingProduct({ name: productName, quantity, units, selectedStore, resolve });
      } else {
        // No different store duplicate found
        resolve('add-anyway');
      }
    });
  }, [currentListProducts, similarityThreshold]);

  /**
   * Check for regular duplicates (same product, might be same store)
   */
  const checkForDuplicate = useCallback((
    productName: string,
    quantity: number,
    units: string,
    selectedStore?: string
  ): Promise<DuplicateActionType> => {
    return new Promise((resolve) => {
      // First check for different store scenario
      const storeResult = duplicateDetectionService.checkSameListDifferentStore(
        productName,
        selectedStore,
        currentListProducts,
        similarityThreshold
      );

      if (storeResult.found && storeResult.existingProduct) {
        const info: DuplicateInfo = {
          productName,
          existingQuantity: storeResult.existingProduct.quantity,
          newQuantity: quantity,
          units,
          existingStore: storeResult.existingProduct.selectedStore,
          newStore: selectedStore,
          isDifferentStore: true,
        };

        setDuplicateInfo(info);
        setIsModalVisible(true);
        setPendingProduct({ name: productName, quantity, units, selectedStore, resolve });
        return;
      }

      // Check for regular duplicates
      const normalizedName = productName.toLowerCase().trim();
      const existingProduct = currentListProducts.find(product => {
        const normalizedExisting = product.name.toLowerCase().trim();
        return normalizedExisting === normalizedName && 
               (!selectedStore || !product.selectedStore || product.selectedStore === selectedStore);
      });

      if (existingProduct) {
        const info: DuplicateInfo = {
          productName,
          existingQuantity: existingProduct.quantity,
          newQuantity: quantity,
          units,
          existingStore: existingProduct.selectedStore,
          newStore: selectedStore,
          isDifferentStore: false,
        };

        setDuplicateInfo(info);
        setIsModalVisible(true);
        setPendingProduct({ name: productName, quantity, units, selectedStore, resolve });
      } else {
        // No duplicate found
        resolve('add-anyway');
      }
    });
  }, [currentListProducts, similarityThreshold]);

  /**
   * Handle user's choice from the modal
   */
  const handleDuplicateAction = useCallback((action: DuplicateActionType) => {
    if (pendingProduct) {
      pendingProduct.resolve(action);
      setPendingProduct(null);
    }
    setIsModalVisible(false);
    setDuplicateInfo(null);
  }, [pendingProduct]);

  /**
   * Reset modal state
   */
  const resetModal = useCallback(() => {
    if (pendingProduct) {
      pendingProduct.resolve('cancel');
      setPendingProduct(null);
    }
    setIsModalVisible(false);
    setDuplicateInfo(null);
  }, [pendingProduct]);

  return {
    // State
    duplicateInfo,
    isModalVisible,
    
    // Methods
    checkForDifferentStore,
    checkForDuplicate,
    handleDuplicateAction,
    resetModal,
  };
}