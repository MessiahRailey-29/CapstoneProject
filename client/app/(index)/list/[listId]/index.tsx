import React, { useEffect, useRef, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Alert, ActivityIndicator, useColorScheme, StyleSheet, SectionList } from "react-native";
import ShoppingListProductItem from "@/components/ShoppingListProductItem";
import BudgetSummary from "@/components/BudgetSummary";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductIds,
  useShoppingListValue,
  useShoppingListStore,
} from "@/stores/ShoppingListStore";
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import ShopNowButton from "@/components/ShopNowButton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAddProductWithNotifications } from "@/hooks/useAddProductWithNotifications";
import { useListNotifications } from "@/utils/notifyCollaborators";
import { Colors } from "@/constants/Colors";
import { useRecipeSuggestions } from "@/hooks/useRecipeSuggestions";
import { RecipeSection } from "@/components/RecipeSection";
import FloatingActionFab from "@/components/ShoppingListFaB";

interface ProductSection {
  title: string;
  data: string[];
}

export default function ListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = params.listId as string;

  // 🐛 DEBUG: Track render count
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`🔄 RENDER #${renderCount.current} - ListScreen for ${listId}`);

  const handleFabAction = (key)=>{
    switch(key){
      case 'edit':
        router.push({
          pathname: "/list/[listId]/edit",
          params: { listId },
        });
      break;
      case 'duplicates':
        router.push({
          pathname: "/list/[listId]/duplicate-check",
          params: { listId },
        });
      break;
      case 'share':
        router.push({
          pathname: "/list/[listId]/share",
          params: { listId },
        });
      break;
      case 'add':
        router.push({
          pathname: "/list/[listId]/product/new",
          params: { listId },
        });
      break;
    }
}
  //colors and schemes
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);
  

  // 📍 NEW: Get pending product params from URL
  const addProductId = params.addProductId ? Number(params.addProductId) : null;
  const addProductName = params.addProductName as string | undefined;
  const addProductPrice = params.addProductPrice ? Number(params.addProductPrice) : null;
  const addProductStore = params.addProductStore as string | undefined;
  
  // Track if we've already added the product (prevent double-adding)
  const hasAddedProduct = useRef(false);

  // Raw values from valuesCopy (always available)
  const listData = useShoppingListData(listId);

  // Hydrated values (can be blank until hydration completes)
  const [name] = useShoppingListValue(listId, "name");
  const [emoji] = useShoppingListValue(listId, "emoji");
  const [description] = useShoppingListValue(listId, "description");
  const [hydratedBudget] = useShoppingListValue(listId, "budget");
  const productIds = useShoppingListProductIds(listId);
  const store = useShoppingListStore(listId);

  // 🐛 DEBUG: Log when productIds changes
  const prevProductIdsRef = useRef(productIds);
  useEffect(() => {
    if (prevProductIdsRef.current.length !== productIds.length) {
      console.log(`📦 PRODUCT IDS CHANGED: ${prevProductIdsRef.current.length} → ${productIds.length}`);
      prevProductIdsRef.current = productIds;
    }
  }, [productIds]);

  // ⭐ NEW: Recipe suggestions state
  const { recipes, loading: recipesLoading, fetchSuggestions } = useRecipeSuggestions();
  const [recipeSuggestionsPrompted, setRecipeSuggestionsPrompted] = useShoppingListValue(
    listId, 
    "recipeSuggestionsPrompted"
  );
  const [recipeSuggestionsEnabled, setRecipeSuggestionsEnabled] = useShoppingListValue(
    listId, 
    "recipeSuggestionsEnabled"
  );

  // 🐛 DEBUG: Log when recipe state changes
  const prevRecipePrompedRef = useRef(recipeSuggestionsPrompted);
  const prevRecipeEnabledRef = useRef(recipeSuggestionsEnabled);
  useEffect(() => {
    if (prevRecipePrompedRef.current !== recipeSuggestionsPrompted) {
      console.log(`🍳 recipeSuggestionsPrompted CHANGED: ${prevRecipePrompedRef.current} → ${recipeSuggestionsPrompted}`);
      prevRecipePrompedRef.current = recipeSuggestionsPrompted;
    }
    if (prevRecipeEnabledRef.current !== recipeSuggestionsEnabled) {
      console.log(`🍳 recipeSuggestionsEnabled CHANGED: ${prevRecipeEnabledRef.current} → ${recipeSuggestionsEnabled}`);
      prevRecipeEnabledRef.current = recipeSuggestionsEnabled;
    }
  }, [recipeSuggestionsPrompted, recipeSuggestionsEnabled]);

  // ✅ CRITICAL FIX: Track if we've already shown the recipe prompt (prevents looping)
  const hasShownRecipePrompt = useRef(false);

  // ✅ CRITICAL FIX: Check if data is still loading
  // If BOTH listData and hydrated values are empty, we're still loading
  const isLoadingData = !listData.name && !name;
  
  // 📍 Get the add product function - safe to call here since we're in a component
  const addProduct = useAddProductWithNotifications(listId);

  // ✅ Initialize notification system for this list
  const listNotifications = useListNotifications({
    listId: listId,
    listName: listData?.name || "",
    emoji: listData?.emoji || "🛒",
    collaborators: (listData as any)?.collaborators || [],
  });

  // Safe fallbacks - prioritize hydrated values, then listData
  const displayName = name || listData.name || "";
  const displayEmoji = emoji || listData.emoji || "❓";
  const displayDescription = description || listData.description || "";
  const budget = hydratedBudget ?? listData.budget ?? 0;
  const status = listData.status || 'regular';
  const isHistory = status === 'completed';

  // ⭐ NEW: Group products by category
  const categorizedProducts = useMemo(() => {
    if (!store || !productIds || productIds.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, string[]>();

    productIds.forEach(productId => {
      const product = store.getRow("products", productId);
      const category = (product?.category as string) || 'Uncategorized';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(productId);
    });

    const sections: ProductSection[] = Array.from(categoryMap.entries())
      .sort(([catA], [catB]) => {
        if (catA === 'Uncategorized') return 1;
        if (catB === 'Uncategorized') return -1;
        return catA.localeCompare(catB);
      })
      .map(([category, productIds]) => ({
        title: category,
        data: productIds,
      }));

    return sections;
  }, [store, productIds]);

  // ⭐ NEW: Handle fetching recipe suggestions
  const handleFetchRecipes = async () => {
    console.log('🍳 handleFetchRecipes called');
    
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Enable recipe suggestions if not already enabled
    if (!recipeSuggestionsEnabled) {
      console.log('🍳 Enabling recipe suggestions');
      setRecipeSuggestionsEnabled(true);
    }

    // Get product names for better suggestions
    const productNames = productIds.map(id => {
      const product = store?.getRow("products", id);
      return product?.name as string;
    }).filter(Boolean);

    console.log('🍳 Fetching recipes for:', displayName);
    console.log('📦 With products:', productNames);
    
    const results = await fetchSuggestions(displayName, productNames);
    
    console.log('✅ Received recipes:', results.length);
    
    if (results.length === 0) {
      Alert.alert(
        'No Recipes Found',
        `Sorry, we couldn't find any recipes for "${displayName}".`,
        [{ text: 'OK' }]
      );
    }
  };

  // 🐛 DEBUG: Count effect runs
  const effectRunCount = useRef(0);

  // ⭐ COMPLETELY DISABLED FOR DEBUGGING
  useEffect(() => {
    effectRunCount.current++;
    console.log(`🔥 RECIPE PROMPT EFFECT RUN #${effectRunCount.current}`);
    console.log('📊 Effect State:', {
      hasShownRecipePrompt: hasShownRecipePrompt.current,
      recipeSuggestionsPrompted,
      displayName,
      status,
      productCount: productIds.length,
      isLoadingData,
    });

    // ✅ COMPLETELY PREVENT ANY PROMPTING FOR NOW
    if (hasShownRecipePrompt.current) {
      console.log('⏭️ Already shown, skipping');
      return;
    }

    if (recipeSuggestionsPrompted) {
      console.log('⏭️ Already prompted before, marking and skipping');
      hasShownRecipePrompt.current = true;
      return;
    }

    const shouldShow = displayName && status === 'regular' && productIds.length > 0 && !isLoadingData;
    
    if (!shouldShow) {
      console.log('⏭️ Conditions not met');
      return;
    }

    console.log('🚨 WOULD SHOW PROMPT HERE - but disabled for debugging');
    hasShownRecipePrompt.current = true;
    
    const timer = setTimeout(() => {
      Alert.alert(
        '🍳 Recipe Suggestions',
        `Would you like recipe suggestions for "${displayName}"?`,
        [
          {
            text: 'No Thanks',
            style: 'cancel',
            onPress: () => {
              console.log('User declined recipe suggestions');
              setRecipeSuggestionsPrompted(true);
              setRecipeSuggestionsEnabled(false);
            },
          },
          {
            text: 'Yes, Show Me!',
            onPress: async () => {
              console.log('User accepted recipe suggestions');
              setRecipeSuggestionsPrompted(true);
              setRecipeSuggestionsEnabled(true);
              await handleFetchRecipes();
            },
          },
        ]
      );
    }, 1500);

    return () => clearTimeout(timer);

  }, [displayName, status, isLoadingData, recipeSuggestionsPrompted]);

  console.log("📊 List Screen State:", {
    renderCount: renderCount.current,
    effectRunCount: effectRunCount.current,
    listId,
    budget,
    name: displayName,
    productCount: productIds.length,
    status,
    recipeSuggestionsPrompted,
    recipeSuggestionsEnabled,
    recipesCount: recipes.length,
    recipesLoading,
    hasShownRecipePrompt: hasShownRecipePrompt.current,
  });

  // 📍 Auto-add pending product when page loads
  useEffect(() => {
    if (
      !hasAddedProduct.current &&
      addProduct &&
      addProductId &&
      addProductName &&
      addProductPrice !== null &&
      addProductStore
    ) {
      hasAddedProduct.current = true;
      
      console.log('📍 Auto-adding pending product:', {
        id: addProductId,
        name: addProductName,
        price: addProductPrice,
        store: addProductStore
      });
      
      const timer = setTimeout(async () => {
        try {
          const productAddedId = await addProduct(
            addProductName,
            1,
            'pc',
            '',
            addProductStore,
            addProductPrice,
            addProductId,
            ''
          );

          if (productAddedId) {
            console.log('✅ Product auto-added successfully:', productAddedId);
            Alert.alert(
              'Product Added',
              `${addProductName} has been added to your list!`,
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('❌ Failed to auto-add product:', error);
          Alert.alert(
            'Error',
            'Failed to add product to the list.',
            [{ text: 'OK' }]
          );
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [addProduct, addProductId, addProductName, addProductPrice, addProductStore]);

  // ✅ FIX: Use correct route path
  const navigateToNewProduct = () => {
    router.push({
      pathname: "/list/[listId]/product/new",
      params: { listId },
    });
  };

  // ✅ SHOW LOADING STATE while data is syncing
  if (isLoadingData) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: "Loading...",
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={{ marginTop: 16, color: 'gray' }}>
            Loading list data...
          </ThemedText>
        </View>
      </>
    );
  }

  const ListHeaderComponent = () => (
    <View>
      {displayDescription ? (
        <ThemedText
          style={{
            paddingHorizontal: 16,
            fontSize: 14,
            color: "gray",
            marginBottom: 16,
          }}
        >
          {displayDescription}
        </ThemedText>
      ) : null}

      {/* Budget Summary */}
      <BudgetSummary listId={listId} budget={budget} />

      {/* ⭐ NEW: Recipe Suggestions Section - Show if enabled OR if recipes exist */}
      {(recipeSuggestionsEnabled || recipes.length > 0) && (
        <RecipeSection 
          recipes={recipes}
          loading={recipesLoading}
          listId={listId}
          onRefresh={handleFetchRecipes}
        />
      )}

      {/* Shop Now Button with status */}
      <ShopNowButton listId={listId} currentStatus={status} />
    </View>
  );

  // Render category header
  const renderSectionHeader = ({ section }: { section: ProductSection }) => (
    <View style={styles.categoryHeader}>
      <View style={styles.categoryHeaderContent}>
        <ThemedText style={styles.categoryTitle}>{section.title}</ThemedText>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryCount}>{section.data.length}</ThemedText>
        </View>
      </View>
      <View style={styles.categoryDivider} />
    </View>
  );

  // Render product item
  const renderItem = ({ item: productId }: { item: string }) => (
    <ShoppingListProductItem 
      listId={listId} 
      productId={productId}
      status={status}
    />
  );

  return (
    <View style={{
              backgroundColor: colors.mainBackground,
              flex: 1}}>
      <Stack.Screen
        options={{
          headerStyle: {backgroundColor: colors.mainBackground},
          headerTitle: displayEmoji + " " + displayName,
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {/* ⭐ Recipe book icon - always visible, click to fetch/refresh */}
              <Pressable
                onPress={handleFetchRecipes}
                style={{ padding: 8 }}
              >
                <IconSymbol name="book.fill" size={24} color="#007AFF" />
              </Pressable>
            </View>
          ),
        }}
      />
      <FloatingActionFab position={{ bottom: 70, right: 24 }} onAction={handleFabAction}/>

      <SectionList
        sections={categorizedProducts}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 100,         
          backgroundColor: colors.mainBackground,
        }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={ListHeaderComponent}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={() => (
          <BodyScrollView
            contentContainerStyle={{
              alignItems: "center",
              gap: 8,
              paddingTop: 50,
            }}
          >
            {!isHistory && (
              <Button
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigateToNewProduct();
                }}
                variant="ghost"
              >
                Add the first product to this list
              </Button>
            )}
            {isHistory && (
              <ThemedText style={{ color: 'gray', fontSize: 16 }}>
                This list has been completed
              </ThemedText>
            )}
          </BodyScrollView>
        )}
      />
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    categoryHeader: {
      backgroundColor: colors.mainBackground,
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: 16,
    },
    categoryHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'capitalize',
    },
    categoryBadge: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      minWidth: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryCount: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    categoryDivider: {
      height: 1,
      backgroundColor: colors.borderColor,
      opacity: 0.3,
    },
  });
}