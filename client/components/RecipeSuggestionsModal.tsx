import React from 'react';
import { 
  Modal, 
  View, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  Image, 
  ActivityIndicator,
  useColorScheme,
  Linking,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Recipe } from '@/services/recipeApi';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface RecipeSuggestionsModalProps {
  visible: boolean;
  recipes: Recipe[];
  loading: boolean;
  listName?: string;
  onClose: () => void;
  onSelectRecipe?: (recipe: Recipe) => void;
}

export function RecipeSuggestionsModal({ 
  visible, 
  recipes, 
  loading, 
  listName = 'your list',
  onClose,
  onSelectRecipe 
}: RecipeSuggestionsModalProps) {
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  const handleRecipePress = (recipe: Recipe) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    } else if (recipe.sourceUrl) {
      // Open recipe URL in browser
      Linking.openURL(recipe.sourceUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <IconSymbol name="book.fill" size={24} color="#007AFF" />
            <View style={styles.headerText}>
              <ThemedText style={styles.title}>Recipe Suggestions</ThemedText>
              <ThemedText style={styles.subtitle}>For "{listName}"</ThemedText>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark.circle.fill" size={28} color="#666" />
          </Pressable>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Finding delicious recipes...</ThemedText>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="fork.knife" size={64} color="#ccc" />
            <ThemedText style={styles.emptyTitle}>No Recipes Found</ThemedText>
            <ThemedText style={styles.emptyText}>
              We couldn't find any recipes for this list. Try a different list name!
            </ThemedText>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <ThemedText style={styles.recipeCount}>
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
            </ThemedText>
            
            {recipes.map((recipe, index) => (
              <Pressable
                key={recipe.id || index}
                style={({ pressed }) => [
                  styles.recipeCard,
                  pressed && styles.recipeCardPressed,
                ]}
                onPress={() => handleRecipePress(recipe)}
              >
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
                
                <View style={styles.recipeContent}>
                  <ThemedText style={styles.recipeTitle} numberOfLines={2}>
                    {recipe.title}
                  </ThemedText>
                  
                  <View style={styles.recipeMetadata}>
                    {recipe.readyInMinutes && (
                      <View style={styles.recipeInfo}>
                        <IconSymbol name="clock" size={14} color="#666" />
                        <ThemedText style={styles.recipeInfoText}>
                          {recipe.readyInMinutes} min
                        </ThemedText>
                      </View>
                    )}
                    
                    {recipe.servings && (
                      <View style={styles.recipeInfo}>
                        <IconSymbol name="person.2" size={14} color="#666" />
                        <ThemedText style={styles.recipeInfoText}>
                          {recipe.servings} servings
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <View style={styles.ingredientsPreview}>
                      <ThemedText style={styles.ingredientsLabel}>Ingredients:</ThemedText>
                      <ThemedText style={styles.ingredientsText} numberOfLines={2}>
                        {recipe.ingredients.slice(0, 3).join(', ')}
                        {recipe.ingredients.length > 3 ? '...' : ''}
                      </ThemedText>
                    </View>
                  )}
                </View>
                
                <IconSymbol name="chevron.right" size={20} color="#ccc" />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Footer */}
        {!loading && recipes.length > 0 && (
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Tap any recipe to view details
            </ThemedText>
          </View>
        )}
      </View>
    </Modal>
  );
}

function createStyles(colors: typeof Colors.light) {
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
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
    },
    closeButton: {
      padding: 4,
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      lineHeight: 24,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    recipeCount: {
      fontSize: 14,
      color: '#666',
      marginBottom: 16,
      fontWeight: '600',
    },
    recipeCard: {
      flexDirection: 'row',
      padding: 12,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignItems: 'flex-start',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    recipeCardPressed: {
      opacity: 0.7,
      backgroundColor: colors.mainBackground,
    },
    recipeImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: '#f0f0f0',
    },
    recipeImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    recipeContent: {
      flex: 1,
      paddingRight: 8,
    },
    recipeTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      lineHeight: 22,
    },
    recipeMetadata: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
    },
    recipeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recipeInfoText: {
      fontSize: 12,
      color: '#666',
      fontWeight: '500',
    },
    ingredientsPreview: {
      marginTop: 4,
    },
    ingredientsLabel: {
      fontSize: 11,
      color: '#999',
      fontWeight: '600',
      marginBottom: 2,
    },
    ingredientsText: {
      fontSize: 11,
      color: '#666',
      lineHeight: 16,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 13,
      color: '#666',
    },
  });
}