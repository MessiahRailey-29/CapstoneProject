// client/components/RecipeDetailsModal.tsx

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  Image, 
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  Alert,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Recipe, recipeApi } from '@/services/recipeApi';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { useAddProductWithNotifications } from '@/hooks/useAddProductWithNotifications';

interface RecipeDetailsModalProps {
  visible: boolean;
  recipe: Recipe | null;
  listId: string;
  onClose: () => void;
}

// ⭐ NEW: Interface for product prices from database
interface ProductPrice {
  id: number;
  product_id: number;
  store: string;
  price: number;
}

interface DatabaseProduct {
  id: number;
  name: string;
  category: string;
}

export function RecipeDetailsModal({ 
  visible, 
  recipe,
  listId,
  onClose 
}: RecipeDetailsModalProps) {
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);
  
  const [detailedRecipe, setDetailedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingIngredients, setAddingIngredients] = useState(false);

  const addProduct = useAddProductWithNotifications(listId);

  useEffect(() => {
    if (visible && recipe) {
      if (recipe.ingredients && recipe.instructions) {
        setDetailedRecipe(recipe);
      } else {
        fetchRecipeDetails(recipe.id);
      }
    }
  }, [visible, recipe]);

  const fetchRecipeDetails = async (recipeId: number) => {
    setLoading(true);
    try {
      const details = await recipeApi.getRecipeDetails(recipeId);
      if (details) {
        setDetailedRecipe(details);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Function to search for product in database and get best price
  const searchProductInDatabase = async (ingredientName: string): Promise<{
    databaseProductId: number;
    bestPrice: number;
    bestStore: string;
  } | null> => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.130.251.5:3000';
      
      // Search for product by name
      const searchResponse = await fetch(
        `${API_URL}/api/products/search?q=${encodeURIComponent(ingredientName)}`
      );
      
      if (!searchResponse.ok) {
        console.log(`No database match for: ${ingredientName}`);
        return null;
      }
      
      const products = await searchResponse.json() as DatabaseProduct[];
      
      if (products.length === 0) {
        return null;
      }
      
      // Use first matching product
      const product = products[0];
      
      // Fetch prices for this product
      const pricesResponse = await fetch(
        `${API_URL}/api/products/${product.id}/prices`
      );
      
      if (!pricesResponse.ok) {
        console.log(`No prices found for product: ${product.name}`);
        return null;
      }
      
      const prices = await pricesResponse.json() as ProductPrice[];
      
      if (prices.length === 0) {
        return null;
      }
      
      // Find lowest price
      const bestPriceEntry = prices.reduce((min, price) => 
        price.price < min.price ? price : min
      );
      
      console.log(`✅ Found price for ${ingredientName}: ₱${bestPriceEntry.price} at ${bestPriceEntry.store}`);
      
      return {
        databaseProductId: product.id,
        bestPrice: bestPriceEntry.price,
        bestStore: bestPriceEntry.store,
      };
    } catch (error) {
      console.error(`Error searching for ${ingredientName}:`, error);
      return null;
    }
  };

  // ⭐ UPDATED: Add all ingredients with database price lookup
  const handleAddAllIngredients = async () => {
    if (!detailedRecipe?.ingredients || !addProduct) {
      Alert.alert('Error', 'No ingredients available to add');
      return;
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setAddingIngredients(true);

    try {
      let addedCount = 0;
      let skippedCount = 0;
      let pricesFoundCount = 0;

      for (const ingredient of detailedRecipe.ingredients) {
        // Parse ingredient string
        const parsedIngredient = parseIngredient(ingredient);
        
        // ⭐ Search for product in database
        const productData = await searchProductInDatabase(parsedIngredient.name);
        
        // Add to shopping list with price data if found
        const productId = await addProduct(
          parsedIngredient.name,
          parsedIngredient.quantity,
          parsedIngredient.unit,
          `From recipe: ${detailedRecipe.title}`,
          productData?.bestStore || '', // ⭐ Store from database
          productData?.bestPrice || 0, // ⭐ Price from database
          productData?.databaseProductId || 0, // ⭐ Database product ID
          'Recipe Ingredients'
        );

        if (productId) {
          addedCount++;
          if (productData) {
            pricesFoundCount++;
          }
        } else {
          skippedCount++;
        }
      }

      setAddingIngredients(false);

      if (addedCount > 0) {
        Alert.alert(
          'Ingredients Added! 🎉',
          `${addedCount} ingredient${addedCount !== 1 ? 's' : ''} added to your shopping list${skippedCount > 0 ? ` (${skippedCount} skipped as duplicates)` : ''}.${pricesFoundCount > 0 ? `\n\n💰 Found prices for ${pricesFoundCount} ingredient${pricesFoundCount !== 1 ? 's' : ''}!` : ''}`,
          [
            {
              text: 'OK',
              onPress: () => onClose(),
            }
          ]
        );
      } else {
        Alert.alert(
          'Already Added',
          'All ingredients are already in your shopping list.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error adding ingredients:', error);
      setAddingIngredients(false);
      Alert.alert('Error', 'Failed to add ingredients to shopping list');
    }
  };

  const handleClose = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDetailedRecipe(null);
    onClose();
  };

  if (!recipe) return null;

  const displayRecipe = detailedRecipe || recipe;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              {displayRecipe.title}
            </ThemedText>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Loading recipe details...</ThemedText>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Recipe Image */}
            {displayRecipe.image && (
              <Image 
                source={{ uri: displayRecipe.image }} 
                style={styles.recipeImage}
                resizeMode="cover"
              />
            )}

            {/* Recipe Title */}
            <View style={styles.titleContainer}>
              <ThemedText style={styles.recipeTitle}>{displayRecipe.title}</ThemedText>
            </View>

            {/* Recipe Metadata */}
            <View style={styles.metadataContainer}>
              {displayRecipe.readyInMinutes && (
                <View style={styles.metadataItem}>
                  <View style={styles.metadataIcon}>
                    <IconSymbol name="clock.fill" size={20} color="#007AFF" />
                  </View>
                  <View>
                    <ThemedText style={styles.metadataLabel}>Ready in</ThemedText>
                    <ThemedText style={styles.metadataValue}>
                      {displayRecipe.readyInMinutes} min
                    </ThemedText>
                  </View>
                </View>
              )}
              
              {displayRecipe.servings && (
                <View style={styles.metadataItem}>
                  <View style={styles.metadataIcon}>
                    <IconSymbol name="person.2.fill" size={20} color="#007AFF" />
                  </View>
                  <View>
                    <ThemedText style={styles.metadataLabel}>Servings</ThemedText>
                    <ThemedText style={styles.metadataValue}>
                      {displayRecipe.servings}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>

            {/* Add to Shopping List Button */}
            {displayRecipe.ingredients && displayRecipe.ingredients.length > 0 && (
              <View style={styles.addToListContainer}>
                <Pressable
                  style={[styles.addToListButton, addingIngredients && styles.addToListButtonDisabled]}
                  onPress={handleAddAllIngredients}
                  disabled={addingIngredients}
                >
                  {addingIngredients ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <ThemedText style={styles.addToListButtonText}>
                        Adding & fetching prices...
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <IconSymbol name="cart.fill.badge.plus" size={20} color="#fff" />
                      <ThemedText style={styles.addToListButtonText}>
                        Add All Ingredients to List
                      </ThemedText>
                    </>
                  )}
                </Pressable>
                <ThemedText style={styles.priceHint}>
                  💰 Prices from database will be included automatically
                </ThemedText>
              </View>
            )}

            {/* Ingredients Section */}
            {displayRecipe.ingredients && displayRecipe.ingredients.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="list.bullet" size={20} color="#007AFF" />
                  <ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
                </View>
                <View style={styles.sectionContent}>
                  {displayRecipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <View style={styles.bulletPoint} />
                      <ThemedText style={styles.ingredientText}>
                        {ingredient}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions Section */}
            {displayRecipe.instructions && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="doc.text" size={20} color="#007AFF" />
                  <ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
                </View>
                <View style={styles.sectionContent}>
                  <ThemedText style={styles.instructionsText}>
                    {stripHtmlTags(displayRecipe.instructions)}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* No Details Available */}
            {!displayRecipe.ingredients && !displayRecipe.instructions && (
              <View style={styles.noDetailsContainer}>
                <IconSymbol name="exclamationmark.circle" size={48} color="#ccc" />
                <ThemedText style={styles.noDetailsText}>
                  Detailed recipe information is not available for this recipe.
                </ThemedText>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

// Helper function to parse ingredient strings
function parseIngredient(ingredientString: string): {
  quantity: number;
  unit: string;
  name: string;
} {
  const match = ingredientString.match(/^(\d+(?:\.\d+)?|\d+\/\d+)?\s*([a-zA-Z]+)?\s*(.+)$/);
  
  if (match) {
    const [, quantityStr, unit, name] = match;
    
    let quantity = 1;
    if (quantityStr) {
      if (quantityStr.includes('/')) {
        const [num, den] = quantityStr.split('/').map(Number);
        quantity = num / den;
      } else {
        quantity = parseFloat(quantityStr);
      }
    }
    
    const commonUnits = ['cup', 'cups', 'tsp', 'tbsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l'];
    const isValidUnit = unit && commonUnits.some(u => unit.toLowerCase().includes(u.substring(0, 2)));
    
    return {
      quantity: isNaN(quantity) ? 1 : quantity,
      unit: isValidUnit ? unit : 'pc',
      name: isValidUnit ? name.trim() : (unit ? `${unit} ${name}` : name).trim(),
    };
  }
  
  return {
    quantity: 1,
    unit: 'pc',
    name: ingredientString.trim(),
  };
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\n+/g, '\n\n')
    .trim();
}

function createStyles(colors: typeof Colors.light) {
  const { width } = Dimensions.get('window');
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainBackground,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      backgroundColor: colors.background,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerText: {
      flex: 1,
      marginHorizontal: 12,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      marginTop: 16,
      color: '#666',
      fontSize: 16,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    recipeImage: {
      width: width,
      height: width * 0.6,
      backgroundColor: '#f0f0f0',
    },
    titleContainer: {
      padding: 20,
      paddingBottom: 16,
    },
    recipeTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 34,
    },
    metadataContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 24,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    metadataIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.mainBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    metadataLabel: {
      fontSize: 12,
      color: '#666',
      marginBottom: 2,
    },
    metadataValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    addToListContainer: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    addToListButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addToListButtonDisabled: {
      opacity: 0.6,
    },
    addToListButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    priceHint: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    section: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    sectionContent: {
      gap: 12,
    },
    ingredientItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 4,
    },
    bulletPoint: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#007AFF',
      marginTop: 8,
    },
    ingredientText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    instructionsText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 26,
    },
    noDetailsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 48,
      minHeight: 300,
    },
    noDetailsText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 24,
    },
  });
}