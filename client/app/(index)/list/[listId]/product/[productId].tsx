import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Pressable, StyleSheet, Alert, useColorScheme, Modal, FlatList, ActivityIndicator, Text } from "react-native";
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
import { useProductPrices } from "@/hooks/useProducts";
import { EvilIcons } from "@expo/vector-icons";
import { exposedGhostText, borderColor } from '../../../../../constants/Colors';

// Define ProductPrice type locally to match the API structure
interface ProductPrice {
  id: number;
  product_id: number;
  price: number;
  store: string;
}

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
  const [selectedStore, setSelectedStore] = useShoppingListProductCell(listId, productId, "selectedStore");
  const [selectedPrice, setSelectedPrice] = useShoppingListProductCell(listId, productId, "selectedPrice");
  const [category] = useShoppingListProductCell(listId, productId, "category");
  const [databaseProductId] = useShoppingListProductCell(listId, productId, "databaseProductId");
  
  const createdBy = useShoppingListProductCreatedByNickname(listId, productId);
  const [createdAt] = useShoppingListProductCell(
    listId,
    productId,
    "createdAt"
  );
  const userNicknames = useShoppingListUserNicknames(listId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Fetch prices from database if product has databaseProductId
  const { prices, loading: pricesLoading } = useProductPrices(databaseProductId || null);

  // Convert selectedPrice to number for calculations
  const price = typeof selectedPrice === 'number' ? selectedPrice : 0;
  const store = selectedStore || "";
  const totalPrice = price && quantity ? price * quantity : null;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleStoreSelect = (priceItem: ProductPrice) => {
    setSelectedStore(priceItem.store);
    setSelectedPrice(priceItem.price);
    setShowStorePicker(false);
  };

  const handleCustomPriceSubmit = () => {
    setIsEditingPrice(false);
    setShowStorePicker(false);
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
    <>
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

        {/* Price & Store Card - Always visible to allow editing */}
        <View style={styles.card}>
          <View style={styles.cardHeaderDetails}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              }}>
            <IconSymbol name="cart.fill" size={20} color="#007AFF" />
            <ThemedText type="defaultSemiBold" style={styles.cardTitleDetail}>
              Purchase Details
            </ThemedText>
            </View>
            <Pressable 
              style={styles.infoRow} 
              onPress={() => setShowStorePicker(true)}
            >
              <View style={styles.editbutton}>
              <Text style={[styles.edittext]}>
                Edit
                <EvilIcons name="pencil" size={19}  color={colors.ghost}/>
              </Text>
              </View>
            </Pressable>
          </View>
          <View style={styles.priceStoreContainer}>
            {/* Store Display */}
            <View 
              style={styles.infoRow} 
            >
              <ThemedText style={styles.infoLabel}>Store:</ThemedText>
              <View style={styles.storeValueContainer}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[styles.storeName, !store && styles.placeholderText]}
                >
                  {store || "Tap to select store"}
                </ThemedText>
              </View>
            </View>

            {/* Price Display */}
            {(price > 0 || isEditingPrice) ? (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Unit Price:</ThemedText>
                  {isEditingPrice ? (
                    <View style={styles.priceInputWrapper}>
                      <ThemedText style={styles.currencySymbol}>₱</ThemedText>
                      <TextInput
                        value={price > 0 ? price.toString() : ""}
                        onChangeText={(text) => {
                          const numValue = parseFloat(text) || 0;
                          setSelectedPrice(numValue);
                        }}
                        keyboardType="decimal-pad"
                        autoFocus
                        onBlur={handleCustomPriceSubmit}
                        placeholder="0.00"
                        inputStyle={styles.priceInputText}
                        containerStyle={styles.priceInputContainer}
                      />
                    </View>
                  ) : (
                    <View 
                      style={styles.priceValueContainer}
                    >
                      <ThemedText type="defaultSemiBold" style={styles.priceText}>
                        ₱{price.toFixed(2)}
                      </ThemedText>
                    </View>
                  )}
                </View>
                {totalPrice && !isEditingPrice && (
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Total:</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.totalPriceText}>
                      ₱{totalPrice.toFixed(2)}
                    </ThemedText>
                  </View>
                )}
              </>
            ) : (
              <Pressable 
                onPress={() => setShowStorePicker(true)} 
                style={styles.infoRow}
              >
                <ThemedText style={styles.infoLabel}>Unit Price:</ThemedText>
                <View style={styles.priceValueContainer}>
                  <ThemedText 
                    type="defaultSemiBold" 
                    style={[styles.priceText, styles.placeholderText]}
                  >
                    Tap to add price
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={16} color="#999" />
                </View>
              </Pressable>
            )}
          </View>
        </View>

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
                name="minus"
                size={23}
                color={quantity <= 1 ? colors.text : "#FFF"}
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
              <IconSymbol name="plus" size={32} color='#fff' />
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
            {notes ? (
              <ThemedText style={styles.notesDisplay}>
                {notes}
              </ThemedText>
            ) : (
              <ThemedText style={styles.notesPlaceholder}>
                No notes added for this product
              </ThemedText>
            )}
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

      {/* Store & Price Picker Modal */}
      <Modal
        visible={showStorePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStorePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowStorePicker(false)}>
              <IconSymbol name="xmark" size={24} color="#007AFF" />
            </Pressable>
            <ThemedText type="title" style={styles.modalTitle}>
              Select Store & Price
            </ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            {databaseProductId && prices.length > 0 ? (
              <>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Available Stores for {name}
                </ThemedText>
                {pricesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <ThemedText style={styles.loadingText}>Loading prices...</ThemedText>
                  </View>
                ) : (
                  <FlatList
                    data={prices}
                    renderItem={({ item }) => (
                      <StoreSelectionItem
                        price={item}
                        onSelect={handleStoreSelect}
                        isSelected={selectedStore === item.store && selectedPrice === item.price}
                        colors={colors}
                      />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.storeList}
                  />
                )}
              </>
            ) : (
              <View style={styles.noPricesContainer}>
                <IconSymbol name="exclamationmark.triangle" size={48} color="#FF9500" />
                <ThemedText type="subtitle" style={styles.noPricesTitle}>
                  No Store Data Available
                </ThemedText>
                <ThemedText style={styles.noPricesText}>
                  This product doesn't have store prices in our database. You can enter a custom price below.
                </ThemedText>
              </View>
            )}

            {/* Custom Price Entry */}
            <View style={styles.customPriceSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Or Enter Custom Price
              </ThemedText>
              <View style={styles.customPriceRow}>
                <TextInput
                  label="Store Name"
                  value={selectedStore || ""}
                  onChangeText={setSelectedStore}
                  placeholder="Enter store name"
                  containerStyle={styles.customStoreInput}
                />
                <View style={styles.customPriceInputWrapper}>
                  <ThemedText style={styles.customCurrencySymbol}>₱</ThemedText>
                  <TextInput
                    label="Price"
                    value={price > 0 ? price.toString() : ""}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text) || 0;
                      setSelectedPrice(numValue);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    containerStyle={styles.customPriceInput}
                  />
                </View>
              </View>
              <Button
                onPress={() => {
                  if (selectedStore && price > 0) {
                    setShowStorePicker(false);
                  } else {
                    Alert.alert("Incomplete", "Please enter both store name and price");
                  }
                }}
                style={styles.saveButton}
              >
                Save Custom Price
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function StoreSelectionItem({ 
  price, 
  onSelect, 
  isSelected,
  colors
}: { 
  price: ProductPrice; 
  onSelect: (price: ProductPrice) => void;
  isSelected: boolean;
  colors: typeof Colors.light;
}) {
  const styles = createStyles(colors);
  
  return (
    <Pressable
      style={[styles.storeItem, isSelected && styles.storeItemSelected]}
      onPress={() => onSelect(price)}
    >
      <View style={styles.storeItemContent}>
        <View style={styles.storeItemLeft}>
          <IconSymbol 
            name="storefront.fill" 
            size={24} 
            color={isSelected ? "#007AFF" : "#666"} 
          />
          <View style={styles.storeItemInfo}>
            <ThemedText type="defaultSemiBold" style={styles.storeItemName}>
              {price.store}
            </ThemedText>
            <ThemedText style={styles.storeItemDate}>
              Price ID: #{price.id}
            </ThemedText>
          </View>
        </View>
        <View style={styles.storeItemRight}>
          <ThemedText type="title" style={styles.storeItemPrice}>
            ₱{price.price.toFixed(2)}
          </ThemedText>
          {isSelected && (
            <IconSymbol name="checkmark.circle.fill" color="#34C759" size={20} />
          )}
        </View>
      </View>
    </Pressable>
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
    cardHeaderDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    cardTitleDetail: {
      fontSize: 16,
      marginLeft: 8,
    },
    cardTitle: {
      fontSize: 16,
    },
    editbutton:{
      flexDirection: 'row',
    },
    edittext:{
      fontSize: 18,
      color: colors.exposedGhost
    },
    priceStoreContainer: {
      gap: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.ghost,
    },
    storeValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    priceValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    storeName: {
      fontSize: 16,
      color: '#007AFF',
    },
    priceInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    currencySymbol: {
      fontSize: 16,
      color: '#34C759',
      fontWeight: '600',
    },
    priceInputContainer: {
      width: 100,
    },
    priceInputText: {
      fontSize: 16,
      color: '#34C759',
      fontWeight: '600',
      padding: 8,
      textAlign: 'right',
    },
    placeholderText: {
      opacity: 0.5,
      fontStyle: 'italic',
    },
    priceText: {
      fontSize: 16,
      color: '#34C759',
      fontWeight: '600',
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
      backgroundColor: '#007AFF'
    },
    quantityDisplay: {
      fontSize: 48,
      fontWeight: 'bold',
      minWidth: 80,
      textAlign: 'center',
      lineHeight: 40
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
      marginBottom: 10
    },
    notesDisplay: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
      minHeight: 80,
    },
    notesPlaceholder: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.ghost,
      fontStyle: 'italic',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
      minHeight: 80,
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
      color: colors.exposedGhost,
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
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    modalTitle: {
      fontSize: 18,
    },
    modalContent: {
      flex: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      marginBottom: 12,
      color: colors.ghost,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      color: colors.exposedGhost,
    },
    storeList: {
      gap: 8,
    },
    storeItem: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      marginBottom: 8,
    },
    storeItemSelected: {
      borderColor: '#007AFF',
      backgroundColor: '#007AFF10',
    },
    storeItemContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    storeItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    storeItemInfo: {
      flex: 1,
    },
    storeItemName: {
      fontSize: 16,
      marginBottom: 4,
    },
    storeItemDate: {
      fontSize: 12,
      color: colors.ghost,
    },
    storeItemRight: {
      alignItems: 'flex-end',
      gap: 4,
    },
    storeItemPrice: {
      fontSize: 20,
      color: '#34C759',
    },
    noPricesContainer: {
      padding: 40,
      alignItems: 'center',
      gap: 12,
    },
    noPricesTitle: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 8,
    },
    noPricesText: {
      textAlign: 'center',
      color: '#666',
      lineHeight: 20,
    },
    customPriceSection: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    customPriceRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    customStoreInput: {
      flex: 1,
    },
    customPriceInputWrapper: {
      width: 120,
      position: 'relative',
    },
    customCurrencySymbol: {
      position: 'absolute',
      left: 12,
      top: 40,
      fontSize: 16,
      color: '#34C759',
      fontWeight: '600',
      zIndex: 1,
    },
    customPriceInput: {
      paddingLeft: 24,
    },
    saveButton: {
      marginTop: 8,
    },
  });
}