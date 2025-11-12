import React from "react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { appleRed, borderColor } from "@/constants/Colors";
import {
  useDelShoppingListProductCallback,
  useShoppingListProductCell,
  useShoppingListValue,
} from "@/stores/ShoppingListStore";
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import { useListNotifications } from "@/utils/notifyCollaborators";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

export default function ShoppingListProductItem({
  listId,
  productId,
}: {
  listId: string;
  productId: string;
}) {
  const router = useRouter();
  const [name] = useShoppingListProductCell(listId, productId, "name");
  const [quantity] = useShoppingListProductCell(listId, productId, "quantity");
  const [units] = useShoppingListProductCell(listId, productId, "units");
  const [color] = useShoppingListValue(listId, "color");
  const [isPurchased, setIsPurchased] = useShoppingListProductCell(
    listId,
    productId,
    "isPurchased"
  );
  
  // New store selection fields
  const [selectedStore] = useShoppingListProductCell(listId, productId, "selectedStore");
  const [selectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
  const [category] = useShoppingListProductCell(listId, productId, "category");

  // ✅ Get list data for collaborators
  const listData = useShoppingListData(listId);
  
  // ✅ Initialize notifications
  const listNotifications = useListNotifications({
    listId: listId,
    listName: listData?.name || "",
    emoji: listData?.emoji || "🛒",
    collaborators: (listData as any)?.collaborators || [],
  });

  const deleteCallback = useDelShoppingListProductCallback(listId, productId);

  // ✅ Enhanced delete callback with notification
  const handleDelete = async () => {
    // Call the original delete callback
    deleteCallback();
    
    // Notify collaborators
    await listNotifications.notifyItemRemoved(name);
  };

  // ✅ Enhanced toggle purchased with notification
  const handleTogglePurchased = async () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
    
    const newPurchasedState = !isPurchased;
    setIsPurchased(newPurchasedState);
    
    // Notify collaborators
    if (newPurchasedState) {
      await listNotifications.notifyItemPurchased(name);
    } else {
      await listNotifications.notifyItemUnpurchased(name);
    }
  };

  const totalPrice = selectedPrice * quantity;

  const RightAction = (
    prog: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 80 }],
      };
    });

    return (
      <Pressable onPress={handleDelete}>
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <IconSymbol name="trash.fill" size={24} color="white" />
        </Reanimated.View>
      </Pressable>
    );
  };

  return (
    <ReanimatedSwipeable
      key={productId}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={RightAction}
      overshootRight={false}
      enableContextMenu
      containerStyle={styles.container}
    >
      <View style={styles.productContainer}>
        <View style={styles.checkboxContainer}>
          <Pressable onPress={handleTogglePurchased}>
            <IconSymbol
              name={isPurchased ? "checkmark.circle.fill" : "circle"}
              size={28}
              color={color}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            router.push({
              pathname: "/list/[listId]/product/[productId]",
              params: { listId, productId },
            });
          }}
          style={styles.productContent}
        >
          <View style={styles.productMain}>
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.productName,
                isPurchased && styles.strikethrough
              ]}
            >
              {name}
            </ThemedText>
            
            <View style={styles.productDetails}>
              <ThemedText
                type="default"
                style={[
                  styles.quantityText,
                  isPurchased && styles.strikethrough
                ]}
              >
                {quantity} {units}
              </ThemedText>
              
              {category && (
                <ThemedText style={styles.categoryDot}>•</ThemedText>
              )}
              
              {category && (
                <ThemedText
                  type="default"
                  style={[
                    styles.categoryText,
                    isPurchased && styles.strikethrough
                  ]}
                >
                  {category}
                </ThemedText>
              )}
            </View>

            {/* Store and Price Information */}
            {(selectedStore || selectedPrice > 0) && (
              <View style={styles.storeInfo}>
                {selectedStore && (
                  <View style={styles.storeContainer}>
                    <IconSymbol name="storefront" size={12} color="#666" />
                    <ThemedText
                      type="default"
                      style={[
                        styles.storeText,
                        isPurchased && styles.strikethrough
                      ]}
                    >
                      {selectedStore}
                    </ThemedText>
                  </View>
                )}
                
                {selectedPrice > 0 && (
                  <View style={styles.priceContainer}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.priceText,
                        isPurchased && styles.strikethrough
                      ]}
                    >
                      ₱{selectedPrice.toFixed(2)}/{units}
                    </ThemedText>
                    
                    {quantity > 1 && (
                      <ThemedText
                        type="default"
                        style={[
                          styles.totalPriceText,
                          isPurchased && styles.strikethrough
                        ]}
                      >
                        (₱{totalPrice.toFixed(2)} total)
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkboxContainer: {
    paddingTop: 2,
  },
  productContent: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColor,
    paddingBottom: 12,
  },
  productMain: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  quantityText: {
    fontSize: 14,
    color: "#666",
  },
  categoryDot: {
    marginHorizontal: 6,
    color: "#ccc",
  },
  categoryText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  storeInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  storeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeText: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  priceText: {
    fontSize: 14,
    color: "#007AFF",
  },
  totalPriceText: {
    fontSize: 12,
    color: "#007AFF",
    opacity: 0.8,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  rightAction: {
    width: 80,
    height: 40,
    backgroundColor: appleRed,
    alignItems: "center",
    justifyContent: "center",
  },
});