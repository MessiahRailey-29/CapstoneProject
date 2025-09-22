import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useShoppingListProductIds, useShoppingListProductCell } from '@/stores/ShoppingListStore';

interface BudgetSummaryProps {
  listId: string;
  budget: number;
  currency?: string;
}

// Separate component for each product to handle hooks properly
function ProductCost({ listId, productId }: { listId: string; productId: string }) {
  const [selectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
  const [productQuantity] = useShoppingListProductCell(listId, productId, "quantity");
  const [name] = useShoppingListProductCell(listId, productId, "name");
  
  // Return null if no cost data, otherwise return the cost info
  if (!selectedPrice || selectedPrice <= 0) return null;
  
  return {
    name: name || 'Unknown Product',
    cost: selectedPrice * productQuantity,
    quantity: productQuantity,
    price: selectedPrice
  };
}

export default function BudgetSummary({ 
  listId, 
  budget, 
  currency = 'â‚±' 
}: BudgetSummaryProps) {
  const productIds = useShoppingListProductIds(listId);

  // Debug logging
  console.log('BudgetSummary Debug:', {
    listId,
    budget,
    budgetType: typeof budget,
    productIds: productIds.length
  });

  // Get cost data for all products that have pricing
  const productCosts = productIds.map(productId => {
    const [selectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
    const [productQuantity] = useShoppingListProductCell(listId, productId, "quantity");  
    const [name] = useShoppingListProductCell(listId, productId, "name");
    
    console.log(`Product ${productId}:`, {
      name,
      selectedPrice,
      productQuantity,
      cost: selectedPrice * productQuantity
    });
    
    if (!selectedPrice || selectedPrice <= 0) return null;
    
    return {
      productId,
      name: name || 'Unknown Product',
      cost: selectedPrice * productQuantity,
      quantity: productQuantity,
      price: selectedPrice
    };
  }).filter(Boolean); // Remove null entries

  // Calculate totals
  const totalSpent = productCosts.reduce((sum, item) => sum + (item?.cost || 0), 0);
  const remainingBudget = budget - totalSpent;
  const budgetUsedPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;
  
  console.log('Budget calculations:', {
    totalSpent,
    remainingBudget,
    budgetUsedPercentage,
    productCostsCount: productCosts.length
  });

  // Determine status colors
  const getStatusColor = () => {
    if (budget === 0) return '#666';
    if (budgetUsedPercentage <= 80) return '#34C759';
    if (budgetUsedPercentage <= 100) return '#FF9500';
    return '#FF3B30';
  };

  const getStatusText = () => {
    if (budget === 0) return 'No budget set';
    if (budgetUsedPercentage <= 80) return 'Within budget';
    if (budgetUsedPercentage <= 100) return 'Close to budget limit';
    return 'Over budget';
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Show component if we have spending OR a budget set
  if (budget === 0 && totalSpent === 0) {
    console.log('Not showing BudgetSummary: no budget and no spending');
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Summary</Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.budgetItem}>
          <Text style={styles.label}>Total Cost</Text>
          <Text style={[styles.amount, { color: getStatusColor() }]}>
            {currency}{formatCurrency(totalSpent)}
          </Text>
        </View>

        <View style={styles.budgetItem}>
          <Text style={styles.label}>Budget{budget === 0 ? ' (Not Set)' : ''}</Text>
          <Text style={styles.budgetAmount}>
            {budget === 0 ? 'Not set' : `${currency}${formatCurrency(budget)}`}
          </Text>
        </View>
      </View>

      {budget > 0 && (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${Math.min(budgetUsedPercentage, 100)}%`,
                    backgroundColor: getStatusColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {budgetUsedPercentage.toFixed(0)}% used
            </Text>
          </View>

          <View style={styles.remainingContainer}>
            <Text style={[
              styles.remainingText,
              { color: remainingBudget >= 0 ? '#34C759' : '#FF3B30' }
            ]}>
              {remainingBudget >= 0 ? 'Remaining: ' : 'Over by: '}
              {currency}{formatCurrency(Math.abs(remainingBudget))}
            </Text>
          </View>
        </>
      )}

      {productCosts.length > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Cost Breakdown:</Text>
          {productCosts
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5)
            .map((item, index) => (
            <View key={item.productId} style={styles.breakdownItem}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name} (Ã—{item.quantity})
              </Text>
              <Text style={styles.productCost}>
                {currency}{formatCurrency(item.cost)}
              </Text>
            </View>
          ))}
          {productCosts.length > 5 && (
            <Text style={styles.moreItems}>
              +{productCosts.length - 5} more items
            </Text>
          )}
        </View>
      )}

      {totalSpent === 0 && budget > 0 && (
        <View style={styles.noSpendingContainer}>
          <Text style={styles.noSpendingText}>
            Add products with prices to see spending summary
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  remainingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  productCost: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  noSpendingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noSpendingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});