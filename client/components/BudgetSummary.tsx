import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme, TextInput } from 'react-native';
import { useShoppingListProductIds, useShoppingListProductCell, useShoppingListValue } from '@/stores/ShoppingListStore';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button } from '@react-navigation/elements';
import { EvilIcons } from '@expo/vector-icons';
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
  currency = '₱'
}: BudgetSummaryProps) {
  const productIds = useShoppingListProductIds(listId);

  // Debug logging
  console.log('BudgetSummary Debug:', {
    listId,
    budget,
    budgetType: typeof budget,
    productIds: productIds.length
  });



  const [storeBudget, setStoreBudget] = useShoppingListValue(listId, "budget");

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editableBudget, setEditableBudget] = useState(String(storeBudget));

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

  // Color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = createStyles(colors);

  // Calculate totals
  const totalSpent = productCosts.reduce((sum, item) => sum + (item?.cost || 0), 0);
  const remainingBudget = budget - totalSpent;
  const budgetUsedPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;


  const router = useRouter();

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
    <LinearGradient
      colors={[colors.background,
      budgetUsedPercentage <= 80 ? '#22c55e' :
        budgetUsedPercentage <= 100 ? '#FF9500' :
          '#FF3B30',
      budgetUsedPercentage <= 80 ? '#22c55e' :
        budgetUsedPercentage <= 100 ? '#FF9500' :
          '#FF3B30']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 6 }}
      style={styles.container}>
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

        <View style={styles.remainingContainer}>
          <Text style={[
            styles.remainingLabel,
            { color: remainingBudget >= 0 ? colors.text : '#FF3B30' }
          ]}>
            {remainingBudget >= 0 ? 'Remaining: ' : 'Over by: '}
          </Text>
          <Text style={[
            styles.remainingBudget,
            { color: remainingBudget >= 0 ? '#34C759' : '#FF3B30' }
          ]}>
            {currency}{formatCurrency(Math.abs(remainingBudget))}
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
          <View style={styles.budgetItem}>
            <Text
              style={[
                styles.label,
                { color: remainingBudget >= 0 ? colors.text : '#FF3B30' }
              ]}
            >
              Budget {budget === 0 ? " (Not Set)" : ""}
            </Text>

            {/* If editing → show TextInput */}
            {isEditingBudget ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.budgetAmount, { marginRight: 4 }]}>₱</Text>
              <TextInput
                style={[
                  styles.budgetAmount,
                  {
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    paddingHorizontal: 6,
                    borderRadius: 6,
                    minWidth: 90,
                    color: colors.text,
                  }
                ]}
                autoFocus
                keyboardType="numeric"
                value={editableBudget}
                onChangeText={setEditableBudget}
                onBlur={() => {
                  const newBudget = parseFloat(editableBudget) || 0;
                  setStoreBudget(newBudget);
                  setIsEditingBudget(false);
                }}
                onSubmitEditing={() => {
                  const newBudget = parseFloat(editableBudget) || 0;
                  setStoreBudget(newBudget);
                  setIsEditingBudget(false);
                }}
              />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditableBudget(String(budget));
                  setIsEditingBudget(true);
                }}
              >
                <Text
                  style={[
                    styles.budgetAmount,
                    { color: remainingBudget >= 0 ? colors.text : "#FF3B30" }
                  ]}
                >
                  {budget === 0 ? "Not set" : `${currency}${formatCurrency(budget)}`}
                  
                <EvilIcons name="pencil" size={28} color={colors.exposedGhost} />
                </Text>
              </TouchableOpacity>
            )}
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
                  {item.name} (×{item.quantity})
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
    </LinearGradient>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 7,
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
      color: colors.text,
    },
    status: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    budgetItem: {
      alignItems: 'center',
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      color: colors.text,
      marginBottom: 4,
    },
    amount: {
      fontSize: 24,
      fontWeight: 'bold',
      textShadowColor: colors.shadowColor,
      textShadowRadius: 0.7,
      textShadowOffset: { width: 0, height: 0.7 },
      elevation: 2
    },
    budgetAmount: {
      fontSize: 30,
      fontWeight: '600',
      color: colors.text,
      textShadowColor: colors.shadowColor,
      textShadowRadius: 0.7,
      textShadowOffset: { width: 0, height: 0.7 },
      elevation: 2
    },
    progressContainer: {
      marginBottom: 12,
    },
    progressBackground: {
      height: 8,
      backgroundColor: 'rgba(223, 223, 223, 0.7)',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 4,
      borderColor: colors.borderColor,
      borderWidth: StyleSheet.hairlineWidth,
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
    },
    remainingContainer: {
      top: 5
    },
    remainingLabel: {
      alignSelf: 'center',
      fontWeight: '200',
    },
    remainingBudget: {
      fontSize: 25,
      fontWeight: '600',
      textShadowColor: colors.shadowColor,
      textShadowRadius: 0.7,
      textShadowOffset: { width: 0, height: 0.7 },
      elevation: 2
    },
    breakdown: {
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      paddingTop: 12,
    },
    breakdownTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
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
      color: colors.text,
    },
    productCost: {
      fontSize: 14,
      fontWeight: '500',
      color: '#00ff5e',
      textShadowColor: colors.shadowColor,
      textShadowRadius: 0.7,
      textShadowOffset: { width: 0, height: 0.8 }
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
    editButtonContainer: {
      marginTop: 16,
      alignItems: 'flex-end',

    },
  });
}