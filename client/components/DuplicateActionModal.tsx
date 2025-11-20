// components/DuplicateActionModal.tsx
import React from 'react';
import { StyleSheet, View, Modal, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Button from '@/components/ui/button';
import { Colors } from '@/constants/Colors';
import { StyleProp, ViewStyle } from "react-native";
import { Feather } from '@expo/vector-icons';

export type DuplicateActionType = 'merge' | 'discard' | 'add-anyway' | 'cancel';

export interface DuplicateInfo {
  productName: string;
  existingQuantity: number;
  newQuantity: number;
  units: string;
  existingStore?: string;
  newStore?: string;
  isDifferentStore: boolean;
}

interface DuplicateActionModalProps {
  visible: boolean;
  duplicateInfo: DuplicateInfo | null;
  onAction: (action: DuplicateActionType) => void;
}

export default function DuplicateActionModal({
  visible,
  duplicateInfo,
  onAction,
}: DuplicateActionModalProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = createStyles(colors);

  if (!duplicateInfo) return null;

  const {
    productName,
    existingQuantity,
    newQuantity,
    units,
    existingStore,
    newStore,
    isDifferentStore,
  } = duplicateInfo;

  const mergedQuantity = existingQuantity + newQuantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onAction('cancel')}
    >
      <Pressable 
        style={styles.overlay} 
        onPress={() => onAction('cancel')}
      >
        <Pressable 
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                name={isDifferentStore ? "building.2" : "exclamationmark.triangle.fill"} 
                size={32} 
                color={isDifferentStore ? "#007AFF" : "#FF9500"} 
              />
            </View>
            <ThemedText type="title" style={styles.title}>
              {isDifferentStore ? 'Different Store Detected' : 'Duplicate Product Found'}
            </ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.productInfo}>
              <ThemedText type="defaultSemiBold" style={styles.productName}>
                {productName}
              </ThemedText>
              
              {isDifferentStore ? (
                <>
                  <View style={styles.storeComparison}>
                    <View style={styles.storeItem}>
                      <ThemedText style={styles.storeLabel}>Current:</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.storeName}>
                        {existingStore || 'No store'}
                      </ThemedText>
                      <ThemedText style={styles.quantity}>
                        {existingQuantity} {units}
                      </ThemedText>
                    </View>
                    
                    <IconSymbol name="arrow.right" size={20} color={colors.text} />
                    
                    <View style={styles.storeItem}>
                      <ThemedText style={styles.storeLabel}>Adding:</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.storeName}>
                        {newStore || 'No store'}
                      </ThemedText>
                      <ThemedText style={styles.quantity}>
                        {newQuantity} {units}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.infoBox}>
                    <IconSymbol name="info.circle" size={16} color="#007AFF" />
                    <ThemedText style={styles.infoText}>
                      This product exists from a different store. You can add it as a separate item or merge the quantities.
                    </ThemedText>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.quantityComparison}>
                    <View style={styles.quantityBox}>
                      <ThemedText style={styles.quantityLabel}>Current</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.quantityValue}>
                        {existingQuantity} {units}
                      </ThemedText>
                    </View>
                    
                    <IconSymbol name="plus" size={20} color={colors.text} />
                    
                    <View style={styles.quantityBox}>
                      <ThemedText style={styles.quantityLabel}>Adding</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.quantityValue}>
                        {newQuantity} {units}
                      </ThemedText>
                    </View>
                    
                    <IconSymbol name="equal" size={20} color={colors.text} />
                    
                    <View style={[styles.quantityBox, styles.mergedBox]}>
                      <ThemedText style={styles.quantityLabel}>Merged</ThemedText>
                      <ThemedText type="defaultSemiBold" style={[styles.quantityValue, styles.mergedValue]}>
                        {mergedQuantity} {units}
                      </ThemedText>
                    </View>
                  </View>
                  
                  {existingStore && (
                    <View style={styles.storeInfo}>
                      <IconSymbol name="storefront" size={16} color={colors.text} />
                      <ThemedText style={styles.storeText}>
                        Store: {existingStore}
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {isDifferentStore ? (
              <>
                <Button
                  variant="outline"
                  onPress={() => onAction('add-anyway')}
                  style={styles.actionButton}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="plus.circle" size={18} color="#007AFF" />
                    <ThemedText style={styles.buttonText}>Add Separately</ThemedText>
                  </View>
                </Button>
                
                <Button
                  onPress={() => onAction('merge')}
                  style={StyleSheet.flatten([styles.actionButton, styles.primaryButton])}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="arrow.merge" size={18} color="#fff" />
                    <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                      Merge ({mergedQuantity} {units})
                    </ThemedText>
                  </View>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onPress={() => onAction('discard')}
                  style={styles.actionButton}
                >
                  <View style={styles.buttonContent}>
                    <Feather name="x" size={26} color="red" />
                    <ThemedText style={[styles.buttonText, { color: '#FF3B30' }]}>
                      Discard
                    </ThemedText>
                  </View>
                </Button>
                
                <Button
                  onPress={() => onAction('merge')}
                  style={StyleSheet.flatten([styles.actionButton, styles.primaryButton])}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="arrow.merge" size={18} color="#fff" />
                    <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                      Merge ({mergedQuantity} {units})
                    </ThemedText>
                  </View>
                </Button>
              </>
            )}
          </View>

          {/* Cancel */}
          <Pressable 
            style={styles.cancelButton}
            onPress={() => onAction('cancel')}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderRadius: 16,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    iconContainer: {
      marginBottom: 12,
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
    },
    content: {
      padding: 20,
    },
    productInfo: {
      gap: 16,
    },
    productName: {
      fontSize: 18,
      textAlign: 'center',
    },
    quantityComparison: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: 16,
      backgroundColor: colors.mainBackground,
      borderRadius: 12,
      gap: 8,
    },
    quantityBox: {
      alignItems: 'center',
      flex: 1,
    },
    quantityLabel: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.6,
      marginBottom: 4,
    },
    quantityValue: {
      fontSize: 16,
    },
    mergedBox: {
      backgroundColor: '#34C75920',
      borderRadius: 8,
      padding: 8,
    },
    mergedValue: {
      color: '#34C759',
    },
    storeComparison: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      backgroundColor: colors.mainBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      gap: 12,
    },
    storeItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    storeLabel: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.6,
    },
    storeName: {
      fontSize: 16,
      color: '#007AFF',
    },
    quantity: {
      fontSize: 14,
      color: colors.text,
    },
    storeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    storeText: {
      fontSize: 14,
      color: colors.text,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 12,
      backgroundColor: '#007AFF10',
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#007AFF',
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: colors.text,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      padding: 20,
      paddingTop: 0,
    },
    actionButton: {
      flex: 1,
    },
    primaryButton: {
      backgroundColor: '#007AFF',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: '#fff',
    },
    cancelButton: {
      padding: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    cancelText: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.6,
    },
  });
}