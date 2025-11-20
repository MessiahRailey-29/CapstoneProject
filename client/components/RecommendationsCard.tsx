// client/components/RecommendationsCard.tsx
import React from 'react';
import { StyleSheet, View, FlatList, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Recommendation } from '@/services/recommendationsApi';
import { Colors } from '@/constants/Colors';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  onProductSelect: (productId: number, productName: string, price: number, store: string) => void;
  loading?: boolean;
}

export default function RecommendationsCard({
  recommendations,
  onProductSelect,
  loading = false,
}: RecommendationsCardProps) {
  if (loading) {

    // Color scheme and styles
        const theme = useColorScheme();
        const colors = Colors[theme ?? 'light'];
        const styles = createStyles(colors)

    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>✨ Suggested for You</ThemedText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading suggestions...</ThemedText>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

      // Color scheme and styles
          const theme = useColorScheme();
          const colors = Colors[theme ?? 'light'];
          const styles = createStyles(colors)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>✨ Suggested for You</ThemedText>
        <ThemedText style={styles.subtitle}>
          Based on your shopping habits
        </ThemedText>
      </View>

      <FlatList
        horizontal
        data={recommendations.slice(0, 8)}
        keyExtractor={(item) => item.productId.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RecommendationItem
            recommendation={item}
            onPress={() =>
              onProductSelect(item.productId, item.productName, item.price, item.store)
            }
          />
        )}
      />
    </View>
  );
}

interface RecommendationItemProps {
  recommendation: Recommendation;
  onPress: () => void;
}

function RecommendationItem({ recommendation, onPress }: RecommendationItemProps) {
  const confidencePercentage = Math.round(recommendation.score * 100);

    // Color scheme and styles
        const theme = useColorScheme();
        const colors = Colors[theme ?? 'light'];
        const styles = createStyles(colors)

  return (
    <Pressable
      style={({ pressed }) => [styles.itemContainer, pressed && styles.itemPressed]}
      onPress={onPress}
    >
      <View style={styles.itemHeader}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {recommendation.productName} {recommendation.unit && `(${recommendation.unit})`}
        </ThemedText>
        <View
          style={[
            styles.confidenceBadge,
            { backgroundColor: confidencePercentage > 70 ? '#4CAF50' : '#FF9800' },
          ]}
        >
          <ThemedText style={styles.confidenceText}>{confidencePercentage}%</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.category}>{recommendation.category}</ThemedText>

      <View style={styles.priceContainer}>
        <ThemedText style={styles.store}>{recommendation.store}</ThemedText>
        <ThemedText style={styles.price}>₱{recommendation.price.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.reasonsContainer}>
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <View key={index} style={styles.reasonBadge}>
            <ThemedText style={styles.reasonText} numberOfLines={1}>
              • {reason}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.addButton}>
        <IconSymbol name="plus" size={16} color="#fff" />
        <ThemedText style={styles.addButtonText}>Add to List</ThemedText>
      </View>
    </Pressable>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
  },
  itemContainer: {
    width: 180,
    marginRight: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  category: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  store: {
    fontSize: 11,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reasonBadge: {
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 10,
    color: '#444',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
});
}