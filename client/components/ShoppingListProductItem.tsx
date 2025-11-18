// FIXED: ShoppingListProductItem.tsx - Never touch status when toggling isPurchased
import React from "react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { appleRed, backgroundColors, borderColor } from "@/constants/Colors";
import {
  useDelShoppingListProductCallback,
  useShoppingListProductCell,
  useShoppingListValue,
  useShoppingListStore,
} from "@/stores/ShoppingListStore";
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import { useListNotifications } from "@/utils/notifyCollaborators";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";
import { Colors } from "@/constants/Colors"

export default function ShoppingListProductItem({
  listId,
  productId,
  status = 'regular',
}: {
  listId: string;
  productId: string;
  status?: 'regular' | 'ongoing' | 'completed';
}) {
  const router = useRouter();
  const store = useShoppingListStore(listId);
  const [name] = useShoppingListProductCell(listId, productId, "name");
  const [quantity] = useShoppingListProductCell(listId, productId, "quantity");
  const [units] = useShoppingListProductCell(listId, productId, "units");
  const [color] = useShoppingListValue(listId, "color");
  const [isPurchased, setIsPurchased] = useShoppingListProductCell(
    listId,
    productId,
    "isPurchased"
  );

  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);
  
  const [selectedStore] = useShoppingListProductCell(listId, productId, "selectedStore");
  const [selectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
  const [category] = useShoppingListProductCell(listId, productId, "category");

  const listData = useShoppingListData(listId);
  
  const listNotifications = useListNotifications({
    listId: listId,
    listName: listData?.name || "",
    emoji: listData?.emoji || "🛒",
    collaborators: (listData as any)?.collaborators || [],
  });

  const deleteCallback = useDelShoppingListProductCallback(listId, productId);

  const handleDelete = async () => {
    deleteCallback();
    await listNotifications.notifyItemRemoved(name);
  };

  // 🔧 CRITICAL FIX: Prevent ANY accidental status changes
  const handleTogglePurchased = () => {
    if (status !== 'ongoing') {
      return;
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
    
    console.log('🔄 Toggling purchased state for:', name);
    console.log('📊 BEFORE toggle - Current list status:', status);
    
    // 🔧 CRITICAL: Get current status from store BEFORE toggling
    const currentStatus = store?.getValue('status');
    console.log('📊 Status in store before toggle:', currentStatus);
    
    const newPurchasedState = !isPurchased;
    
    // 🔧 CRITICAL FIX: Use transaction to ensure atomic update with status preservation
    if (store) {
      store.transaction(() => {
        // Toggle the purchased state
        setIsPurchased(newPurchasedState);
        
        // 🔧 CRITICAL: Explicitly preserve the status
        if (currentStatus === 'ongoing') {
          store.setValue('status', 'ongoing');
          console.log('✅ Explicitly preserved status as "ongoing" in transaction');
        }
      });
    } else {
      // Fallback if no store
      setIsPurchased(newPurchasedState);
    }
    
    console.log('✅ Toggled purchased state to:', newPurchasedState);
    console.log('⚠️ List status MUST remain as:', status);
    
    // Verify status after toggle
    setTimeout(() => {
      const statusAfter = store?.getValue('status');
      console.log('📊 Status verification after toggle:', statusAfter);
      if (statusAfter !== 'ongoing') {
        console.error('🚨 CRITICAL ERROR: Status was changed to:', statusAfter);
        console.error('🚨 This should NEVER happen when toggling isPurchased!');
      }
    }, 100);
    
    // Notify collaborators after a delay to not block UI
    setTimeout(async () => {
      try {
        if (newPurchasedState) {
          await listNotifications.notifyItemPurchased(name);
        } else {
          await listNotifications.notifyItemUnpurchased(name);
        }
        console.log('📢 Notification sent successfully');
      } catch (error) {
        console.error('❌ Error notifying collaborators:', error);
      }
    }, 0);
  };

  const totalPrice = selectedPrice * quantity;
  const isCheckButtonEnabled = status === 'ongoing';

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
      <Pressable onPress={handleDelete} >
        <Reanimated.View style={[styleAnimation, styles.rightAction,styles.delete]}>
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
          <Pressable 
            onPress={handleTogglePurchased}
            disabled={!isCheckButtonEnabled}
            style={{ opacity: isCheckButtonEnabled ? 1 : 0.3 }}
          >
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.mainBackground,
    flex: 1,
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
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 8,
    gap: 4,
    borderColor: colors.borderColor,
    borderWidth: 0.7,
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
    marginLeft: 6,
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
  delete:{
    backgroundColor: 'red',
    flex: 1
  }
});