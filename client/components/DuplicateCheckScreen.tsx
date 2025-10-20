import React, { useState, useCallback } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import Button from '@/components/ui/button';
import { StatusBar } from 'expo-status-bar';
import DuplicateResults from '@/components/DuplicateResults';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { useShoppingListStore } from '@/stores/ShoppingListStore';

export default function DuplicateCheckScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };
  const [showResults, setShowResults] = useState(false);

  const {
    isLoading,
    duplicates,
    settings,
    stats,
    runDuplicateDetection,
    hasProducts,
    productNameToIdMap,
  } = useDuplicateDetection(listId);

  const store = useShoppingListStore(listId);

  // Safety check: ensure productNameToIdMap exists
  const safeProductNameToIdMap = productNameToIdMap || new Map();

  const handleRunCheck = async () => {
    await runDuplicateDetection();
    setShowResults(true);
  };

  const handleSkipProduct = useCallback((productName: string) => {
    const productId = safeProductNameToIdMap.get(productName);
    
    if (!productId || !store) {
      console.warn('⚠ Product or store not found:', productName);
      return;
    }

    try {
      store.delRow('products', productId);
      console.log('✅ Skipped product:', productName);
      
      // Refresh detection after skipping
      setTimeout(() => {
        runDuplicateDetection();
      }, 100);
    } catch (error) {
      console.error('Error skipping product:', error);
    }
  }, [safeProductNameToIdMap, store, runDuplicateDetection]);

  const handleReduceQuantity = useCallback((productName: string, newQuantity: number) => {
    const productId = safeProductNameToIdMap.get(productName);
    
    if (!productId || !store) {
      console.warn('⚠ Product or store not found:', productName);
      return;
    }

    try {
      store.setCell('products', productId, 'quantity', newQuantity);
      console.log('✅ Reduced quantity for', productName, 'to', newQuantity);
      
      // Refresh detection after reducing
      setTimeout(() => {
        runDuplicateDetection();
      }, 100);
    } catch (error) {
      console.error('Error reducing quantity:', error);
    }
  }, [safeProductNameToIdMap, store, runDuplicateDetection]);

  const handleDismiss = () => {
    router.back();
  };

  const handleGoToSettings = () => {
    router.push('/(index)/(tabs)/profile');
  };

  if (!hasProducts) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: "Duplicate Check",
            headerLeft: () => (
              <Button variant="ghost" onPress={router.back}>
                Back
              </Button>
            ),
          }}
        />
        <BodyScrollView contentContainerStyle={styles.container}>
          <StatusBar style="light" animated />
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No Products to Check</Text>
            <Text style={styles.emptyStateText}>
              Add some products to your list first, then check for duplicates.
            </Text>
            <Button onPress={router.back}>
              Back to List
            </Button>
          </View>
        </BodyScrollView>
      </>
    );
  }

  if (showResults) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: "Duplicate Results",
            headerLeft: () => (
              <Button variant="ghost" onPress={router.back}>
                Back
              </Button>
            ),
          }}
        />
        <StatusBar style="light" animated />
        <DuplicateResults
          duplicates={duplicates}
          onSkipProduct={handleSkipProduct}
          onReduceQuantity={handleReduceQuantity}
          onDismiss={handleDismiss}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Check for Duplicates",
          headerLeft: () => (
            <Button variant="ghost" onPress={router.back}>
              Cancel
            </Button>
          ),
        }}
      />
      <BodyScrollView contentContainerStyle={styles.container}>
        <StatusBar style="light" animated />
        
        <View style={styles.headerSection}>
          <Text style={styles.title}>Avoid Overbuying</Text>
          <Text style={styles.description}>
            Check your current list against previous lists to find potential duplicates 
            and avoid buying items you might already have.
          </Text>
        </View>

        {/* Current Settings Info Box */}
        <View style={styles.settingsInfoBox}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Current Detection Settings</Text>
            <Button 
              variant="ghost" 
              onPress={handleGoToSettings}
              textStyle={styles.settingsLinkText}
            >
              Change in Profile
            </Button>
          </View>
          
          <View style={styles.settingsGrid}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Comparing against:</Text>
              <Text style={styles.settingValue}>
                {settings.option === 'last-1' ? 'Last 1 list' :
                 settings.option === 'last-3' ? 'Last 3 lists' :
                 settings.option === 'last-5' ? 'Last 5 lists' :
                 settings.option === 'all' ? 'All lists' :
                 `Last ${settings.customDays} days`}
              </Text>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Similarity threshold:</Text>
              <Text style={styles.settingValue}>
                {Math.round(settings.similarityThreshold * 100)}%
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Include purchased:</Text>
              <Text style={styles.settingValue}>
                {settings.includeCompleted ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        </View>

        {stats.totalDuplicates > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Last Check Results</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalDuplicates}</Text>
                <Text style={styles.statLabel}>Total Matches</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.highConfidence}</Text>
                <Text style={styles.statLabel}>High Confidence</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.suggestedSkips}</Text>
                <Text style={styles.statLabel}>Suggested Skips</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.suggestedReductions}</Text>
                <Text style={styles.statLabel}>Reduce Quantity</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <Button
            onPress={handleRunCheck}
            disabled={isLoading}
            style={styles.checkButton}
          >
            {isLoading ? 'Checking...' : 'Run Duplicate Check'}
          </Button>
          
          <Text style={styles.infoText}>
            This will compare your current list with your previous lists based on the settings above.
          </Text>
        </View>
      </BodyScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  settingsInfoBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  settingsLinkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  settingsGrid: {
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionSection: {
    marginTop: 24,
    gap: 16,
  },
  checkButton: {
    backgroundColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});