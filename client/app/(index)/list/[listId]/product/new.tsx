import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View, FlatList, Pressable, StyleSheet, Keyboard } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TextInput from "@/components/ui/text-input";
import { useAddShoppingListProductCallback } from "@/stores/ShoppingListStore";
import { useProducts } from "@/hooks/useProducts";
import { DatabaseProduct } from "@/services/productsApi";

export default function NewItemScreen() {
  const { listId } = useLocalSearchParams() as { listId: string };
  const [name, setName] = useState("");
  const [units, setUnits] = useState("kg");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);

  const router = useRouter();
  const addShoppingListProduct = useAddShoppingListProductCallback(listId);
  const { products, loading: productsLoading, searchProducts } = useProducts();

  // Filter products based on the current name input
  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 2) return [];
    return searchProducts(name).slice(0, 8); // Limit to 8 suggestions
  }, [name, searchProducts]);

  // Show/hide suggestions based on input and results
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && name.length >= 2);
  }, [suggestions, name]);

  const handleCreateProduct = useCallback(() => {
    if (!name.trim()) return;

    addShoppingListProduct(name.trim(), quantity, units, notes);
    router.back();
  }, [name, quantity, units, notes, addShoppingListProduct, router]);

  const handleProductSelect = useCallback((product: DatabaseProduct) => {
    setName(product.name);
    setSelectedProduct(product);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    // Auto-set some common units based on category
    const categoryUnits = getCategoryUnits(product.category);
    if (categoryUnits) {
      setUnits(categoryUnits);
    }
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    setSelectedProduct(null); // Clear selected product when manually typing
    
    // If user clears the input, hide suggestions
    if (!text.trim()) {
      setShowSuggestions(false);
    }
  }, []);

  const handleDismissSuggestions = useCallback(() => {
    setShowSuggestions(false);
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
            {showSuggestions && (
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

          {/* Product Suggestions */}
          {showSuggestions && !productsLoading && (
            <View style={styles.suggestionsContainer}>
              <ThemedText type="defaultSemiBold" style={styles.suggestionsHeader}>
                Suggestions
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

// Product Suggestion Item Component
function ProductSuggestionItem({ 
  product, 
  onSelect, 
  searchQuery 
}: { 
  product: DatabaseProduct; 
  onSelect: (product: DatabaseProduct) => void;
  searchQuery: string;
}) {
  // Highlight matching text
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
        <IconSymbol name="arrow.up.left.and.arrow.down.right" color="#007AFF" size={16} />
      </View>
    </Pressable>
  );
}

// Helper function to suggest units based on category
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
  };
  
  return categoryMap[category] || null;
}

const COMMON_UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'pack'];

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  nameSection: {
    marginBottom: 24,
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
  },
  dismissButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    zIndex: 1,
  },
  selectedProductBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  selectedText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    maxHeight: 300,
  },
  suggestionsHeader: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  suggestionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  suggestionMain: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
    color: '#666',
  },
  highlightedText: {
    backgroundColor: '#FFE066',
    fontWeight: 'bold',
  },
  inputRow: {
    marginBottom: 24,
  },
  unitsInput: {
    marginBottom: 12,
  },
  commonUnitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unitChipText: {
    fontSize: 12,
    color: '#666',
  },
  unitChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  quantityDisplay: {
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityUnits: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    padding: 4,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 24,
  },
});