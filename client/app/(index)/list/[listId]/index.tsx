import React, { useEffect, useRef, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Alert, ActivityIndicator, useColorScheme, StyleSheet, SectionList } from "react-native";
import ShoppingListProductItem from "@/components/ShoppingListProductItem";
import BudgetSummary from "@/components/BudgetSummary";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductIds,
  useShoppingListValue,
  useShoppingListStore,
} from "@/stores/ShoppingListStore";
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import ShopNowButton from "@/components/ShopNowButton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAddProductWithNotifications } from "@/hooks/useAddProductWithNotifications";
import { useListNotifications } from "@/utils/notifyCollaborators";
import { Colors } from "@/constants/Colors";
import FloatingActionFab from "@/components/ShoppingListFaB";
import { registerStoreForList, unregisterStoreForList } from '@/stores/getStoreForList';
import CustomAlert from "@/components/ui/CustomAlert";

interface ProductSection {
  title: string;
  data: string[];
}

export default function ListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = params.listId as string;

  // 🐛 DEBUG: Track render count
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`🔄 RENDER #${renderCount.current} - ListScreen for ${listId}`);

  const handleFabAction = (key) => {
    switch (key) {
      case 'edit':
        router.push({
          pathname: "/list/[listId]/edit",
          params: { listId },
        });
        break;
      case 'duplicates':
        router.push({
          pathname: "/list/[listId]/duplicate-check",
          params: { listId },
        });
        break;
      case 'share':
        router.push({
          pathname: "/list/[listId]/share",
          params: { listId },
        });
        break;
      case 'add':
        router.push({
          pathname: "/list/[listId]/product/new",
          params: { listId },
        });
        break;
    }
}
  //colors and schemes
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  const addProductId = params.addProductId ? Number(params.addProductId) : null;
  const addProductName = params.addProductName as string | undefined;
  const addProductPrice = params.addProductPrice ? Number(params.addProductPrice) : null;
  const addProductStore = params.addProductStore as string | undefined;

  const hasAddedProduct = useRef(false);

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);

  const showCustomAlert = (title: string, message: string, buttons?: any[]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(
      buttons || [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
    );
    setCustomAlertVisible(true);
  };

  // Raw values from valuesCopy (always available)
  const listData = useShoppingListData(listId);

  // Hydrated values (can be blank until hydration completes)
  const [name] = useShoppingListValue(listId, "name");
  const [emoji] = useShoppingListValue(listId, "emoji");
  const [description] = useShoppingListValue(listId, "description");
  const [hydratedBudget] = useShoppingListValue(listId, "budget");
  const productIds = useShoppingListProductIds(listId);
  const store = useShoppingListStore(listId);

  useEffect(() => {
    registerStoreForList(listId, store);
    return () => unregisterStoreForList(listId);
  }, [listId, store]);

  const prevProductIdsRef = useRef(productIds);
  useEffect(() => {
    if (prevProductIdsRef.current.length !== productIds.length) {
      console.log(`📦 PRODUCT IDS CHANGED: ${prevProductIdsRef.current.length} → ${productIds.length}`);
      prevProductIdsRef.current = productIds;
    }
  }, [productIds]);


  // ✅ CRITICAL FIX: Check if data is still loading
  // If BOTH listData and hydrated values are empty, we're still loading
  const isLoadingData = !listData.name && !name;
  
  // 📍 Get the add product function - safe to call here since we're in a component
  const addProduct = useAddProductWithNotifications(listId);

  // ✅ Initialize notification system for this list
  const listNotifications = useListNotifications({
    listId: listId,
    listName: listData?.name || "",
    emoji: listData?.emoji || "🛒",
    collaborators: (listData as any)?.collaborators || [],
  });

  // Safe fallbacks - prioritize hydrated values, then listData
  const displayName = name || listData.name || "";
  const displayEmoji = emoji || listData.emoji || "❓";
  const displayDescription = description || listData.description || "";
  const budget = hydratedBudget ?? listData.budget ?? 0;

  // Use listData.status as the source of truth
  const status = (listData.status || 'regular') as 'regular' | 'ongoing' | 'completed';
  const isHistory = status === 'completed';

  // ⭐ NEW: Group products by category
  const categorizedProducts = useMemo(() => {
    if (!store || !productIds || productIds.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, string[]>();

    productIds.forEach(productId => {
      const product = store.getRow("products", productId);
      const category = (product?.category as string) || 'Uncategorized';

      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(productId);
    });

    const sections: ProductSection[] = Array.from(categoryMap.entries())
      .sort(([catA], [catB]) => {
        if (catA === 'Uncategorized') return 1;
        if (catB === 'Uncategorized') return -1;
        return catA.localeCompare(catB);
      })
      .map(([category, productIds]) => ({
        title: category,
        data: productIds,
      }));

    return sections;
  }, [store, productIds]);

  // ✅ FIX: Use correct route path
  const navigateToNewProduct = () => {
    router.push({
      pathname: "/list/[listId]/product/new",
      params: { listId },
    });
  };

  // ✅ SHOW LOADING STATE while data is syncing
  if (isLoadingData) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: "Loading...",
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={{ marginTop: 16, color: 'gray' }}>
            Loading list data...
          </ThemedText>
        </View>
      </>
    );
  }

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

      {/* Budget Summary */}
      <BudgetSummary listId={listId} budget={budget} />


      {/* Shop Now Button with status */}
      <ShopNowButton listId={listId} currentStatus={status} />
    </View>
  );

  // Render category header
  const renderSectionHeader = ({ section }: { section: ProductSection }) => (
    <View style={styles.categoryHeader}>
      <View style={styles.categoryHeaderContent}>
        <ThemedText style={styles.categoryTitle}>{section.title}</ThemedText>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryCount}>{section.data.length}</ThemedText>
        </View>
      </View>
      <View style={styles.categoryDivider} />
    </View>
  );

  // Render product item
  const renderItem = ({ item: productId }: { item: string }) => (
    <ShoppingListProductItem
      listId={listId}
      productId={productId}
      status={status}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.mainBackground },
          headerTitle: displayEmoji + " " + displayName,
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
            </View>
          ),
        }}
      />

      <View style={{
        backgroundColor: colors.mainBackground,
        flex: 1
      }}>
        <SectionList
          sections={categorizedProducts}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 100,
            backgroundColor: colors.mainBackground,
          }}
          contentInsetAdjustmentBehavior="automatic"
          ListHeaderComponent={ListHeaderComponent}
          stickySectionHeadersEnabled={true}
          ListEmptyComponent={() => (
            <BodyScrollView
              contentContainerStyle={{
                alignItems: "center",
                gap: 8,
                paddingTop: 50,
              }}
            >
              {!isHistory && (
                <Button
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigateToNewProduct();
                  }}
                  variant="ghost"
                >
                  Add the first product to this list
                </Button>
              )}
              {isHistory && (
                <ThemedText style={{ color: 'gray', fontSize: 16 }}>
                  This list has been completed
                </ThemedText>
              )}
            </BodyScrollView>
          )}
        />

      </View>
      <FloatingActionFab position={{ bottom: 70, right: 24 }} onAction={handleFabAction} />
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
        onClose={() => setCustomAlertVisible(false)}
      />
    </>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    categoryHeader: {
      backgroundColor: colors.mainBackground,
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: 16,
    },
    categoryHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'capitalize',
    },
    categoryBadge: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      minWidth: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryCount: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    categoryDivider: {
      height: 1,
      backgroundColor: colors.borderColor,
      opacity: 0.3,
    },
  });
}