import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { DuplicateMatch } from '@/services/DuplicateDetectionService';

interface DuplicateResultsProps {
  duplicates: DuplicateMatch[];
  onSkipProduct: (productName: string) => void;
  onReduceQuantity: (productName: string, newQuantity: number) => void;
  onDismiss: () => void;
}

export default function DuplicateResults({ 
  duplicates, 
  onSkipProduct, 
  onReduceQuantity, 
  onDismiss 
}: DuplicateResultsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (productName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(productName)) {
      newExpanded.delete(productName);
    } else {
      newExpanded.add(productName);
    }
    setExpandedItems(newExpanded);
  };

  const getConfidenceColor = (confidence: DuplicateMatch['confidence']) => {
    switch (confidence) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
    }
  };

  const getActionColor = (action: DuplicateMatch['suggestedAction']) => {
    switch (action) {
      case 'skip': return '#FF3B30';
      case 'reduce': return '#FF9500';
      case 'warning': return '#007AFF';
    }
  };

  const getActionText = (action: DuplicateMatch['suggestedAction']) => {
    switch (action) {
      case 'skip': return 'Consider skipping';
      case 'reduce': return 'Consider reducing';
      case 'warning': return 'Check previous lists';
    }
  };

  const formatDaysAgo = (daysAgo: number) => {
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) === 1 ? '' : 's'} ago`;
    return `${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) === 1 ? '' : 's'} ago`;
  };

  if (duplicates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDuplicatesContainer}>
          <Text style={styles.noDuplicatesIcon}>✓</Text>
          <Text style={styles.noDuplicatesTitle}>No Duplicates Found</Text>
          <Text style={styles.noDuplicatesText}>
            Your list looks good! No similar items found in your previous lists.
          </Text>
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Potential Duplicates Found</Text>
        <Text style={styles.subtitle}>
          Found {duplicates.length} item{duplicates.length === 1 ? '' : 's'} that might be duplicates
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {duplicates.map((duplicate) => (
          <View key={duplicate.productName} style={styles.duplicateCard}>
            <TouchableOpacity
              style={styles.duplicateHeader}
              onPress={() => toggleExpanded(duplicate.productName)}
            >
              <View style={styles.duplicateHeaderLeft}>
                <Text style={styles.productName}>{duplicate.productName}</Text>
                <Text style={styles.currentQuantity}>
                  Current: {duplicate.currentQuantity} {duplicate.currentUnits}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(duplicate.confidence) }]}>
                    <Text style={styles.badgeText}>{duplicate.confidence} confidence</Text>
                  </View>
                  <View style={[styles.actionBadge, { backgroundColor: getActionColor(duplicate.suggestedAction) }]}>
                    <Text style={styles.badgeText}>{getActionText(duplicate.suggestedAction)}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.expandIcon}>
                {expandedItems.has(duplicate.productName) ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedItems.has(duplicate.productName) && (
              <View style={styles.duplicateDetails}>
                <Text style={styles.matchesTitle}>Found in {duplicate.matches.length} previous list{duplicate.matches.length === 1 ? '' : 's'}:</Text>
                
                {duplicate.matches.map((match, index) => (
                  <View key={index} style={styles.matchItem}>
                    <View style={styles.matchHeader}>
                      <Text style={styles.matchListName}>{match.listName}</Text>
                      <Text style={styles.matchDate}>{formatDaysAgo(match.daysAgo)}</Text>
                    </View>
                    <View style={styles.matchDetails}>
                      <Text style={styles.matchQuantity}>
                        {match.quantity} {match.units}
                      </Text>
                      {match.isPurchased ? (
                        <Text style={styles.purchasedTag}>Purchased ✓</Text>
                      ) : (
                        <Text style={styles.notPurchasedTag}>Not purchased</Text>
                      )}
                    </View>
                  </View>
                ))}

                <View style={styles.actionButtons}>
                  {duplicate.suggestedAction === 'skip' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.skipButton]}
                      onPress={() => onSkipProduct(duplicate.productName)}
                    >
                      <Text style={styles.actionButtonText}>Skip This Item</Text>
                    </TouchableOpacity>
                  )}
                  
                  {(duplicate.suggestedAction === 'reduce' || duplicate.suggestedAction === 'skip') && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reduceButton]}
                      onPress={() => {
                        const suggestedQuantity = Math.max(1, Math.floor(duplicate.currentQuantity / 2));
                        onReduceQuantity(duplicate.productName, suggestedQuantity);
                      }}
                    >
                      <Text style={styles.actionButtonText}>Reduce to Half</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.keepButton]}
                    onPress={() => {}} // Keep as is - no action needed
                  >
                    <Text style={styles.keepButtonText}>Keep Original</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Continue with List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  duplicateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  duplicateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  duplicateHeaderLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  currentQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  duplicateDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  matchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  matchItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchListName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  matchDate: {
    fontSize: 12,
    color: '#666',
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchQuantity: {
    fontSize: 14,
    color: '#666',
  },
  purchasedTag: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  notPurchasedTag: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#FF3B30',
  },
  reduceButton: {
    backgroundColor: '#FF9500',
  },
  keepButton: {
    backgroundColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  keepButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dismissButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  noDuplicatesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noDuplicatesIcon: {
    fontSize: 48,
    color: '#34C759',
    marginBottom: 16,
  },
  noDuplicatesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDuplicatesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});