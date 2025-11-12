// This file is a fallback for using MaterialIcons on Android and web.

import React from "react";
import { SymbolWeight } from "expo-symbols";
import {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  
  // Navigation & Actions
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  plus: "add",
  minus: "remove",
  
  // User & Settings
  person: "person",
  gear: "settings",
  
  // Biometric & Security
  "hand.raised": "fingerprint",
  "hand.raised.fill": "fingerprint",
  "faceid": "face",
  "touchid": "fingerprint",
  
  // Lists & Tasks
  "list.bullet.clipboard": "assignment",
  "clipboard": "assignment",
  "clipboard.fill": "assignment",
  "pencil.and.list.clipboard": "edit",
  "checkmark.square.fill": "check-box",
  "checkmark.circle.fill": "check-circle",
  square: "square",
  circle: "circle",
  
  // Delete & Remove
  trash: "delete",
  "trash.fill": "delete",
  
  // Share & QR
  "square.and.arrow.up": "share",
  "qrcode.viewfinder": "qr-code-scanner",
  
  // Visibility & Browse
  eye: "visibility",
  "eye.fill": "visibility",
  "eye.slash": "visibility-off",
  "eye.slash.fill": "visibility-off",
  
  // Dashboard & Analytics Icons
  calendar: "event",
  "calendar.fill": "event",
  "chart.bar": "bar-chart",
  "chart.bar.fill": "bar-chart",
  "chart.line.uptrend.xyaxis": "show-chart",
  clock: "schedule",
  "clock.fill": "schedule",
  cart: "shopping-cart",
  "cart.fill": "shopping-cart",
  
  // Shopping & Inventory
  "cart.badge.plus": "add-shopping-cart",
  bag: "shopping-bag",
  "bag.fill": "shopping-bag",
  basket: "shopping-basket",
  "basket.fill": "shopping-basket",
  
  // Money & Finance
  "dollarsign.circle": "attach-money",
  "dollarsign.circle.fill": "attach-money",
  "creditcard": "credit-card",
  "creditcard.fill": "credit-card",
  
  // Notifications
  bell: "notifications",
  "bell.fill": "notifications",
  "bell.badge": "notifications-active",
  "bell.badge.fill": "notifications-active",
  
  // Storage & Inventory
  refrigerator: "kitchen",
  snowflake: "ac-unit",
  box: "inventory",
  "box.fill": "inventory",
  
  // Food Categories
  leaf: "eco",
  "leaf.fill": "eco",
  
  // Status & Info
  "info.circle": "info",
  "info.circle.fill": "info",
  "exclamationmark.triangle": "warning",
  "exclamationmark.triangle.fill": "warning",
  "checkmark.seal": "verified",
  "checkmark.seal.fill": "verified",
  
  // Search & Filter
  magnifyingglass: "search",
  "line.horizontal.3.decrease": "filter-list",
  "line.3.horizontal.decrease.circle": "filter-list",
  "line.3.horizontal.decrease.circle.fill": "filter-list",
  "arrow.up.arrow.down": "sort",
  "arrow.up.down": "sort",
  
  // Documents & Files
  doc: "description",
  "doc.fill": "description",
  folder: "folder",
  "folder.fill": "folder",
  
  // More actions
  "ellipsis.circle": "more-horiz",
  "ellipsis.circle.fill": "more-horiz",
  star: "star-border",
  "star.fill": "star",
  heart: "favorite-border",
  "heart.fill": "favorite",
  
  // Arrows
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  
  // Location
  location: "place",
  "location.fill": "place",
  map: "map",
  "map.fill": "map",
} as Partial<
  Record<
    import("expo-symbols").SymbolViewProps["name"],
    React.ComponentProps<typeof MaterialIcons>["name"]
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style as StyleProp<TextStyle>}
    />
  );
}