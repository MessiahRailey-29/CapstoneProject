import * as React from "react";
import { ThemedText } from "./ThemedText";
import {
  useShoppingListProductCount,
  useShoppingListUserNicknames,
  useShoppingListValue,
} from "@/stores/ShoppingListStore";
import {
  useDelShoppingListCallback,
  useShoppingListData,
} from "@/stores/ShoppingListsStore";
import {
  Animated,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { appleRed, borderColor } from "@/constants/Colors";
import { Link } from "expo-router";
import IconCircle from "./IconCircle";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { IconSymbol } from "./ui/IconSymbol";
import Reanimated from "react-native-reanimated";

// Date utility functions
const formatShoppingDate = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (date < today) return "Past due";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

const getDateStatusColor = (dateString: string | null | undefined): string => {
  if (!dateString) return "#999";
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date < today) return "#FF3B30";
    if (date.getTime() === today.getTime()) return "#FF9500";
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) return "#34C759";
    return "#007AFF";
  } catch {
    return "#999";
  }
};

export default function ShoppingListItem({ listId }: { listId: string }) {
  // Get data from both stores
  const [name] = useShoppingListValue(listId, "name");
  const [emoji] = useShoppingListValue(listId, "emoji");
  const [color] = useShoppingListValue(listId, "color");
  const productCount = useShoppingListProductCount(listId);
  const userNicknames = useShoppingListUserNicknames(listId);

  // Get metadata from ShoppingListsStore (includes shopping date!)
  const listData = useShoppingListData(listId);

  // Use fallbacks to ensure we always have display values
  const displayName = name || listData.name || "";
  const displayEmoji = emoji || listData.emoji || "📝";
  const displayColor = color || listData.color || "#ccc";
  const shoppingDate = listData.shoppingDate; // Get date from listData!

  const deleteCallback = useDelShoppingListCallback(listId);

  const formattedDate = formatShoppingDate(shoppingDate);
  const dateColor = getDateStatusColor(shoppingDate);

  console.log('ShoppingListItem Debug:', {
    listId,
    shoppingDate,
    formattedDate,
    listDataShoppingDate: listData.shoppingDate
  });

  const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ translateX: drag.value + 200 }],
    }));

    return (
      <Pressable onPress={deleteCallback}>
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <IconSymbol name="trash.fill" size={24} color="white" />
        </Reanimated.View>
      </Pressable>
    );
  };

  return (
    <Animated.View>
      <ReanimatedSwipeable
        key={listId}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}
        overshootRight={false}
        enableContextMenu
      >
        <Link href={{ pathname: "/list/[listId]", params: { listId } }}>
          <View style={styles.swipeable}>
            <View style={styles.leftContent}>
              <IconCircle emoji={displayEmoji} backgroundColor={displayColor} />
              <View style={styles.textContent}>
                <ThemedText type="defaultSemiBold" numberOfLines={2}>
                  {displayName}
                </ThemedText>
                <View style={styles.metaInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.productCount}>
                    {productCount} product{productCount === 1 ? "" : "s"}
                  </ThemedText>
                  {formattedDate && (
                    <>
                      <ThemedText style={styles.metaDot}>•</ThemedText>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[styles.dateText, { color: dateColor }]}
                      >
                        {formattedDate}
                      </ThemedText>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.rightContent}>
                {userNicknames.length > 1 && (
                  <View style={styles.nicknameContainer}>
                    {userNicknames.length === 4
                      ? userNicknames.map((nickname, index) => (
                          <NicknameCircle
                            key={nickname}
                            nickname={nickname}
                            color={displayColor}
                            index={index}
                          />
                        ))
                      : userNicknames.length > 4
                      ? userNicknames
                          .slice(0, 4)
                          .map((nickname, index) => (
                            <NicknameCircle
                              key={nickname}
                              nickname={nickname}
                              color={displayColor}
                              index={index}
                              isEllipsis={index === 3}
                            />
                          ))
                      : userNicknames.map((nickname, index) => (
                          <NicknameCircle
                            key={nickname}
                            nickname={nickname}
                            color={displayColor}
                            index={index}
                          />
                        ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Link>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

export const NicknameCircle = ({
  nickname,
  color,
  index = 0,
  isEllipsis = false,
}: {
  nickname: string;
  color: string;
  index?: number;
  isEllipsis?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ThemedText
      type="defaultSemiBold"
      style={[
        styles.nicknameCircle,
        isEllipsis && styles.ellipsisCircle,
        {
          backgroundColor: color,
          borderColor: isDark ? "#000000" : "#ffffff",
          marginLeft: index > 0 ? -6 : 0,
        },
      ]}
    >
      {isEllipsis ? "..." : nickname[0].toUpperCase()}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    width: 200,
    height: 65,
    backgroundColor: appleRed,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeable: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColor,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  textContent: {
    flexShrink: 1,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productCount: {
    fontSize: 12,
    color: "gray",
  },
  metaDot: {
    fontSize: 12,
    color: "#ccc",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nicknameContainer: {
    flexDirection: "row",
    marginRight: 4,
  },
  nicknameCircle: {
    fontSize: 12,
    color: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 16,
    padding: 1,
    width: 24,
    height: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  ellipsisCircle: {
    lineHeight: 0,
    marginLeft: -6,
  },
});