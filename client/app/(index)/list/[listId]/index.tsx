import React, { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Alert, ActivityIndicator, useColorScheme } from "react-native";
import Animated from "react-native-reanimated";
import ShoppingListProductItem from "@/components/ShoppingListProductItem";
import BudgetSummary from "@/components/BudgetSummary";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductIds,
  useShoppingListValue,
} from "@/stores/ShoppingListStore";
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import ShopNowButton from "@/components/ShopNowButton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAddProductWithNotifications } from "@/hooks/useAddProductWithNotifications";
import { useListNotifications } from "@/utils/notifyCollaborators";
import { Colors } from "@/constants/Colors";

export default function ListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = params.listId as string;

  
            const theme = useColorScheme();
            const colors = Colors[theme ?? 'light'];
  

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
  const [hydratedBudget] = useShoppingListValue(listId, "budget");  // ✅ Get hydrated budget
  const productIds = useShoppingListProductIds(listId);

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
  // ✅ FIX: Use hydrated budget if available, otherwise fall back to listData
  const budget = hydratedBudget ?? listData.budget ?? 0;
  const status = listData.status || 'regular';
  const isHistory = status === 'completed';

  console.log("List Screen Debug:", {
    listId,
    budget,
    hydratedBudget,
    listDataBudget: listData.budget,
    budgetType: typeof budget,
    name,
    productCount: productIds.length,
    status,
    listData,
    collaborators: (listData as any)?.collaborators,
  });

  // 📍 NEW: Auto-add pending product when page loads
  useEffect(() => {
    // Check all conditions
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
            await listNotifications.notifyItemAdded(addProductName);
            
            Alert.alert(
              'Product Added',
              `${addProductName} has been added to your list!`,
              [{ text: 'OK' }]
            );
          } else {
            console.log('⚠️ Product was duplicate or failed to add');
          }
        } catch (error) {
          console.error('❌ Error auto-adding product:', error);
          Alert.alert(
            'Error',
            'Failed to add product. Please try adding it manually.',
            [{ text: 'OK' }]
          );
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [addProduct, addProductId, addProductName, addProductPrice, addProductStore, listId, listNotifications]);

  console.log("🔍 Current list status:", status);
  console.log("🔍 List data:", listData);

  const newProductHref = {
    pathname: "/list/[listId]/product/new",
    params: { listId },
  } as const;

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
    <View >
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

      {/* Shop Now Button with status - this will show map when ongoing */}
      <ShopNowButton listId={listId} currentStatus={status} />
    </View>
  );

  return (
    <>
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
              <Pressable
                onPress={() => {
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push({
                    pathname: "/list/[listId]/share",
                    params: { listId },
                  });
                }}
                style={{ padding: 8 }}
              >
                <IconSymbol name="square.and.arrow.up" color={"#007AFF"} />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (isHistory) return;
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push({
                    pathname: "/list/[listId]/edit",
                    params: { listId },
                  });
                }}
                style={{ padding: 8, opacity: isHistory ? 0.3 : 1 }}
                disabled={isHistory}
              >
                <IconSymbol
                  name="pencil.and.list.clipboard"
                  color={"#007AFF"}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (isHistory) return;
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push(newProductHref);
                }}
                style={{ paddingLeft: 8, opacity: isHistory ? 0.3 : 1 }}
                disabled={isHistory}
              >
                <IconSymbol name="plus" color={"#007AFF"} />
              </Pressable>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/list/[listId]/duplicate-check",
                    params: { listId },
                  });
                }}
                style={{ padding: 8 }}
              >
                <AntDesign name="check-square" size={24} color={'#007AFF'} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Animated.FlatList
        data={productIds}
        renderItem={({ item: productId }) => (
          <ShoppingListProductItem 
            listId={listId} 
            productId={productId}
          />
        )}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 100,
          backgroundColor: colors.mainBackground,
        }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={ListHeaderComponent}
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
                  router.push(newProductHref);
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
    </>
  );
}