import React, { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Alert } from "react-native";
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

export default function ListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = params.listId as string;

  // 🔔 NEW: Get pending product params from URL
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
  const productIds = useShoppingListProductIds(listId);

  // 🔔 Get the add product function - safe to call here since we're in a component
  const addProduct = useAddProductWithNotifications(listId);

  // Safe fallbacks
  const displayName = name || listData.name || "";
  const displayEmoji = emoji || listData.emoji || "❓";
  const displayDescription = description || listData.description || "";
  const budget = listData.budget;
  const status = listData.status || 'regular'; // Get the status

  console.log("List Screen Debug:", {
    listId,
    budget,
    budgetType: typeof budget,
    name,
    productCount: productIds.length,
    status, // Log status
    listData,
  });

  // 🔔 NEW: Auto-add pending product when page loads
  useEffect(() => {
    // Check all conditions
    if (
      !hasAddedProduct.current && // Haven't added yet
      addProduct && // Function is ready
      addProductId && // Have product ID
      addProductName && // Have product name
      addProductPrice !== null && // Have price (could be 0)
      addProductStore // Have store
    ) {
      // Mark as added to prevent duplicate attempts
      hasAddedProduct.current = true;
      
      console.log('🔔 Auto-adding pending product:', {
        id: addProductId,
        name: addProductName,
        price: addProductPrice,
        store: addProductStore
      });
      
      // Add product after a short delay to ensure list is fully loaded
      const timer = setTimeout(async () => {
        try {
          const productAddedId = await addProduct(
            addProductName,
            1, // quantity
            'pc', // units
            '', // notes
            addProductStore, // selectedStore
            addProductPrice, // selectedPrice
            addProductId, // databaseProductId
            '' // category
          );

          if (productAddedId) {
            console.log('✅ Product auto-added successfully:', productAddedId);
            Alert.alert(
              'Product Added',
              `${addProductName} has been added to your list!`,
              [{ text: 'OK' }]
            );
          } else {
            console.log('⚠️ Product was duplicate or failed to add');
            // If null was returned, it might be a duplicate
            // The hook should have created a notification already
          }
        } catch (error) {
          console.error('❌ Error auto-adding product:', error);
          Alert.alert(
            'Error',
            'Failed to add product. Please try adding it manually.',
            [{ text: 'OK' }]
          );
        }
      }, 800); // Wait 800ms for list to fully initialize
      
      return () => clearTimeout(timer);
    }
  }, [addProduct, addProductId, addProductName, addProductPrice, addProductStore, listId]);

  // Add this debug logging
  console.log("🔍 Current list status:", status);
  console.log("🔍 List data:", listData);

  const newProductHref = {
    pathname: "/list/[listId]/product/new",
    params: { listId },
  } as const;

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

      {/* Shop Now Button with status - this will show map when ongoing */}
      <ShopNowButton listId={listId} currentStatus={status} />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
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
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push({
                    pathname: "/list/[listId]/edit",
                    params: { listId },
                  });
                }}
                style={{ padding: 8 }}
              >
                <IconSymbol
                  name="pencil.and.list.clipboard"
                  color={"#007AFF"}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push(newProductHref);
                }}
                style={{ paddingLeft: 8 }}
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
                <AntDesign name="check-square" size={24} color="black" />
              </Pressable>
            </View>
          ),
        }}
      />
      <Animated.FlatList
        data={productIds}
        renderItem={({ item: productId }) => (
          <ShoppingListProductItem listId={listId} productId={productId} />
        )}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 100,
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
            <Button
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(newProductHref);
              }}
              variant="ghost"
            >
              Add the first product to this list
            </Button>
          </BodyScrollView>
        )}
      />
    </>
  );
}