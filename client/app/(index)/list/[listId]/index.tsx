import React from "react";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
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
import { useShoppingListData } from "@/stores/ShoppingListsStore"; // Import the new hook

export default function ListScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };
  
  // Get list data from ShoppingListsStore (includes budget)
  const listData = useShoppingListData(listId);
  
  // Get individual list data from ShoppingListStore
  const [name] = useShoppingListValue(listId, "name");
  const [emoji] = useShoppingListValue(listId, "emoji");
  const [description] = useShoppingListValue(listId, "description");
  const productIds = useShoppingListProductIds(listId);
  
  // Use the budget from the correct store
  const budget = listData.budget;
  
  console.log('List Screen Debug:', {
    listId,
    budget,
    budgetType: typeof budget,
    name,
    productCount: productIds.length,
    listData
  });

  const newProductHref = {
    pathname: "/list/[listId]/product/new",
    params: { listId },
  } as const;

  const ListHeaderComponent = () => (
    <View>
      {description && (
        <ThemedText
          style={{ paddingHorizontal: 16, fontSize: 14, color: "gray", marginBottom: 16 }}
        >
          {description}
        </ThemedText>
      )}
      {/* Always show BudgetSummary when we have budget or products with prices */}
      <BudgetSummary listId={listId} budget={budget} />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: emoji + " " + name,
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