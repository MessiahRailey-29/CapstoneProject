import React, { useMemo, useState } from "react";
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
import { useUser } from "@clerk/clerk-expo";
import { useNotifications } from "@/hooks/useNotifications";
import CustomAlert from "./ui/CustomAlert";
import { useAddInventoryWithDuplicateCheck } from "@/hooks/useAddInventoryWithDuplicateCheck";

interface ShopNowButtonProps {
  listId: string;
  currentStatus?: 'regular' | 'ongoing' | 'completed';
  showCustomAlert: (title: string, message: string, buttons?: any[]) => void;
}

export default function ShopNowButton({ listId, currentStatus = 'regular',
  showCustomAlert }: ShopNowButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const productIds = useShoppingListProductIds(listId);
  const updateStatusInListsStore = useUpdateShoppingListStatus();
  const updateStatusInListStore = useUpdateListStatus(listId);
  const { checkForDuplicates, addItems, addItemsAnyway } = useAddInventoryWithDuplicateCheck();

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);


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
      showCustomAlert("Empty List", "Add some products to your list before shopping!");
      return;
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    showCustomAlert(
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
            console.log("🛒 Starting shopping session...");
            console.log("📦 Products before status change:", productIds.length);

            // CRITICAL FIX: Verify products exist in store before changing status
            if (!store) {
              console.error("❌ Store not available!");
              showCustomAlert("Error", "Unable to start shopping. Please try again.");
              return;
            }

            const currentProducts = store.getTable("products");
            const productCount = Object.keys(currentProducts).length;

            console.log("📦 Products in store:", productCount);
            console.log("📦 Product IDs:", Object.keys(currentProducts).join(', '));

            if (productCount === 0) {
              console.error("❌ No products found in store!");
              showCustomAlert("Error", "No products found. Please refresh and try again.");
              return;
            }

            // FIX: Update ONLY the parent store, let the sync handle the individual store
            // This prevents the dual-update race condition
            updateStatusInListsStore(listId, 'ongoing');

            // Wait for sync to propagate
            setTimeout(() => {
              // Verify products are still there after status change
              const productsAfterUpdate = store.getTable("products");
              const countAfter = Object.keys(productsAfterUpdate).length;

              console.log("📦 Products after status change:", countAfter);

              if (countAfter === 0) {
                console.error("🚨 PRODUCTS WERE LOST DURING STATUS UPDATE!");
                showCustomAlert(
                  "Error",
                  "Products were lost during status update. Please don't start shopping and contact support."
                );
                // Try to rollback
                updateStatusInListsStore(listId, 'regular');
                return;
              }

              if (process.env.EXPO_OS === "ios") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              console.log("✅ Shopping started for list:", listId);

              // Navigate to shopping guide first, then the tab will auto-switch
              setTimeout(() => {
                console.log("🛒 Navigating to shopping guide for list:", listId);
                router.push(`/(index)/list/${listId}/shopping-guide`);
              }, 100);
            }, 500); // Increased delay to ensure sync completes
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
    // Check for duplicates first
    const duplicates = checkForDuplicates(productsData);

    if (duplicates.length > 0) {
      // Show duplicate warning with choice
      const duplicateList = duplicates
        .map(d => `• ${d.newItem.name} (already have ${d.existingItem.quantity} ${d.existingItem.units})`)
        .join('\n');

      showCustomAlert(
        "Duplicate Items Found",
        `The following items already exist in your inventory:\n\n${duplicateList}\n\nWhat would you like to do?`,
        [
          {
            text: "Discard Duplicates",
            style: "default",
            onPress: () => {
              // Add only non-duplicates
              console.log(`🗑️ Discarding ${duplicates.length} duplicate items`);
              completeShoppingWithItems(false);
            },
          },
          {
            text: "Add Anyway",
            style: "default",
            onPress: () => {
              // Add all items including duplicates
              console.log(`✅ Adding all items including ${duplicates.length} duplicates`);
              completeShoppingWithItems(true);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      // No duplicates, proceed normally
      showCustomAlert(
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
            onPress: () => completeShoppingWithItems(true),
          },
        ]
      );
    }
  };

  const completeShoppingWithItems = async (addDuplicates: boolean) => {
    console.log("🛍️ Completing shopping for list:", listId);
    console.log("📦 Products to add:", productsData.length);

    try {
      // Add products to inventory based on user choice
      let addedIds: string[];
      if (addDuplicates) {
        addedIds = addItemsAnyway(productsData, listId, user?.id || 'unknown');
      } else {
        addedIds = addItems(productsData, listId, user?.id || 'unknown');
      }

      const addedCount = addedIds.length;
      console.log(`✅ Successfully added ${addedCount} items to inventory`);

      // Track purchases for low stock monitoring
      console.log("📊 Tracking purchases for low stock alerts...");
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

      // FIX: Update ONLY parent store, let sync handle individual store
      updateStatusInListsStore(listId, 'completed');

      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const skippedCount = productsData.length - addedCount;
      const successMessage = skippedCount > 0
        ? `✅ Added ${addedCount} items to your inventory\n⚠️ Skipped ${skippedCount} duplicate item(s)\n✅ List moved to Purchase History\n📊 Tracking ${trackedCount} items for low stock alerts`
        : `✅ Added ${addedCount} items to your inventory\n✅ List moved to Purchase History\n📊 Tracking ${trackedCount} items for low stock alerts`;

      showCustomAlert(
        "Shopping Completed!",
        successMessage,
        [
          {
            text: "View Inventory",
            onPress: () => router.push("/(index)/(tabs)/inventory"),
          },
          {
            text: "View History",
            onPress: () => {
              router.push({
                pathname: "/(index)/(tabs)/shopping-lists",
                params: { tab: "history" },
              });
            },
          },
          {
            text: "OK",
            style: "cancel",
            onPress: () => {
              router.back();
            },
          },
        ]
      );

      console.log("✅ Shopping completed for list:", listId);
    } catch (error) {
      console.error("❌ Error completing shopping:", error);
      showCustomAlert('Error', 'Failed to complete shopping. Please try again.');
    }
  };



  const handleRestoreList = () => {
    showCustomAlert(
      "Restore List",
      "Move this list back to active shopping lists? All items will be marked as unpurchased.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          style: "default",
          onPress: async () => {
            console.log("♻️ Restoring list:", listId);
            console.log("📦 Resetting all products to unchecked...");

            try {
              // Reset all products to unchecked (isPurchased = false)
              if (store && productIds && productIds.length > 0) {
                // Use transaction to ensure atomic update
                store.transaction(() => {
                  for (const productId of productIds) {
                    try {
                      store.setCell("products", productId, "isPurchased", false);
                      console.log(`✅ Reset product ${productId} to unchecked`);
                    } catch (error) {
                      console.error(`❌ Error resetting product ${productId}:`, error);
                    }
                  }
                });
                console.log(`✅ Reset ${productIds.length} products to unchecked`);
              }

              // Wait for product updates to sync
              await new Promise(resolve => setTimeout(resolve, 500));

              // FIX: Update ONLY parent store, let sync handle individual store
              updateStatusInListsStore(listId, 'regular');

              if (process.env.EXPO_OS === "ios") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              // Navigate back to shopping lists on active tab
              router.push("/(index)/(tabs)/shopping-lists");
              // User can manually switch to active tab to see their restored list

              console.log("✅ List restored successfully");
            } catch (error) {
              console.error("❌ Error restoring list:", error);
              showCustomAlert('Error', 'Failed to restore list. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (productIds.length === 0) {
    return null;
  }

  if (currentStatus === 'completed') {
    console.log("📋 Rendering COMPLETED buttons");
    return (

      <View style={styles.container}>
        <Pressable onPress={handleRestoreList} style={styles.restoreButton}>
          <IconSymbol name="arrow.counterclockwise" size={20} color="#007AFF" />
          <ThemedText style={styles.restoreText}>
            Restore List
          </ThemedText>
        </Pressable>
        <CustomAlert
          visible={customAlertVisible}
          title={customAlertTitle}
          message={customAlertMessage}
          buttons={customAlertButtons}
          onClose={() => setCustomAlertVisible(false)}
        />
      </View>
    );
  }

  if (currentStatus === 'ongoing') {
    console.log("📋 Rendering ONGOING buttons");
    return (
      <View style={styles.container}>
        <Pressable onPress={handleViewShoppingGuide} style={styles.guideButton}>
          <IconSymbol name="map.fill" size={20} color="#007AFF" />
          <ThemedText style={styles.guideText}>
            View Shopping Guide & Map
          </ThemedText>
          <CustomAlert
            visible={customAlertVisible}
            title={customAlertTitle}
            message={customAlertMessage}
            buttons={customAlertButtons}
            onClose={() => setCustomAlertVisible(false)}
          />
        </Pressable>

        <Pressable onPress={handleCompleteShopping} style={styles.completeButton}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>
            Complete Shopping
          </ThemedText>
        </Pressable>
        <CustomAlert
          visible={customAlertVisible}
          title={customAlertTitle}
          message={customAlertMessage}
          buttons={customAlertButtons}
          onClose={() => setCustomAlertVisible(false)}
        />
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
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
        onClose={() => setCustomAlertVisible(false)}
      />
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