import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View, FlatList, Pressable, StyleSheet, Keyboard, Alert, KeyboardAvoidingView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { useColorScheme } from "react-native";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TextInput from "@/components/ui/text-input";
import { useAddProductWithNotifications } from "@/hooks/useAddProductWithNotifications";
import { useProducts, useProductPrices } from "@/hooks/useProducts";
import { DatabaseProduct, ProductPrice } from "@/services/productsApi";
import { Colors } from "@/constants/Colors";
import { HeaderTitle } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";


  // color scheme for styles

interface SelectedStoreInfo {
  store: string;
  price: number;
  priceId: number;
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
  const [queuedProducts, setQueuedProducts] = useState<Array<{
    name: string;
    quantity: number;
    notes: string;
    store?: string;
    price?: number;
    databaseProductId?: number;
    category?: string;
  }>>([]);

  const router = useRouter();
  // 🔔 UPDATED: Use helper hook with automatic notification support
  const addShoppingListProduct = useAddProductWithNotifications(listId);
  const { products, loading: productsLoading, searchProducts, hasProducts, isApiConfigured } = useProducts();
  const { prices, loading: pricesLoading } = useProductPrices(selectedProduct?.id || null);

  // Filter products based on the current name input
  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 2 || !hasProducts) return [];
    return searchProducts(name).slice(0, 8);
  }, [name, searchProducts, hasProducts]);

  // Show/hide suggestions based on input and results
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && name.length >= 2 && hasProducts);
  }, [suggestions, name, hasProducts]);

  // Reset store selection when product changes
  useEffect(() => {
    setSelectedStoreInfo(null);
    setShowStoreSelection(false);
  }, [selectedProduct]);

  const handleAddAnother = useCallback(() => {
    if (!name.trim()) return;

    // Add current product to queue
    const newProduct = {
      name: name.trim(),
      quantity,
      notes,
      store: selectedStoreInfo?.store,
      price: selectedStoreInfo?.price,
      databaseProductId: selectedProduct?.id,
      category: selectedProduct?.category,
    };

    setQueuedProducts(prev => [...prev, newProduct]);

    // Show success feedback
    Alert.alert(
      "Added to Queue",
      `"${name.trim()}" will be added to your list.`,
      [{ text: "OK" }]
    );

    // Reset form fields
    setName("");
    setQuantity(1);
    setNotes("");
    setSelectedProduct(null);
    setSelectedStoreInfo(null);
    setShowStoreSelection(false);
    setShowSuggestions(false);
  }, [name, quantity, notes, selectedStoreInfo, selectedProduct]);

  const handleRemoveFromQueue = useCallback((index: number) => {
    setQueuedProducts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateProduct = useCallback(async () => {
    if (!name.trim() && queuedProducts.length === 0) return;

    setAddingAnother(true);

    // Add current product to the list if form is filled
    const productsToAdd = [...queuedProducts];
    if (name.trim()) {
      productsToAdd.push({
        name: name.trim(),
        quantity,
        notes,
        store: selectedStoreInfo?.store,
        price: selectedStoreInfo?.price,
        databaseProductId: selectedProduct?.id,
        category: selectedProduct?.category,
      });
    }

    // Add all products
    let addedCount = 0;
    let duplicateCount = 0;

    for (const product of productsToAdd) {
      const productId = await addShoppingListProduct(
        product.name,
        product.quantity,
        "", // units - empty string since we removed this field
        product.notes || "",
        product.store || "",
        product.price || 0,
        product.databaseProductId || 0,
        product.category || ""
      );

      if (productId === null) {
        duplicateCount++;
      } else {
        addedCount++;
      }
    }

    // Show result
    if (addedCount > 0 && duplicateCount > 0) {
      Alert.alert(
        "Products Added",
        `${addedCount} product${addedCount !== 1 ? 's' : ''} added successfully.\n${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} detected. Check notifications.`,
        [{ text: "OK" }]
      );
    } else if (addedCount > 0) {
      Alert.alert(
        "Success!",
        `${addedCount} product${addedCount !== 1 ? 's' : ''} added to your list.`,
        [{ text: "OK" }]
      );
    } else if (duplicateCount > 0) {
      Alert.alert(
        "Duplicates Detected",
        `All products are already in your list. Check notifications for details.`,
        [{ text: "OK" }]
      );
    }

    setAddingAnother(false);
    router.back();
  }, [name, quantity, notes, selectedStoreInfo, selectedProduct, queuedProducts, addShoppingListProduct, router]);

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

    // color scheme for styles
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
            headerTitleStyle:{
              fontSize: queuedProducts.length > 0 ? 17 : 20,
              fontWeight: "600",
            },
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button
                variant="ghost"
                onPress={handleCreateProduct}
                disabled={(!name.trim() && queuedProducts.length === 0) || addingAnother}
                style={styles.headerButtonPrimary}
              >
                {addingAnother ? "Adding..." : queuedProducts.length > 0 ? `Add All (${queuedProducts.length + (name.trim() ? 1 : 0)})` : "Save"}
              </Button>
            </View>
          ),
          headerLeft: () => (
            <Button variant="ghost" onPress={router.back}>
              Cancel
            </Button>
          ),
        }}
      />
      
      <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={process.env.EXPO_OS !== 'ios' ? "padding" : "height"}
          keyboardVerticalOffset={process.env.EXPO_OS !== 'ios' ? insets.top + 10 : insets.top}>
      <BodyScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Queued Products Section */}
        {queuedProducts.length > 0 && (
          <View style={styles.queuedSection}>
            <View style={styles.queuedHeader}>
              <ThemedText type="defaultSemiBold" style={styles.queuedTitle}>
                Products to Add ({queuedProducts.length})
              </ThemedText>
              <ThemedText style={styles.queuedSubtitle}>
                These will be added to your list
              </ThemedText>
            </View>
            <View style={styles.queuedProductsContainer}>
              {queuedProducts.map((product, index) => (
                <View key={index} style={styles.queuedProductCard}>
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
                      onPress={() => handleRemoveFromQueue(index)}
                      style={styles.queuedProductRemove}
                    >
                      <IconSymbol name="xmark.circle.fill" color="#FF3B30" size={24} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Product Name Input with Suggestions */}
        <View style={styles.nameSection}>
          <View style={styles.nameInputContainer}>
            <TextInput
              label="Product Name"
              placeholder="Start typing product name..."
              value={name}
              onChangeText={handleNameChange}
              autoFocus={true}
              returnKeyType="done"
              containerStyle={styles.nameInput}
              onSubmitEditing={handleCreateProduct}
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
          
          {/* Selected Store Indicator */}
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

          {/* Product Suggestions */}
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

          {/* Store Selection */}
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
                    onPress={() => {
                      setShowStoreSelection(false);
                    }}
                  >
                    Continue without price
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Show info if API not configured */}
          {!isApiConfigured && name.length >= 2 && (
            <View style={styles.infoContainer}>
              <ThemedText type="default" style={styles.infoText}>
                💡 Configure your API to see product suggestions
              </ThemedText>
            </View>
          )}
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantitySection}>
          <ThemedText type="defaultSemiBold" style={styles.quantityLabel}>
            Quantity
          </ThemedText>
          <View style={styles.quantityControls}>
            <View style={styles.quantityDisplay}>
              <ThemedText type="title" style={styles.quantityText}>
                {quantity}
              </ThemedText>
              {selectedStoreInfo && (
                <ThemedText type="default" style={styles.totalPriceText}>
                  Total: ₱{(selectedStoreInfo.price * quantity).toFixed(2)}
                </ThemedText>
              )}
            </View>
            <View style={styles.quantityButtons}>
              <Button
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
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
                onPress={() => setQuantity(quantity + 1)}
                variant="ghost"
                style={styles.quantityButton}
              >
                <IconSymbol name="plus" color="#007AFF" size={24} />
              </Button>
            </View>
          </View>
        </View>

        {/* Notes Input */}
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

        {/* Android Add Buttons */}
        {Platform.OS !== "ios" && (
          <View style={styles.buttonContainer}>
            {name.trim() && (
              <Button
                onPress={handleAddAnother}
                disabled={addingAnother}
                variant="ghost"
                style={styles.addAnotherButton}
              >
                + Add to Queue
              </Button>
            )}
          </View>
        )}
        
      </BodyScrollView>
      </KeyboardAvoidingView>
    </View>
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

  // color scheme for styles
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
      marginBottom: 1,
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
    selectedProductBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 8,
      alignSelf: 'flex-start'
    },
    selectedText: {
      fontSize: 12,
      color: '#34C759',
      marginLeft: 4
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
      backgroundColor:colors.background
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
    inputRow: {
      marginBottom: 24
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
    quantityDisplay: {
      alignItems: 'center'
    },
    quantityText: {
      fontSize: 24,
      fontWeight: 'bold'
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
    addButton: {
      marginTop: 24,
    },
    addAnotherButton: {
      marginTop: 0,
      backgroundColor: 'black',
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
    headerButton: {
      paddingHorizontal: 8,
    },
    headerButtonPrimary: {
      paddingHorizontal: 8,
      fontWeight: '600',
    }
  });
}