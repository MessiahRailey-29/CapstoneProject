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
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ListScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };

  // Raw values from valuesCopy (always available)
  const listData = useShoppingListData(listId);

  // Hydrated values (can be blank until hydration completes)
  const [name] = useShoppingListValue(listId, "name");
  const [emoji] = useShoppingListValue(listId, "emoji");
  const [description] = useShoppingListValue(listId, "description");
  const productIds = useShoppingListProductIds(listId);

  // ✅ Safe fallbacks
  const displayName = name || listData.name || "";
  const displayEmoji = emoji || listData.emoji || "❓";
  const displayDescription = description || listData.description || "";
  const budget = listData.budget;

  console.log("List Screen Debug:", {
    listId,
    budget,
    budgetType: typeof budget,
    name,
    productCount: productIds.length,
    listData,
  });

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

      {/* Always show BudgetSummary when we have budget or products with prices */}
      <BudgetSummary listId={listId} budget={budget} />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: displayEmoji + " " + displayName, // ✅ safe fallback
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
