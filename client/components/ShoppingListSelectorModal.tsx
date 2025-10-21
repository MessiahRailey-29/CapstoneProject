// client/components/ShoppingListSelectorModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useShoppingListIds, useShoppingListsValues } from '@/stores/ShoppingListsStore';
import { useAddProductWithNotifications } from '@/hooks/useAddProductWithNotifications';
import { useRouter } from 'expo-router';

interface ShoppingListSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  price: number;
  store: string;
  onSuccess?: () => void;
}

// Helper component that wraps each list item with its own hook
function ShoppingListItem({ 
  listId, 
  listValues, 
  productId,
  productName,
  price,
  storeName,
  onSuccess,
  onClose,
}: {
  listId: string;
  listValues: any;
  productId: number;
  productName: string;
  price: number;
  storeName: string;
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  
  // 🔔 UPDATED: Use helper hook with automatic notification support
  const addProduct = useAddProductWithNotifications(listId);

  const handlePress = async () => {
    try {
      if (!addProduct) {
        Alert.alert('Error', 'Shopping list not found');
        return;
      }

      // 🔔 Now automatically handles duplicate warnings!
      const productAddedId = await addProduct(
        productName,
        1, // quantity
        'pc', // units
        '', // notes
        storeName, // selectedStore
        price, // selectedPrice
        productId, // databaseProductId
        '' // category
      );

      // 🔔 If productAddedId is null, duplicate was found and notification was created
      if (productAddedId) {
        Alert.alert(
          'Success',
          `${productName} added to your shopping list!`,
          [
            {
              text: 'View List',
              onPress: () => {
                onClose();
                router.push(`/(index)/list/${listId}`);
              },
            },
            { text: 'OK', onPress: onClose },
          ]
        );
        onSuccess?.();
      } else {
        // Duplicate was found - notification was automatically created
        Alert.alert(
          'Duplicate Product', 
          `${productName} is already in this list. Check your notifications for details.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product to list');
    }
  };

  const values = listValues.values || {};

  return (
    <Pressable
      style={({ pressed }) => [
        styles.listItem,
        pressed && styles.listItemPressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.listIcon}>
        <ThemedText style={styles.listEmoji}>
          {values.emoji || '🛒'}
        </ThemedText>
      </View>
      <View style={styles.listContent}>
        <ThemedText style={styles.listName}>
          {values.name || 'Unnamed List'}
        </ThemedText>
        {values.description && (
          <ThemedText style={styles.listDescription}>
            {values.description}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="plus.circle" size={24} color="#007AFF" />
    </Pressable>
  );
}

export default function ShoppingListSelectorModal({
  visible,
  onClose,
  productId,
  productName,
  price,
  store,
  onSuccess,
}: ShoppingListSelectorModalProps) {
  const router = useRouter();
  const shoppingListIds = useShoppingListIds();
  const shoppingListsValues = useShoppingListsValues();

  // 🔔 UPDATED: Navigate to create list page instead of creating inline
  const handleCreateNewList = () => {
    onClose(); // Close the modal first
    
    // Navigate to the create list page
    // You can pass the product info as params if you want to add it automatically
    router.push({
      pathname: '/(index)/list/new/create',
      params: {
        // Optional: Pass product info to auto-add after list creation
        pendingProductId: productId.toString(),
        pendingProductName: productName,
        pendingProductPrice: price.toString(),
        pendingProductStore: store,
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ThemedText style={styles.title}>Add to Shopping List</ThemedText>
              <ThemedText style={styles.productName}>{productName}</ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={28} color="#999" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Create New List Button - Now redirects to create page */}
            <Pressable
              style={styles.createNewButton}
              onPress={handleCreateNewList}
            >
              <View style={styles.createNewIcon}>
                <IconSymbol name="plus.circle.fill" size={24} color="#007AFF" />
              </View>
              <View style={styles.createNewContent}>
                <ThemedText style={styles.createNewText}>
                  Create New List
                </ThemedText>
                <ThemedText style={styles.createNewSubtext}>
                  Set budget, date, and customize your list
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#007AFF" />
            </Pressable>

            {/* Divider */}
            {shoppingListIds.length > 0 && (
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>or add to existing</ThemedText>
                <View style={styles.dividerLine} />
              </View>
            )}

            {/* Existing Lists */}
            {shoppingListIds.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="list.bullet" size={48} color="#ccc" />
                <ThemedText style={styles.emptyStateText}>
                  No shopping lists yet
                </ThemedText>
                <ThemedText style={styles.emptyStateSubtext}>
                  Create your first list above
                </ThemedText>
              </View>
            ) : (
              shoppingListsValues.map((list, index) => {
                const listId = shoppingListIds[index];
                
                return (
                  <ShoppingListItem
                    key={listId}
                    listId={listId}
                    listValues={list}
                    productId={productId}
                    productName={productName}
                    price={price}
                    storeName={store}
                    onSuccess={onSuccess}
                    onClose={onClose}
                  />
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  createNewIcon: {
    marginRight: 12,
  },
  createNewContent: {
    flex: 1,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  createNewSubtext: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#999',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  listItemPressed: {
    backgroundColor: '#e8e9ea',
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listEmoji: {
    fontSize: 24,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  listDescription: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#666',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});