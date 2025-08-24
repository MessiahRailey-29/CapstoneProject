import * as React from "react";
import { ThemedText } from "./ThemedText";
import { useShoppingListProductCount, useShoppingListUserNicknames, useShoppingListValue } from "@/stores/ShoppingListStore";
import { useDelShoppingListCallback } from "@/stores/ShoppingListsStore";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { appleRed, borderColor } from "@/constants/Colors";
import { Link } from "expo-router";
import IconCircle from "./IconCircle";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable"
import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { IconSymbol } from "./ui/IconSymbol";
import Reanimated from "react-native-reanimated";

export default function ShoppingListItem({ listId }: {listId: string}) {
    const [name] = useShoppingListValue (listId, "name");
    const [emoji] = useShoppingListValue (listId, "emoji");
    const [color] = useShoppingListValue (listId, "color");
    const productCount = useShoppingListProductCount (listId);
    const userNicknames = useShoppingListUserNicknames (listId);

    const deleteCallback = useDelShoppingListCallback(listId);

    const RightAction = (
            prog: SharedValue<number>,
            drag: SharedValue<number>
    ) => {
        const styleAnimation = useAnimatedStyle(() => ({
            transform: [{translateX: drag.value +200}],
        }));

        return (
            <Pressable
            onPress={deleteCallback}
            >
                <Reanimated.View style={[styleAnimation, styles.rightAction]}>
                    <IconSymbol name = "trash.fill" size={24} color="white"/>
                </Reanimated.View>
            </Pressable>
        )
    }
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
        <Link href = {{pathname: "/list/[listId]", params:{listId}}}>
        <View style={styles.swipeable}>
            <View>
                <IconCircle emoji={emoji} backgroundColor={color}/>
                <View style = {styles.textContent}>
                    <ThemedText type= "defaultSemiBold" numberOfLines={2}>
                        {name}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.productCount}>
                        {productCount} product {productCount==1 ? "" : "s"} 
                    </ThemedText>
                </View>
            </View>
        </View>
        </Link>
        </ReanimatedSwipeable>
        </Animated.View>
    );
}

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
  productCount: {
    fontSize: 12,
    color: "gray",
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