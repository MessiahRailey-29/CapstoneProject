// client/components/RecommendationsByStrategy.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Recommendation } from '@/services/recommendationsApi';
import { Colors } from '@/constants/Colors'

interface RecommendationsByStrategyProps {
  recommendations: Recommendation[];
  onProductSelect: (productId: number, productName: string, price: number, store: string) => void;
  loading?: boolean;
}

interface GroupedRecommendations {
  personal: Recommendation[];
  seasonal: Recommendation[];
  location: Recommendation[];
  peer: Recommendation[];
  trending: Recommendation[];
}

export default function RecommendationsByStrategy({
  recommendations,
  onProductSelect,
  loading = false,
}: RecommendationsByStrategyProps) {
  // Group recommendations by their primary reason/strategy
  const grouped = useMemo(() => {
    const groups: GroupedRecommendations = {
      personal: [],
      seasonal: [],
      location: [],
      peer: [],
      trending: [],
    };

    recommendations.forEach((rec) => {
      const reasons = rec.reasons.join(' ').toLowerCase();
      
      // Categorize based on reason keywords
      if (reasons.includes('you buy') || reasons.includes('you often')) {
        groups.personal.push(rec);
      } else if (reasons.includes('season') || reasons.includes('weather')) {
        groups.seasonal.push(rec);
      } else if (reasons.includes('nearby') || reasons.includes('location') || reasons.includes('popular in')) {
        groups.location.push(rec);
      } else if (reasons.includes('similar users') || reasons.includes('users similar')) {
        groups.peer.push(rec);
      } else if (reasons.includes('trending') || reasons.includes('recent purchases')) {
        groups.trending.push(rec);
      } else {
        // Default to personal if can't categorize
        groups.personal.push(rec);
      }
    });

    return groups;
  }, [recommendations]);

    // Color scheme and styles
        const theme = useColorScheme();
        const colors = Colors[theme ?? 'light'];
        const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.mainTitle}>✨ Personalized Suggestions</ThemedText>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading recommendations...</ThemedText>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.mainTitle}>✨ Personalized Suggestions</ThemedText>
      <ThemedText style={styles.subtitle}>
        AI-powered recommendations based on your shopping patterns
      </ThemedText>

      {/* Personal History */}
      {grouped.personal.length > 0 && (
        <RecommendationSection
          title="📚 Based on Your History"
          subtitle="Products you buy frequently"
          icon="clock.fill"
          color="#007AFF"
          recommendations={grouped.personal}
          onProductSelect={onProductSelect}
        />
      )}

      {/* Seasonal */}
      {grouped.seasonal.length > 0 && (
        <RecommendationSection
          title="🌦️ Seasonal Picks"
          subtitle="Perfect for current weather"
          icon="cloud.rain.fill"
          color="#34C759"
          recommendations={grouped.seasonal}
          onProductSelect={onProductSelect}
        />
      )}

      {/* Location-Based */}
      {grouped.location.length > 0 && (
        <RecommendationSection
          title="📍 Popular Nearby"
          subtitle="What others in your area are buying"
          icon="location.fill"
          color="#FF9500"
          recommendations={grouped.location}
          onProductSelect={onProductSelect}
        />
      )}

      {/* Peer Recommendations */}
      {grouped.peer.length > 0 && (
        <RecommendationSection
          title="👥 People Like You"
          subtitle="From users with similar tastes"
          icon="person.2.fill"
          color="#AF52DE"
          recommendations={grouped.peer}
          onProductSelect={onProductSelect}
        />
      )}

      {/* Trending */}
      {grouped.trending.length > 0 && (
        <RecommendationSection
          title="📈 Trending Now"
          subtitle="Hot items this week"
          icon="chart.line.uptrend.xyaxis"
          color="#FF2D55"
          recommendations={grouped.trending}
          onProductSelect={onProductSelect}
        />
      )}
    </ScrollView>
  );
}

// Individual Section Component
interface RecommendationSectionProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  recommendations: Recommendation[];
  onProductSelect: (productId: number, productName: string, price: number, store: string) => void;
}

function RecommendationSection({
  title,
  subtitle,
  icon,
  color,
  recommendations,
  onProductSelect,
}: RecommendationSectionProps) {

    // Color scheme and styles
        const theme = useColorScheme();
        const colors = Colors[theme ?? 'light'];
        const styles = createStyles(colors);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <IconSymbol name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>{subtitle}</ThemedText>
        </View>
      </View>

      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={(item) => item.productId.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard
            recommendation={item}
            accentColor={color}
            onPress={() =>
              onProductSelect(item.productId, item.productName, item.price, item.store)
            }
          />
        )}
      />
    </View>
  );
}

// Product Card Component
interface ProductCardProps {
  recommendation: Recommendation;
  accentColor: string;
  onPress: () => void;
}

function ProductCard({ recommendation, accentColor, onPress }: ProductCardProps) {
  const confidencePercentage = Math.round(recommendation.score * 100);
    // Color scheme and styles
        const theme = useColorScheme();
        const colors = Colors[theme ?? 'light'];
        const styles = createStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        { borderLeftColor: accentColor, borderLeftWidth: 4 },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardName} numberOfLines={2}>
          {recommendation.productName}
        </ThemedText>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                confidencePercentage > 80 ? '#4CAF50' : confidencePercentage > 60 ? '#FF9800' : '#9E9E9E',
            },
          ]}
        >
          <ThemedText style={styles.badgeText}>{confidencePercentage}%</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.category}>{recommendation.category}</ThemedText>

      <View style={styles.priceContainer}>
        <ThemedText style={styles.store} numberOfLines={1}>{recommendation.store}</ThemedText>
        <ThemedText style={[styles.price, { color: accentColor }]}>
          ₱{recommendation.price.toFixed(2)}
        </ThemedText>
      </View>

      <View style={styles.reasonsContainer}>
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <ThemedText key={index} style={styles.reason} numberOfLines={1}>
            • {reason}
          </ThemedText>
        ))}
      </View>

      <View style={[styles.addButton, { backgroundColor: accentColor }]}>
        <IconSymbol name="plus" size={16} color="#fff" />
        <ThemedText style={styles.addButtonText}>Add to List</ThemedText>
      </View>
    </Pressable>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderColor: colors.borderColor,
    borderWidth: 1,
    padding: 16,
    marginVertical: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  listContent: {
    paddingVertical: 4,
  },
  card: {
    width: 200,
    height: 260,
    marginRight: 12,
    padding: 14,
    backgroundColor: colors.background,
    borderColor: colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-between',
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
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
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reason: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
});
}