import React, { useMemo } from "react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductIds,
  useUpdateListStatus,
  useShoppingListStore,
} from "@/stores/ShoppingListStore";
import { useUpdateShoppingListStatus } from "@/stores/ShoppingListsStore";
import { useAddInventoryItemsCallback } from "@/stores/InventoryStore";
import { useUser } from "@clerk/clerk-expo";
import { useNotifications } from "@/hooks/useNotifications";

interface ShopNowButtonProps {
  listId: string;
  currentStatus?: 'regular' | 'ongoing' | 'completed';
}

export default function ShopNowButton({ listId, currentStatus = 'regular' }: ShopNowButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const productIds = useShoppingListProductIds(listId);
  const updateStatusInListsStore = useUpdateShoppingListStatus();
  const updateStatusInListStore = useUpdateListStatus(listId);
  const addInventoryItems = useAddInventoryItemsCallback();
  
  // 🔔 ADD: Get notification functions
  const { trackPurchase } = useNotifications(user?.id || '');
  
  const store = useShoppingListStore(listId);

  const productsData = useMemo(() => {
    if (!store || !productIds || productIds.length === 0) {
      return [];
    }

    return productIds.map(productId => {
      const product = store.getRow("products", productId);
      
      return {
        name: (product?.name as string) || '',
        quantity: (product?.quantity as number) || 0,
        units: (product?.units as string) || '',
        category: (product?.category as string) || '',
        selectedStore: (product?.selectedStore as string) || '',
        selectedPrice: (product?.selectedPrice as number) || 0,
        databaseProductId: (product?.databaseProductId as number) || 0,
        notes: (product?.notes as string) || '',
      };
    });
  }, [store, productIds]);

  const handleShopNow = () => {
    if (productIds.length === 0) {
      Alert.alert("Empty List", "Add some products to your list before shopping!");
      return;
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Start Shopping",
      `Ready to shop for ${productIds.length} item(s)?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start",
          style: "default",
          onPress: () => {
            updateStatusInListStore('ongoing');
            updateStatusInListsStore(listId, 'ongoing');

            if (process.env.EXPO_OS === "ios") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            console.log("🛒 Shopping started for list:", listId);

            setTimeout(() => {
              console.log("🛒 Navigating to shopping guide for list:", listId);
              router.push(`/(index)/list/${listId}/shopping-guide`);
            }, 100);
          },
        },
      ]
    );
  };

  const handleViewShoppingGuide = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    console.log("🗺️ Opening shopping guide for list:", listId);
    router.push(`/(index)/list/${listId}/shopping-guide`);
  };

  const handleCompleteShopping = async () => {
    Alert.alert(
      "Complete Shopping",
      `This will:\n• Add ${productIds.length} items to your inventory\n• Move this list to Purchase History\n\nContinue?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          style: "default",
          onPress: async () => {
            console.log("🛍️ Completing shopping for list:", listId);
            console.log("📦 Products to add:", productsData.length);

            try {
              // Add all products to inventory
              addInventoryItems(productsData, listId, user?.id || 'unknown');
              console.log("✅ Successfully added items to inventory");

              // 🔔 TRACK EACH PURCHASE FOR LOW STOCK MONITORING
              console.log("🔔 Tracking purchases for low stock alerts...");
              let trackedCount = 0;
              
              for (const product of productsData) {
                if (product.databaseProductId && product.databaseProductId > 0) {
                  try {
                    const tracked = await trackPurchase(product.databaseProductId, product.name);
                    if (tracked) {
                      trackedCount++;
                    }
                  } catch (error) {
                    console.error(`❌ Failed to track purchase for ${product.name}:`, error);
                  }
                }
              }
              
              console.log(`✅ Tracked ${trackedCount}/${productsData.length} purchases for low stock monitoring`);

              // Update status in BOTH stores for persistence
              updateStatusInListStore('completed');
              updateStatusInListsStore(listId, 'completed');

              if (process.env.EXPO_OS === "ios") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              Alert.alert(
                "Shopping Completed!",
                `✅ Added ${productIds.length} items to your inventory\n✅ List moved to Purchase History\n🔔 Tracking ${trackedCount} items for low stock alerts`,
                [
                  {
                    text: "View Inventory",
                    onPress: () => router.push("/(index)/(tabs)/inventory"),
                  },
                  {
                    text: "View History",
                    onPress: () => router.push("/(index)/(tabs)/shopping-lists"),
                  },
                  {
                    text: "OK",
                    style: "cancel",
                  },
                ]
              );

              console.log("✅ Shopping completed for list:", listId);
            } catch (error) {
              console.error("❌ Error completing shopping:", error);
              Alert.alert('Error', 'Failed to complete shopping. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRestoreList = () => {
    Alert.alert(
      "Restore List",
      "Move this list back to active shopping lists?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          style: "default",
          onPress: () => {
            updateStatusInListStore('regular');
            updateStatusInListsStore(listId, 'regular');

            if (process.env.EXPO_OS === "ios") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            console.log("♻️ List restored:", listId);
          },
        },
      ]
    );
  };

  if (productIds.length === 0) {
    return null;
  }

  if (currentStatus === 'completed') {
    console.log("🔍 Rendering COMPLETED buttons");
    return (
      <View style={styles.container}>
        <Pressable onPress={handleRestoreList} style={styles.restoreButton}>
          <IconSymbol name="arrow.counterclockwise" size={20} color="#007AFF" />
          <ThemedText style={styles.restoreText}>
            Restore List
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (currentStatus === 'ongoing') {
    console.log("🔍 Rendering ONGOING buttons");
    return (
      <View style={styles.container}>
        <Pressable onPress={handleViewShoppingGuide} style={styles.guideButton}>
          <IconSymbol name="map.fill" size={20} color="#007AFF" />
          <ThemedText style={styles.guideText}>
            View Shopping Guide & Map
          </ThemedText>
        </Pressable>

        <Pressable onPress={handleCompleteShopping} style={styles.completeButton}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>
            Complete Shopping
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handleShopNow} style={styles.shopButton}>
        <IconSymbol name="bag" size={20} color="#fff" />
        <ThemedText style={styles.buttonText}>
          Shop Now ({productIds.length})
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F2F2F7",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  guideText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#34C759",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F2F2F7",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  restoreText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});