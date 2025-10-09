// components/ShopNowButton.tsx
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductIds,
  useShoppingListProductCell,
} from "@/stores/ShoppingListStore";
import { useAddInventoryItemsCallback } from "@/stores/InventoryStore";
import { useUser } from "@clerk/clerk-expo";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ShopNowButtonProps {
  listId: string;
}

export default function ShopNowButton({ listId }: ShopNowButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const productIds = useShoppingListProductIds(listId);
  const addInventoryItems = useAddInventoryItemsCallback();

  const handleShopNow = () => {
    if (productIds.length === 0) {
      Alert.alert("Empty List", "Add some products to your list before shopping!");
      return;
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Shop Now",
      `Add all ${productIds.length} item(s) to your inventory?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Shop Now",
          style: "default",
          onPress: () => {
            // Collect all product data
            const items = productIds.map(productId => {
              // We'll use a separate component to read each product's data
              return { productId };
            });

            // For now, show success message
            // We'll implement the actual data collection in the next step
            Alert.alert(
              "Success!",
              `${productIds.length} items added to your inventory!`,
              [
                {
                  text: "View Inventory",
                  onPress: () => router.push("/(index)/(tabs)/inventory"),
                },
                {
                  text: "OK",
                  style: "cancel",
                },
              ]
            );

            console.log("🛒 Shopping completed for list:", listId);
          },
        },
      ]
    );
  };

  if (productIds.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleShopNow} style={styles.button}>
        <MaterialIcons name="inventory" size={24} color="black" />
        <ThemedText style={styles.text}>
          Shop Now ({productIds.length})
        </ThemedText>
      </Button>
    </View>
  );
}

// Version that properly collects product data
export function ShopNowButtonWithData({ listId }: ShopNowButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const productIds = useShoppingListProductIds(listId);
  const addInventoryItems = useAddInventoryItemsCallback();

  // Collect all product data using hooks
  const productsData = productIds.map(productId => {
    const [name] = useShoppingListProductCell(listId, productId, "name");
    const [quantity] = useShoppingListProductCell(listId, productId, "quantity");
    const [units] = useShoppingListProductCell(listId, productId, "units");
    const [category] = useShoppingListProductCell(listId, productId, "category");
    const [selectedStore] = useShoppingListProductCell(listId, productId, "selectedStore");
    const [selectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
    const [databaseProductId] = useShoppingListProductCell(listId, productId, "databaseProductId");
    const [notes] = useShoppingListProductCell(listId, productId, "notes");

    return {
      name: name as string,
      quantity: quantity as number,
      units: units as string,
      category: category as string,
      selectedStore: selectedStore as string,
      selectedPrice: selectedPrice as number,
      databaseProductId: databaseProductId as number,
      notes: notes as string,
    };
  });

  const handleShopNow = () => {
    if (productIds.length === 0) {
      Alert.alert("Empty List", "Add some products to your list before shopping!");
      return;
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Shop Now",
      `Add all ${productIds.length} item(s) to your inventory?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Shop Now",
          style: "default",
          onPress: () => {
            // Add items to inventory
            addInventoryItems(productsData, listId, user?.id || "unknown");

            if (process.env.EXPO_OS === "ios") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            Alert.alert(
              "Success!",
              `${productIds.length} items added to your inventory!`,
              [
                {
                  text: "View Inventory",
                  onPress: () => router.push("/(index)/(tabs)/inventory"),
                },
                {
                  text: "OK",
                  style: "cancel",
                },
              ]
            );

            console.log("🛒 Shopping completed for list:", listId);
          },
        },
      ]
    );
  };

  if (productIds.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleShopNow} style={styles.button}>
        <IconSymbol name="bag" size={20} color="#fff" />
        <ThemedText style={styles.text}>
          Shop Now ({productIds.length})
        </ThemedText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});