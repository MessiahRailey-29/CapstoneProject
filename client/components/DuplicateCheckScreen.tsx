import React, { useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import Button from '@/components/ui/button';
import { StatusBar } from 'expo-status-bar';
import ComparisonSettings from '@/components/ComparisonSettings';
import DuplicateResults from '@/components/DuplicateResults';
import { useDuplicateDetection, useDuplicateActions } from '@/hooks/useDuplicateDetection';
import { ComparisonSettings as IComparisonSettings } from '@/services/DuplicateDetectionService';
import { useShoppingListsValues } from '@/stores/ShoppingListsStore';
export default function DuplicateCheckScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };
  const [showResults, setShowResults] = useState(false);

  const {
    isLoading,
    duplicates,
    settings,
    stats,
    updateSettings,
    runDuplicateDetection,
    hasProducts
  } = useDuplicateDetection(listId);

  const { skipProduct, reduceQuantity } = useDuplicateActions(listId);

  const handleRunCheck = async () => {
    await runDuplicateDetection();
    setShowResults(true);
  };

  const handleSettingsChange = (newSettings: IComparisonSettings) => {
    updateSettings(newSettings);
  };

  const handleSkipProduct = (productName: string) => {
    skipProduct(productName);
    // Refresh detection after skipping
    runDuplicateDetection();
  };

  const handleReduceQuantity = (productName: string, newQuantity: number) => {
    reduceQuantity(productName, newQuantity);
    // Refresh detection after reducing
    runDuplicateDetection();
  };

  const handleDismiss = () => {
    router.back();
  };

  // Add this to your DuplicateCheckScreen component
const { debugAllListsData } = useDuplicateDetection(listId);

// Add this button near your other buttons
<Button onPress={debugAllListsData} variant="ghost">
  Debug: Show Raw List Data
</Button>

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
            <Text style={styles.emptyStateIcon}>📝</Text>
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
              <Button variant="ghost" onPress={() => setShowResults(false)}>
                Settings
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

        <ComparisonSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />

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

// Add this debug button to your DuplicateCheckScreen.tsx to see what data is available

const handleDebugData = () => {
  const allListsData = useShoppingListsValues();
  
  console.log('=== DEBUG: All Lists Data ===');
  console.log('Total lists:', allListsData.length);
  
  allListsData.forEach((listData, index) => {
    console.log(`\n--- List ${index + 1} ---`);
    console.log('Raw listData:', listData);
    console.log('listData.values:', listData.values);
    console.log('listData.tables:', listData.tables);
    console.log('listData.tables?.products:', listData.tables?.products);
    
    if (listData.tables?.products) {
      console.log('Products in this list:');
      Object.entries(listData.tables.products).forEach(([productId, productData]: [string, any]) => {
        console.log(`  - ${productData.name} (${productData.quantity} ${productData.units})`);
      });
    }
  });
};

// Add this button to your render method for debugging:
<Button onPress={handleDebugData} variant="ghost">
  Debug: Show All List Data
</Button>
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
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
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