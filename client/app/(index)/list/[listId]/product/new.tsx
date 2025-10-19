import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View, FlatList, Pressable, StyleSheet, Keyboard, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TextInput from "@/components/ui/text-input";
import { useAddProductWithNotifications } from "@/hooks/useAddProductWithNotifications";
import { useProducts, useProductPrices } from "@/hooks/useProducts";
import { DatabaseProduct, ProductPrice } from "@/services/productsApi";

interface SelectedStoreInfo {
  store: string;
  price: number;
  priceId: number;
}

export default function NewItemScreen() {
  const { listId } = useLocalSearchParams() as { listId: string };
  const [name, setName] = useState("");
  const [units, setUnits] = useState("kg");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);
  const [selectedStoreInfo, setSelectedStoreInfo] = useState<SelectedStoreInfo | null>(null);
  const [showStoreSelection, setShowStoreSelection] = useState(false);

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

  const handleCreateProduct = useCallback(async () => {
    if (!name.trim()) return;

    // 🔔 Now automatically handles duplicate warnings!
    const productId = await addShoppingListProduct(
      name.trim(), 
      quantity, 
      units, 
      notes,
      selectedStoreInfo?.store,
      selectedStoreInfo?.price,
      selectedProduct?.id,
      selectedProduct?.category
    );
    
    // 🔔 If productId is null, it means duplicate was found and notification was created
    if (productId === null) {
      Alert.alert(
        "Duplicate Product",
        `"${name.trim()}" is already in your shopping list. Check your notifications for details.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    router.back();
  }, [name, quantity, units, notes, selectedStoreInfo, selectedProduct, addShoppingListProduct, router]);

  const handleProductSelect = useCallback((product: DatabaseProduct) => {
    setName(product.name);
    setSelectedProduct(product);
    setShowSuggestions(false);
    setShowStoreSelection(true);
    Keyboard.dismiss();
    
    const categoryUnits = getCategoryUnits(product.category);
    if (categoryUnits) {
      setUnits(categoryUnits);
    }
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

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle: "Add product",
          headerRight: () => (
            <Button
              variant="ghost"
              onPress={handleCreateProduct}
              disabled={!name.trim()}
            >
              Save
            </Button>
          ),
          headerLeft: () => (
            <Button variant="ghost" onPress={router.back}>
              Cancel
            </Button>
          ),
        }}
      />
      <BodyScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

          {/* Selected Product Indicator */}
          {selectedProduct && (
            <View style={styles.selectedProductBadge}>
              <IconSymbol name="checkmark.circle.fill" color="#34C759" size={16} />
              <ThemedText type="default" style={styles.selectedText}>
                From database • {selectedProduct.category}
              </ThemedText>
            </View>
          )}

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

        {/* Units Input */}
        <View style={styles.inputRow}>
          <TextInput
            label="Units"
            placeholder="kg"
            value={units}
            onChangeText={setUnits}
            containerStyle={styles.unitsInput}
          />
          <View style={styles.commonUnitsContainer}>
            {COMMON_UNITS.map((unit) => (
              <Pressable
                key={unit}
                style={[
                  styles.unitChip,
                  units === unit && styles.unitChipSelected
                ]}
                onPress={() => setUnits(unit)}
              >
                <ThemedText 
                  type="default" 
                  style={[
                    styles.unitChipText,
                    units === unit && styles.unitChipTextSelected
                  ]}
                >
                  {unit}
                </ThemedText>
              </Pressable>
            ))}
          </View>
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
              <ThemedText type="default" style={styles.quantityUnits}>
                {units}
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
                  name="minus.circle.fill" 
                  color={quantity <= 1 ? "#ccc" : "#007AFF"} 
                  size={24}
                />
              </Button>
              <Button 
                onPress={() => setQuantity(quantity + 1)} 
                variant="ghost"
                style={styles.quantityButton}
              >
                <IconSymbol name="plus.circle.fill" color="#007AFF" size={24} />
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

        {/* Android Add Button */}
        {Platform.OS !== "ios" && (
          <Button 
            onPress={handleCreateProduct} 
            disabled={!name.trim()}
            style={styles.addButton}
          >
            Add to List
          </Button>
        )}
      </BodyScrollView>
    </>
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
        <IconSymbol name="chevron.right" color="#007AFF" size={16} />
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

function getCategoryUnits(category: string): string | null {
  const categoryMap: { [key: string]: string } = {
    'Beverages': 'L',
    'Dairy': 'g',
    'Instant Noodles': 'pcs',
    'Canned Goods': 'pcs',
    'Coffee': 'g',
    'Meat': 'kg',
    'Vegetables': 'kg',
    'Fruits': 'kg',
    'Bread': 'pcs',
    'Snacks': 'g',
    'Household': 'pcs',
  };
  
  return categoryMap[category] || null;
}

const COMMON_UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'pack'];

const styles = StyleSheet.create({
  container: { padding: 16 },
  nameSection: { marginBottom: 24 },
  nameInputContainer: { flexDirection: 'row', alignItems: 'flex-end', position: 'relative' },
  nameInput: { flex: 1, marginBottom: 0 },
  dismissButton: { position: 'absolute', right: 12, bottom: 12, zIndex: 1 },
  selectedProductBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E8',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, alignSelf: 'flex-start'
  },
  selectedText: { fontSize: 12, color: '#34C759', marginLeft: 4 },
  selectedStoreBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F4FF',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6, alignSelf: 'flex-start'
  },
  selectedStoreText: { fontSize: 12, color: '#007AFF', marginLeft: 4, flex: 1 },
  changeStoreButton: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2 },
  changeStoreText: { fontSize: 10, color: '#007AFF', textDecorationLine: 'underline' },
  suggestionsContainer: {
    backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, marginTop: 8, maxHeight: 400
  },
  suggestionsHeader: { fontSize: 14, marginBottom: 8, color: '#666' },
  loadingContainer: { padding: 20, alignItems: 'center' },
  noPricesContainer: { padding: 20, alignItems: 'center' },
  noPricesText: { marginBottom: 12, color: '#666', textAlign: 'center' },
  infoContainer: {
    backgroundColor: '#f0f8ff', borderRadius: 8, padding: 12, marginTop: 8,
    borderLeftWidth: 3, borderLeftColor: '#007AFF'
  },
  infoText: { fontSize: 12, color: '#666', textAlign: 'center' },
  suggestionItem: {
    backgroundColor: 'white', borderRadius: 8, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  suggestionContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12
  },
  suggestionMain: { flex: 1 },
  suggestionName: { fontSize: 15, marginBottom: 2 },
  suggestionCategory: { fontSize: 12, color: '#666' },
  storeItem: {
    backgroundColor: 'white', borderRadius: 8, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    borderWidth: 2, borderColor: 'transparent'
  },
  storeItemSelected: { borderColor: '#34C759', backgroundColor: '#F0FFF0' },
  storeContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16
  },
  storeMain: { flex: 1 },
  storeName: { fontSize: 16, marginBottom: 4 },
  storePrice: { fontSize: 18, color: '#007AFF' },
  highlightedText: { backgroundColor: '#FFE066', fontWeight: 'bold' },
  inputRow: { marginBottom: 24 },
  unitsInput: { marginBottom: 12 },
  commonUnitsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unitChip: {
    backgroundColor: '#f0f0f0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#e0e0e0'
  },
  unitChipSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  unitChipText: { fontSize: 12, color: '#666' },
  unitChipTextSelected: { color: 'white', fontWeight: '600' },
  quantitySection: { marginBottom: 24 },
  quantityLabel: { marginBottom: 12 },
  quantityControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16
  },
  quantityDisplay: { alignItems: 'center' },
  quantityText: { fontSize: 24, fontWeight: 'bold' },
  quantityUnits: { fontSize: 14, color: '#666', marginTop: 2 },
  totalPriceText: { fontSize: 12, color: '#007AFF', marginTop: 4, fontWeight: '600' },
  quantityButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityButton: { padding: 4 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  addButton: { marginTop: 24 },
});