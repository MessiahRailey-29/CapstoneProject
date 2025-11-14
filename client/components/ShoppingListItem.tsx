import IconCircle from "@/components/IconCircle";
import {ThemedText} from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { appleBlue, backgroundColors } from "@/constants/Colors";
import { useShoppingListIds, useShoppingListsValues, useShoppingListData } from "@/stores/ShoppingListsStore";
import { useShoppingListProductIds } from "@/stores/ShoppingListStore";
import { Stack, useRouter } from "expo-router";
import {Platform, Pressable, StyleSheet, View, SectionList, useColorScheme} from "react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/Colors";

type Section = {
    title: string;
    data: string[];
    key: string;
};

// Inline ShoppingListItem component to avoid import issues
function ShoppingListItem({ listId }: { listId: string }) {
  const router = useRouter();
  const listData = useShoppingListData(listId);
  const productIds = useShoppingListProductIds(listId);

  
        const theme = useColorScheme();
        const colors = Colors[theme ?? 'light'];
        const styles = createStyles(colors);

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
    const router= useRouter();
    const shoppingListIds = useShoppingListIds();
    const shoppingListsValues = useShoppingListsValues();

          const theme = useColorScheme();
          const colors = Colors[theme ?? 'light'];
          const styles = createStyles(colors);

    // Categorize shopping lists into sections
    const sections = useMemo(() => {
        const regularLists: string[] = [];
        const ongoingLists: string[] = [];
        const historyLists: string[] = [];

        // Use shoppingListsValues which already has the data parsed
        shoppingListIds.forEach((listId, index) => {
            try {
                const listData = shoppingListsValues[index];
                const status = listData?.values?.status || 'regular'; // Default to 'regular' if no status
                
                if (status === 'ongoing') {
                    ongoingLists.push(listId);
                } else if (status === 'completed') {
                    historyLists.push(listId);
                } else {
                    regularLists.push(listId);
                }
            } catch (error) {
                console.error('Error reading list data:', error);
                regularLists.push(listId);
            }
        });

        const result: Section[] = [];
        
        // Add Ongoing Shopping Lists section if there are any
        if (ongoingLists.length > 0) {
            result.push({
                title: 'Ongoing Shopping Lists',
                data: ongoingLists,
                key: 'ongoing'
            });
        }

        // Add regular shopping lists section
        if (regularLists.length > 0) {
            result.push({
                title: 'Shopping Lists',
                data: regularLists,
                key: 'regular'
            });
        }

        // Add Purchase History section if there are any
        if (historyLists.length > 0) {
            result.push({
                title: 'Purchase History',
                data: historyLists,
                key: 'history'
            });
        }

        return result;
    }, [shoppingListIds, shoppingListsValues]);

    const renderEmptyList = () => (
        <BodyScrollView contentContainerStyle = {styles.emptyStateContainer}>
            <IconCircle
            emoji="🛒"
            backgroundColor={
                backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
            }
            />
            <Button onPress={() => router.push("/list/new")} variant="ghost">
                Create your first list
            </Button>
        </BodyScrollView>
    )
    
    const renderHeaderRight = ()=>{
        return(
            <Pressable onPress={()=>router.push("/list/new")}>
                <IconSymbol name="plus" color={appleBlue}/>
            </Pressable>
        );
    };

    const renderSectionHeader = ({ section }: { section: Section }) => (
        <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {section.title}
            </ThemedText>
            {section.key === 'ongoing' && (
                <View style={styles.ongoingBadge}>
                    <View style={styles.pulseDot} />
                    <ThemedText style={styles.badgeText}>Active</ThemedText>
                </View>
            )}
            {section.key === 'history' && (
                <ThemedText style={styles.historyCount}>
                    {section.data.length} completed
                </ThemedText>
            )}
        </View>
    );

    const renderItem = ({ item: listId }: { item: string }) => (
        <ShoppingListItem listId={listId} />
    );

    if (shoppingListIds.length === 0) {
        return (
            <>
                <Stack.Screen options={{
                    headerRight: renderHeaderRight,
                }}/>
                {renderEmptyList()}
            </>
        );
    }

    return(
        <>
        <Stack.Screen
        options={{
            headerRight: renderHeaderRight,
        }}
        />
        <SectionList
            sections={sections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            contentInsetAdjustmentBehavior="automatic"
            stickySectionHeadersEnabled={true}
            ListEmptyComponent={renderEmptyList}
        />
        </>
    );
}


const createStyles = (colors: any) => StyleSheet.create({
  listContainer: {
    paddingTop: 8,
    backgroundColor: colors.mainBackground,
    flex: 1
  },
  emptyStateContainer: {
    backgroundColor: colors.mainBackground,
    alignItems: "center",
    gap: 8,
    paddingTop: 100,
  },
  headerButton: {
    padding: 8,
    paddingRight: 0,
    marginHorizontal: Platform.select({ web: 16, default: 0 }),
  },
  headerButtonLeft: {
    paddingLeft: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000000',
  },
  ongoingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  historyCount: {
    fontSize: 14,
    color: '#666666',
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