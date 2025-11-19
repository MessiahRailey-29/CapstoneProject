import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View, FlatList, Pressable, StyleSheet, Keyboard, Alert, useColorScheme, KeyboardAvoidingView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TextInput from "@/components/ui/text-input";
import { useAddProductWithNotifications } from "@/hooks/useAddProductWithNotifications";
import { useProducts, useProductPrices } from "@/hooks/useProducts";
import { DatabaseProduct, ProductPrice } from "@/services/productsApi";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEnhancedDuplicateDetection } from '@/hooks/useEnhancedDuplicateDetection';
import DuplicateActionModal from '@/components/DuplicateActionModal';
import { ProductSummary } from '@/services/DuplicateDetectionService';
import { useShoppingListStore, useShoppingListProductIds } from '@/stores/ShoppingListStore';

interface SelectedStoreInfo {
  store: string;
  price: number;
  priceId: number;
}

interface QueuedProduct {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  store?: string;
  price?: number;
  databaseProductId?: number;
  category?: string;
}

export default function NewItemScreen() {
  const insets = useSafeAreaInsets();
  const { listId } = useLocalSearchParams() as { listId: string };
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);
  const [selectedStoreInfo, setSelectedStoreInfo] = useState<SelectedStoreInfo | null>(null);
  const [showStoreSelection, setShowStoreSelection] = useState(false);
  const [addingAnother, setAddingAnother] = useState(false);
  const [queuedProducts, setQueuedProducts] = useState<QueuedProduct[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState("1");
  const router = useRouter();
  const addShoppingListProduct = useAddProductWithNotifications(listId);
  const { products, loading: productsLoading, searchProducts, hasProducts, isApiConfigured } = useProducts();
  const { prices, loading: pricesLoading } = useProductPrices(selectedProduct?.id || null);

  // Enhanced duplicate detection setup
  const store = useShoppingListStore(listId);
  const productIds = useShoppingListProductIds(listId) || [];
  // Get current list products for duplicate checking
  const currentListProducts: ProductSummary[] = useMemo(() => {
    return productIds.map(productId => {
      const productName = store?.getCell('products', productId, 'name') as string || '';
      const productQuantity = store?.getCell('products', productId, 'quantity') as number || 0;
      const units = store?.getCell('products', productId, 'units') as string || '';
      const productStore = store?.getCell('products', productId, 'selectedStore') as string || '';
      const isPurchased = store?.getCell('products', productId, 'isPurchased') as boolean || false;
      const createdAt = store?.getCell('products', productId, 'createdAt') as string || '';
      
      return {
        name: productName,
        quantity: productQuantity,
        units,
        selectedStore: productStore,
        isPurchased,
        createdAt,
        listName: '',
        listId,
        productId,
      };
    }).filter(p => p.name);
  }, [productIds, store, listId]);

  // Initialize enhanced duplicate detection
  const {
    duplicateInfo,
    isModalVisible,
    checkForDuplicate,
    handleDuplicateAction,
  } = useEnhancedDuplicateDetection({
    currentListProducts,
    similarityThreshold: 0.8,
  });

  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 2 || !hasProducts) return [];
    return searchProducts(name).slice(0, 8);
  }, [name, searchProducts, hasProducts]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && name.length >= 2 && hasProducts);
  }, [suggestions, name, hasProducts]);

  useEffect(() => {
    setSelectedStoreInfo(null);
    setShowStoreSelection(false);
  }, [selectedProduct]);

  const handleAddAllToList = useCallback(async () => {
    if (!name.trim() && queuedProducts.length === 0) return;

    setAddingAnother(true);

    const productsToAdd = [...queuedProducts];
    if (name.trim()) {
      productsToAdd.push({
        id: Date.now().toString(),
        name: name.trim(),
        quantity,
        notes,
        store: selectedStoreInfo?.store,
        price: selectedStoreInfo?.price,
        databaseProductId: selectedProduct?.id,
        category: selectedProduct?.category,
      });
    }

    let addedCount = 0;
    let duplicateCount = 0;
    let mergedCount = 0;

    for (const product of productsToAdd) {
      try {
        // Check for duplicates with enhanced detection
        const action = await checkForDuplicate(
          product.name,
          product.quantity,
          '', // units - add if available in your QueuedProduct
          product.store || ''
        );

        console.log(`🔍 Duplicate check for "${product.name}": action = ${action}`);

        if (action === 'cancel') {
          console.log('❌ User cancelled adding product');
          continue; // Skip this product
        }

        if (action === 'discard') {
          console.log('🗑️ User chose to discard product');
          duplicateCount++;
          continue; // Skip this product
        }

        if (action === 'merge') {
          console.log('🔀 Attempting to merge product');
          // Find existing product and update its quantity
          const normalizedName = product.name.toLowerCase().trim();
          const existingProduct = currentListProducts.find(p => {
            const nameMatch = p.name.toLowerCase().trim() === normalizedName;
            // For merge, we want to merge even if stores are different
            return nameMatch;
          });

          if (existingProduct && existingProduct.productId) {
            const newQuantity = existingProduct.quantity + product.quantity;
            store?.setCell('products', existingProduct.productId, 'quantity', newQuantity);
            console.log(`✅ Merged: ${existingProduct.quantity} + ${product.quantity} = ${newQuantity}`);
            
            // If user merged different stores, update the store to show both or the new one
            if (product.store && existingProduct.selectedStore !== product.store) {
              // Optionally update to show merged stores or keep existing
              // store?.setCell('products', existingProduct.productId, 'selectedStore', product.store);
            }
            
            mergedCount++;
            continue;
          } else {
            console.log('⚠️ Could not find existing product to merge, adding as new');
            // If merge fails, fall through to add as new
          }
        }

        // For 'add-anyway' or when merge fails, add as new product
        console.log(`➕ Adding product as new: "${product.name}" from store: "${product.store || 'none'}"`);
        
        // When user explicitly chooses to add anyway, we should bypass duplicate detection
        // Option 1: Try the normal add first
        let productId = await addShoppingListProduct(
          product.name,
          product.quantity,
          "",
          product.notes || "",
          product.store || "",
          product.price || 0,
          product.databaseProductId || 0,
          product.category || ""
        );

        console.log(`📝 Product ID returned: ${productId}`);

        // If it returned null but user chose add-anyway, add directly to store
        if (productId === null && action === 'add-anyway' && store) {
          console.log('🔧 Bypassing duplicate check - adding directly to store');
          const newProductId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          store.setRow('products', newProductId, {
            name: product.name,
            quantity: product.quantity,
            category: product.category || '',
            notes: product.notes || '',
            selectedStore: product.store || '',
            selectedPrice: product.price || 0,
            isPurchased: false,
            createdAt: new Date().toISOString(),
            units: '', // Add default units if needed
          });
          
          productId = newProductId;
          console.log(`✅ Product added directly with ID: ${productId}`);
        }

        if (productId === null) {
          console.log('⚠️ addShoppingListProduct returned null - may indicate internal duplicate detection');
          duplicateCount++;
        } else {
          console.log(`✅ Product added successfully with ID: ${productId}`);
          addedCount++;
        }
      } catch (error) {
        console.error('❌ Error adding product:', error);
        duplicateCount++;
      }
    }

    // Show summary alert
    if (addedCount > 0 || mergedCount > 0 || duplicateCount > 0) {
      const messages = [];
      if (addedCount > 0) {
        messages.push(`${addedCount} product${addedCount !== 1 ? 's' : ''} added`);
      }
      if (mergedCount > 0) {
        messages.push(`${mergedCount} product${mergedCount !== 1 ? 's' : ''} merged`);
      }
      if (duplicateCount > 0) {
        messages.push(`${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} skipped`);
      }

      if (messages.length > 0) {
        Alert.alert(
          "Products Processed",
          messages.join('\n'),
          [{ text: "OK" }]
        );
      }
    }

    setAddingAnother(false);
    router.back();
  }, [name, quantity, notes, selectedStoreInfo, selectedProduct, queuedProducts, addShoppingListProduct, router, checkForDuplicate, currentListProducts, store]);

  const handleCancel = useCallback(() => {
    const hasUnsavedData = name.trim() !== "" || queuedProducts.length > 0;
    
    if (hasUnsavedData) {
      Alert.alert(
        "Unsaved Changes",
        queuedProducts.length > 0 
          ? `You have ${queuedProducts.length} product${queuedProducts.length !== 1 ? 's' : ''} in queue. What would you like to do?`
          : "You have unsaved product details. What would you like to do?",
        [
          {
            text: "Discard All",
            style: "destructive",
            onPress: () => router.back()
          },
          {
            text: "Save Anyway",
            onPress: handleAddAllToList
          },
          {
            text: "Continue Editing",
            style: "cancel"
          }
        ]
      );
    } else {
      router.back();
    }
  }, [name, queuedProducts, router, handleAddAllToList]);

  const handleAddToQueue = useCallback(() => {
    if (!name.trim()) return;

    const newProduct: QueuedProduct = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity,
      notes,
      store: selectedStoreInfo?.store,
      price: selectedStoreInfo?.price,
      databaseProductId: selectedProduct?.id,
      category: selectedProduct?.category,
    };

    setQueuedProducts(prev => [...prev, newProduct]);

    setName("");
    setQuantity(1);
    setNotes("");
    setSelectedProduct(null);
    setSelectedStoreInfo(null);
    setShowStoreSelection(false);
    setShowSuggestions(false);
  }, [name, quantity, notes, selectedStoreInfo, selectedProduct]);

  const handleEditProduct = useCallback((productId: string) => {
    setEditingProductId(productId);
  }, []);

  const handleUpdateProduct = useCallback((productId: string, updates: Partial<QueuedProduct>) => {
    setQueuedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, ...updates } : p)
    );
  }, []);

  const handleSaveEdit = useCallback((productId: string) => {
    setEditingProductId(null);
  }, []);

  const handleRemoveFromQueue = useCallback((productId: string) => {
    setQueuedProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const handleProductSelect = useCallback((product: DatabaseProduct) => {
    setName(product.name);
    setSelectedProduct(product);
    setShowSuggestions(false);
    setShowStoreSelection(true);
    Keyboard.dismiss();
  }, []);

  const handleStoreSelect = useCallback((price: ProductPrice) => {
    setSelectedStoreInfo({
      store: price.store,
      price: price.price,
      priceId: price.id
    });
    setShowStoreSelection(false);
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    setSelectedProduct(null);
    setSelectedStoreInfo(null);

    if (!text.trim()) {
      setShowSuggestions(false);
    }
  }, []);

  const handleDismissSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setShowStoreSelection(false);
    Keyboard.dismiss();
  }, []);

  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  return (
    <View style={{backgroundColor: colors.mainBackground, flex: 1}}>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle: queuedProducts.length > 0 
            ? `Add product (${queuedProducts.length} queued)` 
            : "Add product",
          headerTitleStyle: {
            fontSize: queuedProducts.length > 0 ? 17 : 20,
            fontWeight: "600",
          },
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button
                variant="ghost"
                onPress={handleAddAllToList}
                disabled={(!name.trim() && queuedProducts.length === 0) || addingAnother}
                style={styles.headerButtonPrimary}
              >
                {addingAnother ? "Adding..." : queuedProducts.length > 0 ? `Add All (${queuedProducts.length + (name.trim() ? 1 : 0)})` : "Save"}
              </Button>
            </View>
          ),
          headerLeft: () => (
            <Button variant="ghost" onPress={handleCancel}>
              Cancel
            </Button>
          ),
        }}
      />
      
      <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={process.env.EXPO_OS !== 'ios' ? "padding" : null }
          keyboardVerticalOffset={process.env.EXPO_OS !== 'ios' ? insets.top + 60 : 0}>
      <BodyScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
          {queuedProducts.length > 0 && (
            <View style={styles.queuedSection}>
              <View style={styles.queuedHeader}>
                <ThemedText type="defaultSemiBold" style={styles.queuedTitle}>
                  Products to Add ({queuedProducts.length})
                </ThemedText>
                <ThemedText style={styles.queuedSubtitle}>
                  Tap any item to edit
                </ThemedText>
              </View>
              <View style={styles.queuedProductsContainer}>
                {queuedProducts.map((product) => (
                  <QueuedProductCard
                    key={product.id}
                    product={product}
                    isEditing={editingProductId === product.id}
                    onEdit={() => handleEditProduct(product.id)}
                    onUpdate={(updates) => handleUpdateProduct(product.id, updates)}
                    onSave={() => handleSaveEdit(product.id)}
                    onRemove={() => handleRemoveFromQueue(product.id)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.nameSection}>
            <View style={styles.nameInputContainer}>
              <TextInput
                label="Product Name"
                placeholder="Start typing product name..."
                value={name}
                onChangeText={handleNameChange}
                autoFocus={queuedProducts.length === 0}
                returnKeyType="done"
                containerStyle={styles.nameInput}
                onSubmitEditing={handleAddToQueue}
              />
              {(showSuggestions || showStoreSelection) && (
                <Pressable
                  style={styles.dismissButton}
                  onPress={handleDismissSuggestions}
                >
                  <IconSymbol name="xmark.circle.fill" color="#999" size={20} />
                </Pressable>
              )}
            </View>
          
            {selectedStoreInfo && (
              <View style={styles.selectedStoreBadge}>
                <IconSymbol name="storefront" color="#007AFF" size={16} />
                <ThemedText type="default" style={styles.selectedStoreText}>
                  {selectedStoreInfo.store} • ₱{selectedStoreInfo.price.toFixed(2)}
                </ThemedText>
                <Pressable
                  onPress={() => setShowStoreSelection(true)}
                  style={styles.changeStoreButton}
                >
                  <ThemedText type="default" style={styles.changeStoreText}>
                    Change
                  </ThemedText>
                </Pressable>
              </View>
            )}

            {showSuggestions && !productsLoading && hasProducts && (
              <View style={styles.suggestionsContainer}>
                <ThemedText type="defaultSemiBold" style={styles.suggestionsHeader}>
                  Product Suggestions
                </ThemedText>
                <FlatList
                  data={suggestions}
                  renderItem={({ item }) => (
                    <ProductSuggestionItem
                      product={item}
                      onSelect={handleProductSelect}
                      searchQuery={name}
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            {showStoreSelection && selectedProduct && (
              <View style={styles.suggestionsContainer}>
                <ThemedText type="defaultSemiBold" style={styles.suggestionsHeader}>
                  Choose Store & Price
                </ThemedText>
                {pricesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ThemedText>Loading prices...</ThemedText>
                  </View>
                ) : prices.length > 0 ? (
                  <FlatList
                    data={prices}
                    renderItem={({ item }) => (
                      <StoreSelectionItem
                        price={item}
                        onSelect={handleStoreSelect}
                        isSelected={selectedStoreInfo?.priceId === item.id}
                      />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noPricesContainer}>
                    <ThemedText style={styles.noPricesText}>
                      No prices available for this product
                    </ThemedText>
                    <Button
                      variant="ghost"
                      onPress={() => setShowStoreSelection(false)}
                    >
                      Continue without price
                    </Button>
                  </View>
                )}
              </View>
            )}

            {!isApiConfigured && name.length >= 2 && (
              <View style={styles.infoContainer}>
                <ThemedText type="default" style={styles.infoText}>
                  💡 Configure your API to see product suggestions
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.quantitySection}>
            <ThemedText type="defaultSemiBold" style={styles.quantityLabel}>
              Quantity
            </ThemedText>
            <View style={styles.quantityControls}>
              <View style={styles.quantityInputWrapper}>
                <TextInput
                  value={quantityInput}
                  onChangeText={(text) => {
                    setQuantityInput(text);
                    
                    if (text === '') {
                      return;
                    }
                    const num = parseInt(text);
                    if (!isNaN(num) && num > 0) {
                      setQuantity(num);
                    }
                  }}
                  onBlur={() => {
                    if (quantityInput === '' || parseInt(quantityInput) < 1) {
                      setQuantityInput('1');
                      setQuantity(1);
                    }
                  }}
                  keyboardType="numeric"
                  containerStyle={styles.quantityInputContainer}
                  inputStyle={styles.quantityInputText}
                  placeholder="1"
                  selectTextOnFocus={true}
                />
                {selectedStoreInfo && (
                  <ThemedText type="default" style={styles.totalPriceText}>
                    Total: ₱{(selectedStoreInfo.price * quantity).toFixed(2)}
                  </ThemedText>
                )}
              </View>
              <View style={styles.quantityButtons}>
                <Button
                  onPress={() => {
                    const newQty = Math.max(1, quantity - 1);
                    setQuantity(newQty);
                    setQuantityInput(newQty.toString());
                  }}
                  variant="ghost"
                  style={styles.quantityButton}
                  disabled={quantity <= 1}
                >
                  <IconSymbol
                    name="minus"
                    color={quantity <= 1 ? "#ccc" : "#007AFF"}
                    size={24}
                  />
                </Button>
                <Button
                  onPress={() => {
                    const newQty = quantity + 1;
                    setQuantity(newQty);
                    setQuantityInput(newQty.toString());
                  }}
                  variant="ghost"
                  style={styles.quantityButton}
                >
                  <IconSymbol name="plus" color="#007AFF" size={24} />
                </Button>
              </View>
            </View>
          </View>

          <TextInput
            label="Notes (Optional)"
            placeholder="Add any additional notes..."
            textAlignVertical="top"
            value={notes}
            multiline={true}
            numberOfLines={3}
            inputStyle={styles.notesInput}
            onChangeText={setNotes}
          />

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleAddToQueue}
              disabled={!name.trim() || addingAnother}
              variant="ghost"
              style={styles.addToQueueButton}
            >
              + Add to Queue
            </Button>
          </View>
        </BodyScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Duplicate Detection Modal */}
      <DuplicateActionModal
        visible={isModalVisible}
        duplicateInfo={duplicateInfo}
        onAction={handleDuplicateAction}
      />
    </View>
  );
}

function QueuedProductCard({
  product,
  isEditing,
  onEdit,
  onUpdate,
  onSave,
  onRemove,
  colors
}: {
  product: QueuedProduct;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<QueuedProduct>) => void;
  onSave: () => void;
  onRemove: () => void;
  colors: typeof Colors.light;
}) {
  const styles = createStyles(colors);
  const [editName, setEditName] = useState(product.name);
  const [showEditSuggestions, setShowEditSuggestions] = useState(false);
  const [showEditStoreSelection, setShowEditStoreSelection] = useState(false);
  const [editSelectedProduct, setEditSelectedProduct] = useState<DatabaseProduct | null>(
    product.databaseProductId ? { id: product.databaseProductId, name: product.name, category: product.category || '' } as DatabaseProduct : null
  );
  const [editSelectedStoreInfo, setEditSelectedStoreInfo] = useState<SelectedStoreInfo | null>(
    product.store && product.price ? { store: product.store, price: product.price, priceId: 0 } : null
  );

  const { searchProducts, hasProducts } = useProducts();
  const { prices: editPrices, loading: editPricesLoading } = useProductPrices(editSelectedProduct?.id || null);

  const editSuggestions = useMemo(() => {
    if (!editName.trim() || editName.length < 2 || !hasProducts) return [];
    return searchProducts(editName).slice(0, 8);
  }, [editName, searchProducts, hasProducts]);

  useEffect(() => {
    if (isEditing) {
      setShowEditSuggestions(editSuggestions.length > 0 && editName.length >= 2 && hasProducts);
    }
  }, [editSuggestions, editName, hasProducts, isEditing]);

  const handleEditProductSelect = (selectedProd: DatabaseProduct) => {
    setEditName(selectedProd.name);
    setEditSelectedProduct(selectedProd);
    setShowEditSuggestions(false);
    setShowEditStoreSelection(true);
    onUpdate({ 
      name: selectedProd.name, 
      databaseProductId: selectedProd.id,
      category: selectedProd.category 
    });
  };

  const handleEditStoreSelect = (price: ProductPrice) => {
    setEditSelectedStoreInfo({
      store: price.store,
      price: price.price,
      priceId: price.id
    });
    setShowEditStoreSelection(false);
    onUpdate({ 
      store: price.store, 
      price: price.price 
    });
  };

  const handleEditNameChange = (text: string) => {
    setEditName(text);
    setEditSelectedProduct(null);
    setEditSelectedStoreInfo(null);
    onUpdate({ name: text, databaseProductId: undefined, store: undefined, price: undefined });
  };

  if (isEditing) {
    return (
      <View style={styles.queuedProductCard}>
        <View style={styles.editingContainer}>
          <View style={styles.editNameContainer}>
            <TextInput
              label="Product Name"
              value={editName}
              onChangeText={handleEditNameChange}
              containerStyle={styles.editInput}
            />
            {(showEditSuggestions || showEditStoreSelection) && (
              <Pressable
                style={styles.editDismissButton}
                onPress={() => {
                  setShowEditSuggestions(false);
                  setShowEditStoreSelection(false);
                }}
              >
                <IconSymbol name="xmark.circle.fill" color="#999" size={18} />
              </Pressable>
            )}
          </View>

          {editSelectedStoreInfo && !showEditStoreSelection && (
            <View style={styles.editStoreBadge}>
              <IconSymbol name="storefront" color="#007AFF" size={14} />
              <ThemedText type="default" style={styles.editStoreText}>
                {editSelectedStoreInfo.store} • ₱{editSelectedStoreInfo.price.toFixed(2)}
              </ThemedText>
              <Pressable
                onPress={() => setShowEditStoreSelection(true)}
                style={styles.editChangeStoreButton}
              >
                <ThemedText type="default" style={styles.editChangeStoreText}>
                  Change
                </ThemedText>
              </Pressable>
            </View>
          )}

          {showEditSuggestions && hasProducts && (
            <View style={styles.editSuggestionsContainer}>
              <ThemedText type="defaultSemiBold" style={styles.editSuggestionsHeader}>
                Product Suggestions
              </ThemedText>
              <View style={styles.editSuggestionsList}>
                {editSuggestions.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.editSuggestionItem}
                    onPress={() => handleEditProductSelect(item)}
                  >
                    <View style={styles.editSuggestionContent}>
                      <ThemedText type="defaultSemiBold" style={styles.editSuggestionName}>
                        {item.name}
                      </ThemedText>
                      <ThemedText type="default" style={styles.editSuggestionCategory}>
                        {item.category}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" color="#007AFF" size={20} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {showEditStoreSelection && editSelectedProduct && (
            <View style={styles.editSuggestionsContainer}>
              <ThemedText type="defaultSemiBold" style={styles.editSuggestionsHeader}>
                Choose Store & Price
              </ThemedText>
              {editPricesLoading ? (
                <View style={styles.editLoadingContainer}>
                  <ThemedText style={styles.editLoadingText}>Loading prices...</ThemedText>
                </View>
              ) : editPrices.length > 0 ? (
                <View style={styles.editSuggestionsList}>
                  {editPrices.map((price) => (
                    <Pressable
                      key={price.id}
                      style={[
                        styles.editStoreItem,
                        editSelectedStoreInfo?.priceId === price.id && styles.editStoreItemSelected
                      ]}
                      onPress={() => handleEditStoreSelect(price)}
                    >
                      <View style={styles.editStoreContent}>
                        <View style={styles.editStoreMain}>
                          <ThemedText type="defaultSemiBold" style={styles.editStoreName}>
                            {price.store}
                          </ThemedText>
                          <ThemedText type="title" style={styles.editStorePrice}>
                            ₱{price.price.toFixed(2)}
                          </ThemedText>
                        </View>
                        {editSelectedStoreInfo?.priceId === price.id && (
                          <IconSymbol name="checkmark.circle.fill" color="#34C759" size={18} />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.editNoPricesContainer}>
                  <ThemedText style={styles.editNoPricesText}>
                    No prices available
                  </ThemedText>
                  <Button
                    variant="ghost"
                    onPress={() => setShowEditStoreSelection(false)}
                  >
                    Continue without price
                  </Button>
                </View>
              )}
            </View>
          )}

          <View style={styles.editQuantityRow}>
            <ThemedText type="defaultSemiBold" style={styles.editLabel}>
              Quantity
            </ThemedText>
            <View style={styles.editQuantityControls}>
              <Button
                onPress={() => onUpdate({ quantity: Math.max(1, product.quantity - 1) })}
                variant="ghost"
                style={styles.editQuantityButton}
                disabled={product.quantity <= 1}
              >
                <IconSymbol
                  name="minus"
                  color={product.quantity <= 1 ? "#ccc" : "#007AFF"}
                  size={20}
                />
              </Button>
              <ThemedText type="defaultSemiBold" style={styles.editQuantityText}>
                {product.quantity}
              </ThemedText>
              <Button
                onPress={() => onUpdate({ quantity: product.quantity + 1 })}
                variant="ghost"
                style={styles.editQuantityButton}
              >
                <IconSymbol name="plus" color="#007AFF" size={20} />
              </Button>
            </View>
          </View>
          <TextInput
            label="Notes"
            value={product.notes}
            onChangeText={(text) => onUpdate({ notes: text })}
            multiline
            numberOfLines={2}
            containerStyle={styles.editInput}
          />
          <View style={styles.editActions}>
            <Button
              onPress={onSave}
              variant="ghost"
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={styles.queuedProductCard}
      onPress={onEdit}
    >
      <View style={styles.queuedProductContent}>
        <View style={styles.queuedProductMain}>
          <ThemedText type="defaultSemiBold" style={styles.queuedProductName}>
            {product.name}
          </ThemedText>
          <View style={styles.queuedProductDetails}>
            <ThemedText style={styles.queuedProductDetail}>
              Qty: {product.quantity}
            </ThemedText>
            {product.store && (
              <>
                <ThemedText style={styles.queuedProductSeparator}>•</ThemedText>
                <ThemedText style={styles.queuedProductDetail}>
                  {product.store}
                </ThemedText>
              </>
            )}
            {product.price && (
              <>
                <ThemedText style={styles.queuedProductSeparator}>•</ThemedText>
                <ThemedText style={styles.queuedProductPrice}>
                  ₱{(product.price * product.quantity).toFixed(2)}
                </ThemedText>
              </>
            )}
          </View>
          {product.notes && (
            <ThemedText style={styles.queuedProductNotes} numberOfLines={1}>
              📝 {product.notes}
            </ThemedText>
          )}
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={styles.queuedProductRemove}
        >
          <IconSymbol name="xmark.circle.fill" color="#FF3B30" size={24} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function ProductSuggestionItem({
  product,
  onSelect,
  searchQuery
}: {
  product: DatabaseProduct;
  onSelect: (product: DatabaseProduct) => void;
  searchQuery: string;
}) {
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    return (
      <>
        {text.substring(0, index)}
        <ThemedText style={styles.highlightedText}>
          {text.substring(index, index + query.length)}
        </ThemedText>
        {text.substring(index + query.length)}
      </>
    );
  };

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  return (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => onSelect(product)}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionMain}>
          <ThemedText type="defaultSemiBold" style={styles.suggestionName}>
            {highlightText(product.name, searchQuery)}
          </ThemedText>
          <ThemedText type="default" style={styles.suggestionCategory}>
            {product.category}
          </ThemedText>
        </View>
        <IconSymbol name="chevron.right" color="#007AFF" size={25} />
      </View>
    </Pressable>
  );
}

function StoreSelectionItem({
  price,
  onSelect,
  isSelected
}: {
  price: ProductPrice;
  onSelect: (price: ProductPrice) => void;
  isSelected: boolean;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  if (!price || typeof price.price !== 'number') {
    console.warn('⚠️ Invalid price data:', price);
    return null;
  }

  return (
    <Pressable
      style={[styles.storeItem, isSelected && styles.storeItemSelected]}
      onPress={() => onSelect(price)}
    >
      <View style={styles.storeContent}>
        <View style={styles.storeMain}>
          <ThemedText type="defaultSemiBold" style={styles.storeName}>
            {price.store || 'Unknown Store'}
          </ThemedText>
          <ThemedText type="title" style={styles.storePrice}>
            ₱{price.price.toFixed(2)}
          </ThemedText>
        </View>
        {isSelected && (
          <IconSymbol name="checkmark.circle.fill" color="#34C759" size={20} />
        )}
      </View>
    </Pressable>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.mainBackground,
      paddingBottom: 130
    },
    queuedSection: {
      marginBottom: 24,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      padding: 16,
    },
    queuedHeader: {
      marginBottom: 12,
    },
    queuedTitle: {
      fontSize: 16,
      marginBottom: 4,
    },
    queuedSubtitle: {
      fontSize: 12,
      color: '#666',
    },
    queuedProductsContainer: {
      gap: 8,
    },
    queuedProductCard: {
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5EA',
      padding: 12,
    },
    queuedProductContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    queuedProductMain: {
      flex: 1,
      marginRight: 8,
    },
    queuedProductName: {
      fontSize: 15,
      marginBottom: 4,
    },
    queuedProductDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
    },
    queuedProductDetail: {
      fontSize: 13,
      color: '#666',
    },
    queuedProductSeparator: {
      fontSize: 13,
      color: '#CCC',
    },
    queuedProductPrice: {
      fontSize: 13,
      color: '#007AFF',
      fontWeight: '600',
    },
    queuedProductNotes: {
      fontSize: 12,
      color: '#999',
      marginTop: 4,
      fontStyle: 'italic',
    },
    queuedProductRemove: {
      padding: 4,
    },
    editingContainer: {
      gap: 12,
    },
    editInput: {
      marginBottom: 0,
    },
    editQuantityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editLabel: {
      fontSize: 14,
    },
    editQuantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    editQuantityButton: {
      padding: 4,
      minWidth: 32,
    },
    editQuantityText: {
      fontSize: 18,
      minWidth: 30,
      textAlign: 'center',
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    saveButton: {
      paddingHorizontal: 16,
    },
    editNameContainer: {
      position: 'relative',
    },
    editDismissButton: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      zIndex: 1
    },
    editStoreBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0F8FF',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: 'flex-start'
    },
    editStoreText: {
      fontSize: 11,
      color: '#007AFF',
      marginLeft: 4,
    },
    editChangeStoreButton: {
      marginLeft: 8,
      paddingHorizontal: 6,
      paddingVertical: 2
    },
    editChangeStoreText: {
      fontSize: 10,
      color: '#007AFF',
      textDecorationLine: 'underline'
    },
    editSuggestionsContainer: {
      backgroundColor: '#F9F9F9',
      borderRadius: 8,
      padding: 10,
    },
    editSuggestionsHeader: {
      fontSize: 12,
      marginBottom: 6,
      color: '#666'
    },
    editSuggestionsList: {
      gap: 6,
    },
    editSuggestionItem: {
      backgroundColor: colors.background,
      borderRadius: 6,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 0.5,
      borderColor: colors.borderColor,
    },
    editSuggestionContent: {
      flex: 1,
    },
    editSuggestionName: {
      fontSize: 13,
      marginBottom: 2,
    },
    editSuggestionCategory: {
      fontSize: 11,
      color: '#666',
    },
    editLoadingContainer: {
      padding: 15,
      alignItems: 'center'
    },
    editLoadingText: {
      fontSize: 12,
      color: '#666',
    },
    editStoreItem: {
      backgroundColor: colors.background,
      borderRadius: 6,
      padding: 12,
      borderWidth: 1.5,
      borderColor: 'transparent'
    },
    editStoreItemSelected: {
      borderColor: '#34C759',
      backgroundColor: '#F0FFF0'
    },
    editStoreContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    editStoreMain: {
      flex: 1,
    },
    editStoreName: {
      fontSize: 13,
      marginBottom: 2,
    },
    editStorePrice: {
      fontSize: 15,
      color: '#007AFF'
    },
    editNoPricesContainer: {
      padding: 15,
      alignItems: 'center'
    },
    editNoPricesText: {
      fontSize: 11,
      color: '#666',
      marginBottom: 8,
      textAlign: 'center'
    },
    nameSection: {
      marginBottom: 24
    },
    nameInputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      position: 'relative',
    },
    nameInput: {
      flex: 1,
      marginBottom: 0
    },
    dismissButton: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      zIndex: 1
    },
    selectedStoreBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 6,
      alignSelf: 'flex-start'
    },
    selectedStoreText: {
      fontSize: 12,
      color: '#007AFF',
      marginLeft: 4,
      flex: 1
    },
    changeStoreButton: {
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 2
    },
    changeStoreText: {
      fontSize: 10,
      color: '#007AFF',
      textDecorationLine: 'underline'
    },
    suggestionsContainer: {
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
    },
    suggestionsHeader: {
      fontSize: 14,
      marginBottom: 8,
      color: '#666'
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center'
    },
    noPricesContainer: {
      padding: 20,
      alignItems: 'center'
    },
    noPricesText: {
      marginBottom: 12,
      color: '#666',
      textAlign: 'center'
    },
    infoContainer: {
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#007AFF'
    },
    infoText: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center'
    },
    suggestionItem: {
      backgroundColor: colors.background,
      borderColor: colors.borderColor,
      borderWidth: 0.8,
      borderRadius: 8,
      marginBottom: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    suggestionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12
    },
    suggestionMain: {
      flex: 1
    },
    suggestionName: {
      fontSize: 15,
      marginBottom: 2
    },
    suggestionCategory: {
      fontSize: 12,
      color: colors.text
    },
    storeItem: {
      backgroundColor: 'white',
      borderRadius: 8,
      marginBottom: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 2,
      borderColor: 'transparent'
    },
    storeItemSelected: {
      borderColor: '#34C759',
      backgroundColor: '#F0FFF0'
    },
    storeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.background
    },
    storeMain: {
      flex: 1
    },
    storeName: {
      fontSize: 16,
      marginBottom: 4
    },
    storePrice: {
      fontSize: 18,
      color: '#007AFF'
    },
    highlightedText: {
      backgroundColor: '#FFE066',
      fontWeight: 'bold'
    },
    quantitySection: {
      marginBottom: 24
    },
    quantityLabel: {
      marginBottom: 12
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderWidth: 0.5,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      padding: 16
    },
    quantityInputWrapper: {
      alignItems: 'center',
      flex: 1,
    },
    quantityInputContainer: {
      width: 100,
      marginBottom: 0,
    },
    quantityInputText: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 8,
    },
    quantityText: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    totalPriceText: {
      fontSize: 12,
      color: '#007AFF',
      marginTop: 4,
      fontWeight: '600'
    },
    quantityButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    quantityButton: {
      borderRadius: 100,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#007AFF',
      padding: 4
    },
    notesInput: {
      height: 80,
      textAlignVertical: 'top',
      borderColor: colors.borderColor,
      borderWidth: 0.5,
      borderRadius: 15,
    },
    addToQueueButton: {
      marginTop: 0,
      backgroundColor: colors.background,
      borderColor: '#34C759',
      borderWidth: 1
    },
    buttonContainer: {
      marginTop: 24,
      gap: 12,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    headerButtonPrimary: {
      paddingHorizontal: 8,
      fontWeight: '600',
    }
  });
}