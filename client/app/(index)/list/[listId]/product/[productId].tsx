import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Pressable, StyleSheet, Alert, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import TextInput from "@/components/ui/text-input";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductCell,
  useShoppingListProductCreatedByNickname,
  useShoppingListUserNicknames,
} from "@/stores/ShoppingListStore";
import { Colors } from "@/constants/Colors";

export default function ProductScreen() {
  const { listId, productId } = useLocalSearchParams() as {
    listId: string;
    productId: string;
  };

  // Check if the product exists by trying to get any of its properties
  const [name] = useShoppingListProductCell(listId, productId, "name");

  // If the product doesn't exist anymore, redirect to the list
  React.useEffect(() => {
    if (name === undefined) {
      router.replace(`/list/${listId}`);
    }
  }, [listId, name]);

  // If the product is deleted, show nothing while redirecting
  if (name === undefined) {
    return null;
  }

  return <ProductContent listId={listId} productId={productId} />;
}

function ProductContent({
  listId,
  productId,
}: {
  listId: string;
  productId: string;
}) {
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  const [name, setName] = useShoppingListProductCell(listId, productId, "name");
  const [quantity, setQuantity] = useShoppingListProductCell(
    listId,
    productId,
    "quantity"
  );
  const [notes, setNotes] = useShoppingListProductCell(
    listId,
    productId,
    "notes"
  );
  const [isPurchased] = useShoppingListProductCell(listId, productId, "isPurchased");
  const [selectedStore] = useShoppingListProductCell(listId, productId, "selectedStore");
  const [selectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
  const [category] = useShoppingListProductCell(listId, productId, "category");
  
  const createdBy = useShoppingListProductCreatedByNickname(listId, productId);
  const [createdAt] = useShoppingListProductCell(
    listId,
    productId,
    "createdAt"
  );
  const userNicknames = useShoppingListUserNicknames(listId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);

  // Convert selectedPrice to number for calculations
  const price = typeof selectedPrice === 'number' ? selectedPrice : 0;
  const store = selectedStore || "";
  const totalPrice = price && quantity ? price * quantity : null;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to remove "${name}" from this list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Add delete logic here if available
            router.back();
          },
        },
      ]
    );
  };

  return (
    <BodyScrollView
      contentContainerStyle={styles.container}
    >
      <StatusBar style="light" animated />

      {/* Header Card - Product Name & Status */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {isPurchased ? (
              <IconSymbol name="checkmark.circle.fill" size={32} color="#34C759" />
            ) : (
              <IconSymbol name="circle" size={32} color="#999" />
            )}
            <View style={styles.headerTextContainer}>
              {isEditingName ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                  inputStyle={styles.nameInput}
                />
              ) : (
                <Pressable onPress={() => setIsEditingName(true)}>
                  <ThemedText type="title" style={styles.productName}>
                    {name}
                  </ThemedText>
                </Pressable>
              )}
              {category && (
                <View style={styles.categoryBadge}>
                  <ThemedText style={styles.categoryText}>{category}</ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Price & Store Card */}
      {(store || price) && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="cart.fill" size={20} color="#007AFF" />
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Purchase Details
            </ThemedText>
          </View>
          <View style={styles.priceStoreContainer}>
            {store && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Store:</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.storeName}>
                  {store}
                </ThemedText>
              </View>
            )}
            {price && (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Unit Price:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.priceText}>
                    ₱{price.toFixed(2)}
                  </ThemedText>
                </View>
                {totalPrice && (
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Total:</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.totalPriceText}>
                      ₱{totalPrice.toFixed(2)}
                    </ThemedText>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Quantity Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <IconSymbol name="number" size={20} color="#FF9500" />
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Quantity
          </ThemedText>
        </View>
        <View style={styles.quantityContainer}>
          <Button
            variant="ghost"
            onPress={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            style={styles.quantityButton}
          >
            <IconSymbol
              name="minus.circle.fill"
              size={32}
              color={quantity <= 1 ? "#CCC" : "#007AFF"}
            />
          </Button>
          
          {isEditingQuantity ? (
            <TextInput
              value={quantity.toString()}
              onChangeText={(value) => {
                const num = parseInt(value) || 1;
                handleQuantityChange(num);
              }}
              keyboardType="numeric"
              autoFocus
              onBlur={() => setIsEditingQuantity(false)}
              containerStyle={styles.quantityInputContainer}
              inputStyle={styles.quantityInputText}
            />
          ) : (
            <Pressable onPress={() => setIsEditingQuantity(true)}>
              <ThemedText type="title" style={styles.quantityDisplay}>
                {quantity}
              </ThemedText>
            </Pressable>
          )}

          <Button
            variant="ghost"
            onPress={() => handleQuantityChange(quantity + 1)}
            style={styles.quantityButton}
          >
            <IconSymbol name="plus.circle.fill" size={32} color="#007AFF" />
          </Button>
        </View>
      </View>

      {/* Notes Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <IconSymbol name="note.text" size={20} color="#5856D6" />
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Notes
          </ThemedText>
        </View>
        <TextInput
          value={notes || ""}
          editable={true}
          onChangeText={setNotes}
          variant="ghost"
          placeholder="Add notes about this product..."
          multiline
          numberOfLines={3}
          inputStyle={styles.notesInput}
        />
      </View>

      {/* Metadata Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <IconSymbol name="info.circle" size={20} color="#8E8E93" />
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Product Information
          </ThemedText>
        </View>
        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <ThemedText style={styles.metadataLabel}>Added by:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.metadataValue}>
              {createdBy ?? "Unknown"}
            </ThemedText>
          </View>
          <View style={styles.metadataRow}>
            <ThemedText style={styles.metadataLabel}>Date added:</ThemedText>
            <ThemedText style={styles.metadataValue}>
              {createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown"}
            </ThemedText>
          </View>
          {isPurchased !== undefined && (
            <View style={styles.metadataRow}>
              <ThemedText style={styles.metadataLabel}>Status:</ThemedText>
              <View style={[styles.statusBadge, isPurchased && styles.statusBadgeChecked]}>
                <ThemedText style={[styles.statusText, isPurchased && styles.statusTextChecked]}>
                  {isPurchased ? "Purchased" : "Pending"}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Shared With Card */}
      {userNicknames.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="person.2" size={20} color="#FF2D55" />
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Shared With
            </ThemedText>
          </View>
          <View style={styles.sharedWithContainer}>
            {userNicknames.map((nickname, index) => (
              <View key={nickname} style={styles.userChip}>
                <IconSymbol name="person.circle.fill" size={16} color="#007AFF" />
                <ThemedText style={styles.userChipText}>{nickname}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          onPress={handleDeleteProduct}
          style={styles.deleteButton}
        >
          <IconSymbol name="trash" size={18} color="#FF3B30" />
          <ThemedText style={styles.deleteButtonText}>Remove from List</ThemedText>
        </Button>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 40 }} />
    </BodyScrollView>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 100,
      
    },
    headerCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    headerContent: {
      flexDirection: 'column',
      gap: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    headerTextContainer: {
      flex: 1,
      gap: 8,
    },
    productName: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    nameInput: {
      fontSize: 24,
      fontWeight: 'bold',
      padding: 0,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#007AFF15',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    categoryText: {
      fontSize: 12,
      color: '#007AFF',
      fontWeight: '600',
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
    },
    priceStoreContainer: {
      gap: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    infoLabel: {
      fontSize: 14,
      color: '#8E8E93',
    },
    storeName: {
      fontSize: 16,
      color: '#007AFF',
    },
    priceText: {
      fontSize: 16,
      color: '#34C759',
    },
    totalPriceText: {
      fontSize: 18,
      color: '#007AFF',
      fontWeight: 'bold',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    },
    quantityButton: {
      padding: 0,
    },
    quantityDisplay: {
      fontSize: 48,
      fontWeight: 'bold',
      minWidth: 80,
      textAlign: 'center',
    },
    quantityInputContainer: {
      width: 100,
    },
    quantityInputText: {
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 0,
    },
    notesInput: {
      minHeight: 80,
      textAlignVertical: 'top',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    metadataContainer: {
      gap: 12,
    },
    metadataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    metadataLabel: {
      fontSize: 14,
      color: '#8E8E93',
    },
    metadataValue: {
      fontSize: 14,
    },
    statusBadge: {
      backgroundColor: '#FF9500',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    statusBadgeChecked: {
      backgroundColor: '#34C759',
    },
    statusText: {
      fontSize: 12,
      color: '#FFF',
      fontWeight: '600',
    },
    statusTextChecked: {
      color: '#FFF',
    },
    sharedWithContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    userChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#007AFF15',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    userChipText: {
      fontSize: 13,
      color: '#007AFF',
      fontWeight: '500',
    },
    actionButtons: {
      marginTop: 8,
      gap: 12,
    },
    deleteButton: {
      borderColor: '#FF3B30',
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonText: {
      color: '#FF3B30',
      fontWeight: '600',
    },
  });
}