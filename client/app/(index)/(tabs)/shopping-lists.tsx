import IconCircle from "@/components/IconCircle";
import {ThemedText} from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { appleBlue, backgroundColors } from "@/constants/Colors";
import { useShoppingListIds, useShoppingListsValues, useShoppingListData } from "@/stores/ShoppingListsStore";
import { useShoppingListProductIds } from "@/stores/ShoppingListStore";
import { Stack, useRouter } from "expo-router";
import {Platform, Pressable, StyleSheet, View, FlatList, Animated} from "react-native";
import { useMemo, useState, useRef, useEffect } from "react";

type TabType = 'active' | 'ongoing' | 'history';

interface ShoppingListItemProps {
    listId: string;
}

// Inline ShoppingListItem component
const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ listId }) => {
  const router = useRouter();
  const listData = useShoppingListData(listId);
  const productIds = useShoppingListProductIds(listId);

  const name = listData?.name || '';
  const emoji = listData?.emoji || '🛒';
  const color = listData?.color || '#007AFF';
  const description = listData?.description || '';
  const status = listData?.status || 'regular';
  const shoppingDate = listData?.shoppingDate || null;
  const completedAt = listData?.completedAt || null;

  const handlePress = () => {
    router.push(`/list/${listId}`);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status display info
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
  );
}

export default function HomeScreen(){
    const router = useRouter();
    const shoppingListIds = useShoppingListIds();
    const shoppingListsValues = useShoppingListsValues();
    
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const scrollX = useRef(new Animated.Value(0)).current;

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

    // Get current tab data
    const getCurrentTabData = () => {
        switch (activeTab) {
            case 'active':
                return regularLists;
            case 'ongoing':
                return ongoingLists;
            case 'history':
                return historyLists;
            default:
                return [];
        }
    };

    const currentTabData = getCurrentTabData();

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
    
    const renderHeaderRight = () => {
        return(
            <Pressable onPress={() => router.push("/list/new")}>
                <IconSymbol name="plus" color={appleBlue}/>
            </Pressable>
        );
    };

    const renderItem = ({ item: listId }: { item: string }) => (
        <ShoppingListItem listId={listId} />
    );

    // Tab button component
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
                onPress={() => setActiveTab(type)}
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

    return(
        <>
            <Stack.Screen options={{
                headerRight: renderHeaderRight,
            }}/>
            
            <View style={styles.container}>
                {/* Tab Bar */}
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

                {/* Active Tab Indicator */}
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

                {/* Content */}
                {currentTabData.length === 0 ? (
                    renderEmptyList()
                ) : (
                    <FlatList
                        data={currentTabData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item}
                        contentContainerStyle={styles.listContainer}
                        contentInsetAdjustmentBehavior="automatic"
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabButtonActive: {
    // Active state handled by indicator
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  tabLabelActive: {
    color: '#007AFF',
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
    backgroundColor: '#007AFF',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  tabIndicatorContainer: {
    height: 3,
    backgroundColor: '#E5E5EA',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: '33.33%',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  listContainer: {
    paddingTop: 8,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIcon: {
    fontSize: 64,
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
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
    color: '#000000',
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
});