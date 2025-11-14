// client/components/RecipeSection.tsx

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Image, 
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Recipe } from '@/services/recipeApi';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { RecipeDetailsModal } from './RecipeDetailsModal';

interface RecipeSectionProps {
  recipes: Recipe[];
  loading: boolean;
  listId: string; // ⭐ NEW: Need listId to add ingredients
  onRefresh?: () => void;
}

export function RecipeSection({ recipes, loading, listId, onRefresh }: RecipeSectionProps) {
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleRecipePress = (recipe: Recipe) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedRecipe(recipe);
    setShowDetails(true);
  };

  const handleRefresh = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRefresh?.();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconSymbol name="book.fill" size={20} color="#007AFF" />
            <ThemedText style={styles.headerTitle}>Recipe Suggestions</ThemedText>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading recipes...</ThemedText>
        </View>
      </View>
    );
  }

  if (recipes.length === 0) {
    return null; // Don't show the section if there are no recipes
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconSymbol name="book.fill" size={20} color="#007AFF" />
            <ThemedText style={styles.headerTitle}>Recipe Suggestions</ThemedText>
          </View>
          {onRefresh && (
            <Pressable onPress={handleRefresh} style={styles.refreshButton}>
              <IconSymbol name="arrow.clockwise" size={18} color="#007AFF" />
            </Pressable>
          )}
        </View>

        {/* Recipe Cards - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {recipes.map((recipe, index) => (
            <Pressable
              key={recipe.id || index}
              style={({ pressed }) => [
                styles.recipeCard,
                pressed && styles.recipeCardPressed,
              ]}
              onPress={() => handleRecipePress(recipe)}
            >
              {/* Recipe Image */}
              {recipe.image ? (
                <Image 
                  source={{ uri: recipe.image }} 
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.recipeImage, styles.recipeImagePlaceholder]}>
                  <IconSymbol name="photo" size={32} color="#ccc" />
                </View>
              )}

              {/* Recipe Info Overlay */}
              <View style={styles.recipeOverlay}>
                <ThemedText style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </ThemedText>
                
                {/* Metadata */}
                <View style={styles.recipeMetadata}>
                  {recipe.readyInMinutes && (
                    <View style={styles.metadataBadge}>
                      <IconSymbol name="clock.fill" size={12} color="#fff" />
                      <ThemedText style={styles.metadataText}>
                        {recipe.readyInMinutes}m
                      </ThemedText>
                    </View>
                  )}
                  
                  {recipe.servings && (
                    <View style={styles.metadataBadge}>
                      <IconSymbol name="person.2.fill" size={12} color="#fff" />
                      <ThemedText style={styles.metadataText}>
                        {recipe.servings}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Recipe Details Modal */}
      <RecipeDetailsModal
        visible={showDetails}
        recipe={selectedRecipe}
        listId={listId}
        onClose={() => {
          setShowDetails(false);
          setSelectedRecipe(null);
        }}
      />
    </>
  );
}

function createStyles(colors: typeof Colors.light) {
  const { width } = Dimensions.get('window');
  const cardWidth = width * 0.65; // 65% of screen width

  return StyleSheet.create({
    container: {
      marginVertical: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    refreshButton: {
      padding: 4,
    },
    loadingContainer: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: '#666',
    },
    scrollView: {
      paddingLeft: 16,
    },
    scrollContent: {
      paddingRight: 16,
      gap: 12,
    },
    recipeCard: {
      width: cardWidth,
      height: cardWidth * 0.75,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    recipeCardPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    recipeImage: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
    },
    recipeImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    recipeOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    recipeTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 6,
      lineHeight: 20,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    recipeMetadata: {
      flexDirection: 'row',
      gap: 8,
    },
    metadataBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0, 122, 255, 0.9)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    metadataText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
    },
  });
}