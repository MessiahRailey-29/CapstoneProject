// REAL FIX: shopping-lists.tsx - Properly persist tab across navigation
import IconCircle from "@/components/IconCircle";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListIds,
  useShoppingListsValues,
  useShoppingListData,
  useDelShoppingListCallback,
  useDelAllShoppingListsCallback
} from "@/stores/ShoppingListsStore";
import { useShoppingListProductIds } from "@/stores/ShoppingListStore";
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View, FlatList, Animated, Alert, useColorScheme, Modal } from 'react-native';
import React, { useMemo, useState, useRef, useCallback } from "react";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from "@/constants/Colors";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import QuickAddFab from "@/components/AddShoppingListFaB";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from "@/components/ui/CustomAlert";

type TabType = 'active' | 'ongoing' | 'history';
type SortOption = 'name' | 'date' | 'items' | 'budget';
type FilterOption = 'all' | 'scheduled' | 'unscheduled';

const TAB_STORAGE_KEY = '@shopping_lists_active_tab';

interface ShoppingListItemProps {
  listId: string;
  isHistory?: boolean;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ listId, isHistory = false }) => {
  const router = useRouter();
  const listData = useShoppingListData(listId);
  const productIds = useShoppingListProductIds(listId);
  const deleteList = useDelShoppingListCallback(listId);

  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const name = listData?.name || '';
  const emoji = listData?.emoji || '🛒';
  const color = listData?.color || '#007AFF';
  const description = listData?.description || '';
  const status = listData?.status || 'regular';
  const shoppingDate = listData?.shoppingDate || null;
  const completedAt = listData?.completedAt || null;

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

  const swipeableRef = useRef<Swipeable>(null);

  const handlePress = useCallback(() => {
    router.push(`/list/${listId}`);
  }, [listId, router]);

  const handleDelete = useCallback(() => {
    showCustomAlert(
      "Delete List",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteList();
            console.log('🗑️ Deleted list:', listId);
          },
        },
      ]
    );
  }, [name, deleteList, listId]);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <IconSymbol name="trash" size={24} color="#FFFFFF" />
            <ThemedText style={styles.deleteText}>Delete</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const getStatusInfo = () => {
    if (status === 'ongoing') {
      return {
        label: 'Shopping in progress',
        color: '#34C759',
        icon: '🛍️',
      };
    }
    if (status === 'completed') {
      return {
        label: completedAt ? `Completed ${formatDate(completedAt)}` : 'Completed',
        color: '#8E8E93',
        icon: '✅',
      };
    }
    if (shoppingDate) {
      return {
        label: `Scheduled: ${formatDate(shoppingDate)}`,
        color: '#007AFF',
        icon: '📅',
      };
    }
    return null;
  };

  const statusInfo = getStatusInfo();
  const isCompleted = status === 'completed';
  const isOngoing = status === 'ongoing';

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      <Pressable
        style={styles.itemContainer}
        onPress={handlePress}
      >
        <View style={styles.content}>
          <IconCircle
            emoji={emoji}
            backgroundColor={color}
            size={50}
          />

          <View style={styles.info}>
            <View style={styles.header}>
              <ThemedText
                type="defaultSemiBold"
                style={isCompleted ? styles.nameCompleted : styles.name}
                numberOfLines={1}
              >
                {name || 'Unnamed List'}
              </ThemedText>

              {isOngoing && (
                <View style={styles.ongoingItemBadge}>
                  <View style={styles.pulseDotItem} />
                </View>
              )}
            </View>

            <View style={styles.details}>
              {description ? (
                <ThemedText
                  style={isCompleted ? styles.descriptionCompleted : styles.description}
                  numberOfLines={1}
                >
                  {description}
                </ThemedText>
              ) : null}

              <ThemedText
                style={isCompleted ? styles.itemCountCompleted : styles.itemCount}
              >
                {productIds.length} {productIds.length === 1 ? 'item' : 'items'}
              </ThemedText>
            </View>

            {statusInfo && (
              <View style={styles.statusContainer}>
                <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.icon} {statusInfo.label}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {!isCompleted && (
          <View style={styles.chevron}>
            <ThemedText style={styles.chevronText}>›</ThemedText>
          </View>
        )}
      </Pressable>
    </Swipeable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const shoppingListIds = useShoppingListIds();
  const shoppingListsValues = useShoppingListsValues();
  const deleteAllLists = useDelAllShoppingListsCallback();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const params = useLocalSearchParams<{ tab?: "active" | "ongoing" | "history" }>();

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

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedTab.current) {
        const paramTab = params.tab;
        if (paramTab && ["active", "ongoing", "history"].includes(paramTab)) {
          setActiveTab(paramTab);
        } else {
          // fallback to AsyncStorage logic...
        }
        hasLoadedTab.current = true;
      }
    }, [params.tab])
  );

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const prevCounts = useRef({
    regular: 0,
    ongoing: 0,
    history: 0
  });

  // 🔧 CRITICAL FIX: Save tab whenever it changes
  const saveTab = useCallback(async (tab: TabType) => {
    try {
      await AsyncStorage.setItem(TAB_STORAGE_KEY, tab);
      console.log('💾 Saved tab:', tab);
    } catch (error) {
      console.error('❌ Error saving tab:', error);
    }
  }, []);

  // 🔧 CRITICAL FIX: Wrap setActiveTab to also save to storage
  const handleSetActiveTab = useCallback((newTab: TabType) => {
    console.log(`🔄 Changing tab: ${activeTab} → ${newTab}`);
    setActiveTab(newTab);
    saveTab(newTab);
  }, [activeTab, saveTab]);

  // 🔧 CRITICAL FIX: Load tab only ONCE on initial mount
  const hasLoadedTab = useRef(false);

  useFocusEffect(
    useCallback(() => {
      // Only load from storage on the very first focus
      if (!hasLoadedTab.current) {
        console.log('👀 Initial screen focus - loading saved tab');

        AsyncStorage.getItem(TAB_STORAGE_KEY)
          .then((savedTab) => {
            if (savedTab && (savedTab === 'active' || savedTab === 'ongoing' || savedTab === 'history')) {
              console.log('📱 Loaded saved tab:', savedTab);
              setActiveTab(savedTab as TabType);
            } else {
              console.log('📱 No saved tab found, using default: active');
            }
            hasLoadedTab.current = true;
          })
          .catch((error) => {
            console.error('❌ Error loading tab:', error);
            hasLoadedTab.current = true;
          });
      } else {
        // On subsequent focuses, DON'T reload from storage - keep current tab
        console.log('👀 Screen re-focused - keeping current tab:', activeTab);
      }
    }, [activeTab]) // Include activeTab so we can log it
  );

  const handleAddList = () => {
    router.push('/list/new');
  };

  // Categorize shopping lists
  const { regularLists, ongoingLists, historyLists } = useMemo(() => {
    const regular: string[] = [];
    const ongoing: string[] = [];
    const history: string[] = [];

    shoppingListIds.forEach((listId, index) => {
      try {
        const listData = shoppingListsValues[index];
        const status = listData?.values?.status || 'regular';

        if (status === 'ongoing') {
          ongoing.push(listId);
        } else if (status === 'completed') {
          history.push(listId);
        } else {
          regular.push(listId);
        }
      } catch (error) {
        console.error('Error reading list data:', error);
        regular.push(listId);
      }
    });

    return {
      regularLists: regular,
      ongoingLists: ongoing,
      historyLists: history
    };
  }, [shoppingListIds, shoppingListsValues]);

  const handleDeleteAll = useCallback(() => {
    const currentLists = activeTab === 'active' ? regularLists :
      activeTab === 'ongoing' ? ongoingLists :
        historyLists;

    if (currentLists.length === 0) return;

    const tabName = activeTab === 'active' ? 'Active' :
      activeTab === 'ongoing' ? 'Ongoing' :
        'Purchase History';

    showCustomAlert(
      `Delete All ${tabName} Lists`,
      `Are you sure you want to delete all ${currentLists.length} ${tabName.toLowerCase()} list${currentLists.length !== 1 ? 's' : ''}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteAllLists(currentLists);
            console.log(`🗑️ Deleted all ${currentLists.length} lists from ${tabName}`);
          },
        },
      ]
    );
  }, [activeTab, regularLists, ongoingLists, historyLists, deleteAllLists]);

  const filterLists = useCallback((lists: string[]) => {
    if (filterBy === 'all') return lists;

    return lists.filter((listId) => {
      const index = shoppingListIds.indexOf(listId);
      const listData = shoppingListsValues[index];
      const shoppingDate = listData?.values?.shoppingDate;

      if (filterBy === 'scheduled') {
        return !!shoppingDate;
      } else if (filterBy === 'unscheduled') {
        return !shoppingDate;
      }
      return true;
    });
  }, [filterBy, shoppingListIds, shoppingListsValues]);

  const sortLists = useCallback((lists: string[]) => {
    return [...lists].sort((a, b) => {
      const indexA = shoppingListIds.indexOf(a);
      const indexB = shoppingListIds.indexOf(b);
      const dataA = shoppingListsValues[indexA];
      const dataB = shoppingListsValues[indexB];

      switch (sortBy) {
        case 'name':
          const nameA = dataA?.values?.name || '';
          const nameB = dataB?.values?.name || '';
          return nameA.localeCompare(nameB);

        case 'date':
          const dateA = dataA?.values?.shoppingDate || dataA?.values?.createdAt || '';
          const dateB = dataB?.values?.shoppingDate || dataB?.values?.createdAt || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();

        case 'items':
          return 0;

        case 'budget':
          const budgetA = dataA?.values?.budget || 0;
          const budgetB = dataB?.values?.budget || 0;
          return budgetB - budgetA;

        default:
          return 0;
      }
    });
  }, [sortBy, shoppingListIds, shoppingListsValues]);

  const getCurrentTabData = useMemo(() => {
    let lists: string[];
    switch (activeTab) {
      case 'active':
        lists = regularLists;
        break;
      case 'ongoing':
        lists = ongoingLists;
        break;
      case 'history':
        lists = historyLists;
        break;
      default:
        lists = [];
    }

    const filtered = filterLists(lists);
    const sorted = sortLists(filtered);
    return sorted;
  }, [activeTab, regularLists, ongoingLists, historyLists, filterLists, sortLists]);

  const currentTabData = getCurrentTabData;

  const renderEmptyList = () => {
    let message = '';
    let icon = '🛒';

    if (activeTab === 'active') {
      message = 'No shopping lists yet';
      icon = '🛒';
    } else if (activeTab === 'ongoing') {
      message = 'No active shopping trips';
      icon = '🛍️';
    } else {
      message = 'No purchase history';
      icon = '📋';
    }

    return (
      <View style={styles.emptyStateContainer}>
        <ThemedText style={styles.emptyIcon}>{icon}</ThemedText>
        <ThemedText style={styles.emptyText}>{message}</ThemedText>
        {activeTab === 'active' && (
          <Button onPress={() => router.push("/list/new")} variant="ghost">
            Create your first list
          </Button>
        )}
      </View>
    );
  };

  const renderItem = ({ item: listId }: { item: string }) => (
    <ShoppingListItem listId={listId} isHistory={activeTab === 'history'} />
  );

  const TabButton = ({
    type,
    label,
    count
  }: {
    type: TabType;
    label: string;
    count: number;
  }) => {
    const isActive = activeTab === type;

    return (
      <Pressable
        style={[
          styles.tabButton,
          isActive && styles.tabButtonActive
        ]}
        onPress={() => handleSetActiveTab(type)}
      >
        <ThemedText
          style={[
            styles.tabLabel,
            isActive && styles.tabLabelActive
          ]}
        >
          {label}
        </ThemedText>
        {count > 0 && (
          <View style={[
            styles.countBadge,
            isActive && styles.countBadgeActive
          ]}>
            <ThemedText style={[
              styles.countText,
              isActive && styles.countTextActive
            ]}>
              {count}
            </ThemedText>
          </View>
        )}
      </Pressable>
    );
  };

  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
      presentationStyle="overFullScreen"
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Sort By</ThemedText>
            <Pressable onPress={() => setShowSortModal(false)}>
              <IconSymbol name="xmark" size={24} color="#8E8E93" />
            </Pressable>
          </View>

          <View style={styles.optionsList}>
            {[
              { value: 'date', label: 'Date', icon: '📅' },
              { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
              { value: 'items', label: 'Number of Items', icon: '🔢' },
              { value: 'budget', label: 'Budget', icon: '💰' },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionItem,
                  sortBy === option.value && styles.optionItemActive
                ]}
                onPress={() => {
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSortBy(option.value as SortOption);
                  setShowSortModal(false);
                }}
              >
                <ThemedText style={styles.optionIcon}>{option.icon}</ThemedText>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                {sortBy === option.value && (
                  <IconSymbol name="checkmark" size={20} color="#000" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
      presentationStyle="overFullScreen"
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Filter By</ThemedText>
            <Pressable onPress={() => setShowFilterModal(false)}>
              <IconSymbol name="xmark" size={24} color="#8E8E93" />
            </Pressable>
          </View>

          <View style={styles.optionsList}>
            {[
              { value: 'all', label: 'All Lists', icon: '📋' },
              { value: 'scheduled', label: 'Scheduled Only', icon: '📅' },
              { value: 'unscheduled', label: 'Unscheduled Only', icon: '📝' },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionItem,
                  filterBy === option.value && styles.optionItemActive
                ]}
                onPress={() => {
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setFilterBy(option.value as FilterOption);
                  setShowFilterModal(false);
                }}
              >
                <ThemedText style={styles.optionIcon}>{option.icon}</ThemedText>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                {filterBy === option.value && (
                  <IconSymbol name="checkmark" size={20} color="#007AFF" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen />

      <QuickAddFab onPress={handleAddList} />

      <View style={styles.container}>
        <View style={styles.tabBar}>
          <TabButton
            type="active"
            label="Active Lists"
            count={regularLists.length}
          />
          <TabButton
            type="ongoing"
            label="Shopping"
            count={ongoingLists.length}
          />
          <TabButton
            type="history"
            label="History"
            count={historyLists.length}
          />
        </View>

        <View style={styles.tabIndicatorContainer}>
          <View
            style={[
              styles.tabIndicator,
              {
                left: activeTab === 'active' ? '0%' :
                  activeTab === 'ongoing' ? '33.33%' : '66.66%',
              }
            ]}
          />
        </View>

        {activeTab === 'active' && (
          <View style={styles.filterSortBar}>
            <Pressable
              style={styles.filterSortButton}
              onPress={() => {
                if (process.env.EXPO_OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowFilterModal(true);
              }}
            >
              <FontAwesome name="filter" size={20} color="#50C878" />
              <ThemedText style={styles.filterSortButtonText}>
                Filter: {filterBy === 'all' ? 'All' : filterBy === 'scheduled' ? 'Scheduled' : 'Unscheduled'}
              </ThemedText>
            </Pressable>

            <View style={styles.filterSortDivider} />

            <Pressable
              style={styles.filterSortButton}
              onPress={() => {
                if (process.env.EXPO_OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowSortModal(true);
              }}
            >
              <FontAwesome name="sort" size={20} color="#50C878" />
              <ThemedText style={styles.filterSortButtonText}>
                Sort: {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : sortBy === 'items' ? 'Items' : 'Budget'}
              </ThemedText>
            </Pressable>
          </View>
        )}

        {((activeTab === 'active' && regularLists.length > 0) ||
          (activeTab === 'ongoing' && ongoingLists.length > 0) ||
          (activeTab === 'history' && historyLists.length > 0)) && (
            <View style={styles.deleteAllContainer}>
              <Pressable
                style={styles.deleteAllButton}
                onPress={handleDeleteAll}
              >
                <IconSymbol name="trash" size={18} color="#FF3B30" />
                <ThemedText style={styles.deleteAllButtonText}>
                  Delete All ({activeTab === 'active' ? regularLists.length :
                    activeTab === 'ongoing' ? ongoingLists.length :
                      historyLists.length})
                </ThemedText>
              </Pressable>
            </View>
          )}

        {currentTabData.length === 0 ? (
          renderEmptyList()
        ) : (
          <FlatList
            data={currentTabData}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 130 }]}
            contentInsetAdjustmentBehavior="automatic"
          />
        )}
      </View>

      <SortModal />
      <FilterModal />
    </GestureHandlerRootView>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainBackground
    },
    tabBar: {
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignContent: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderColor,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 6,
    },
    tabButtonActive: {},
    tabLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: '#8E8E93',
    },
    tabLabelActive: {
      color: '#50C878',
      fontWeight: '600',
    },
    countBadge: {
      backgroundColor: '#E5E5EA',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
      alignItems: 'center',
    },
    countBadgeActive: {
      backgroundColor: '#50C878',
    },
    countText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#8E8E93',
    },
    countTextActive: {
      color: colors.text,
    },
    tabIndicatorContainer: {
      height: 3,
      backgroundColor: colors.background,
      position: 'relative',
    },
    tabIndicator: {
      position: 'absolute',
      width: '33.33%',
      height: '100%',
      backgroundColor: '#50C878',
      borderRadius: 2,
    },
    filterSortBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E5EA',
    },
    filterSortButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5EA',
    },
    filterSortButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#34C759',
      flex: 1,
    },
    filterSortDivider: {
      width: 12,
    },
    listContainer: {},
    emptyStateContainer: {
      alignItems: "center",
      justifyContent: 'center',
      paddingTop: 80,
      gap: 10,
    },
    emptyIcon: {
      fontSize: 64,
      lineHeight: 78,
    },
    emptyText: {
      fontSize: 16,
      color: '#8E8E93',
      textAlign: 'center',
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderBottomColor,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    info: {
      flex: 1,
      gap: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    name: {
      fontSize: 17,
      color: colors.text,
      flex: 1,
    },
    nameCompleted: {
      fontSize: 17,
      color: '#8E8E93',
      flex: 1,
    },
    ongoingItemBadge: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#34C759',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pulseDotItem: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    description: {
      fontSize: 14,
      color: '#8E8E93',
      flex: 1,
    },
    descriptionCompleted: {
      fontSize: 14,
      color: '#8E8E93',
      flex: 1,
      opacity: 0.7,
    },
    itemCount: {
      fontSize: 14,
      color: '#8E8E93',
    },
    itemCountCompleted: {
      fontSize: 14,
      color: '#8E8E93',
      opacity: 0.7,
    },
    statusContainer: {
      marginTop: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '500',
    },
    chevron: {
      marginLeft: 8,
    },
    chevronText: {
      fontSize: 24,
      color: '#C7C7CC',
      fontWeight: '300',
    },
    swipeActionsContainer: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    deleteAction: {
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
      width: 100,
    },
    deleteButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    deleteText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    optionsList: {
      paddingVertical: 10,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E5EA',
    },
    optionItemActive: {
      backgroundColor: '#34C759',
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    optionIcon: {
      fontSize: 24,
    },
    optionLabel: {
      fontSize: 16,
      flex: 1,
    },
    deleteAllContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E5EA',
    },
    deleteAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FF3B30',
    },
    deleteAllButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FF3B30',
    },
  });
}