/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import { Link, Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, Alert } from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import { appleBlue, backgroundColors, emojies } from "@/constants/Colors";
import { useListCreation } from "@/context/ListCreationContext";
import { useAddShoppingListCallback } from "@/stores/ShoppingListsStore";
import DatePickerButton from "@/components/DatePickerButton";
import BudgetInput from "@/components/BudgetInput";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser } from "@clerk/clerk-expo";

export default function CreateListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Check if there's a pending product to add after list creation
  const pendingProductId = params.pendingProductId ? Number(params.pendingProductId) : null;
  const pendingProductName = params.pendingProductName as string | undefined;
  const pendingProductPrice = params.pendingProductPrice ? Number(params.pendingProductPrice) : null;
  const pendingProductStore = params.pendingProductStore as string | undefined;

  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  
  const { 
    selectedEmoji, 
    setSelectedEmoji, 
    selectedColor, 
    setSelectedColor,
    selectedDate,
    setSelectedDate,
    budget,
    setBudget 
  } = useListCreation();

  const useAddShoppingList = useAddShoppingListCallback();
  
  // 🔔 Get notification functions
  const { user } = useUser();
  const { scheduleShoppingReminder } = useNotifications(user?.id || '');

  // 🔔 Helper function to navigate to list with pending product params
  const navigateToListWithProduct = (
    listId: string,
    productName: string,
    productId: number,
    price: number,
    store: string
  ) => {
    console.log('🔔 Navigating to list with pending product:', {
      listId,
      productName,
      productId,
      price,
      store
    });
    
    router.replace({
      pathname: "/list/[listId]",
      params: { 
        listId,
        // Pass the pending product info to the list page to handle adding
        addProductId: productId.toString(),
        addProductName: productName,
        addProductPrice: price.toString(),
        addProductStore: store,
      },
    });
  };

  useEffect(() => {
    setSelectedEmoji(emojies[Math.floor(Math.random() * emojies.length)]);
    setSelectedColor(
      backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
    );

    // Cleanup function to reset context when unmounting
    return () => {
      setSelectedEmoji("");
      setSelectedColor("");
      setSelectedDate(null);
    };
  }, []);

  const handleCreateList = async () => {
    if (!listName) {
      return;
    }
    
      console.log('🔬 DEBUG - Budget from context:', budget);
      console.log('🔬 DEBUG - Budget type:', typeof budget);
      console.log('🔬 DEBUG - All params:', {
      listName,
      listDescription,
      selectedEmoji,
      selectedColor,
      selectedDate,
      budget,
      budgetType: typeof budget
    });

    const listId = useAddShoppingList(
      listName,
      listDescription,
      selectedEmoji,
      selectedColor,
      selectedDate,
      budget
    );

    if (!listId) {
      Alert.alert('Error', 'Failed to create list');
      return;
    }

    // 🔔 SCHEDULE SHOPPING REMINDER if date is set
    if (selectedDate) {
      try {
        const reminderScheduled = await scheduleShoppingReminder(listId, selectedDate);
        if (reminderScheduled) {
          console.log('✅ Shopping reminder scheduled for', selectedDate);
        }
      } catch (error) {
        console.error('❌ Failed to schedule reminder:', error);
      }
    }

    // 🔔 NEW: Check if there's a pending product to add
    // Pass it to the list page to handle adding
    setTimeout(() => {
      if (pendingProductId && pendingProductName && pendingProductPrice && pendingProductStore) {
        navigateToListWithProduct(
          listId,
          pendingProductName,
          pendingProductId,
          pendingProductPrice,
          pendingProductStore
        );
      } else {
        // No pending product, just navigate normally
        router.replace({
          pathname: "/list/[listId]",
          params: { listId },
        });
      }
    }, 100);
  };

  const handleCreateTestLists = async () => {
    const testListNames = [
      "Grocery Shopping",
      "Weekend BBQ",
      "Party Supplies",
      "Office Supplies",
      "Camping Trip",
      "Holiday Gifts",
      "Home Improvement",
      "School Supplies",
      "Birthday Party",
      "Household Items",
    ];

    const testEmojis = [
      "🛒",
      "🍖",
      "🎉",
      "📎",
      "⛺️",
      "🎁",
      "🔨",
      "📚",
      "🎂",
      "🏠",
    ];
    const testColors = Object.values(backgroundColors).slice(0, 10);

    // Create test dates (today + random days in the future)
    const getRandomDate = (index: number) => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 7) + index);
      return date;
    };

    for (let index = 0; index < testListNames.length; index++) {
      const name = testListNames[index];
      const testDate = getRandomDate(index);
      
      const listId = useAddShoppingList(
        name,
        `This is a test list for ${name}`,
        testEmojis[index],
        testColors[index],
        testDate
      );

      // 🔔 Schedule reminder for each test list
      if (listId && testDate) {
        await scheduleShoppingReminder(listId, testDate);
      }
    }

    console.log('✅ Created 10 test lists with reminders');

    // Navigate back to the main list view
    router.replace("/");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle: "New list",
        }}
      />
      <BodyScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Show indicator if creating list for a recommended product */}
        {pendingProductName && (
          <View style={styles.pendingProductBanner}>
            <Text style={styles.pendingProductText}>
              Creating list for: <Text style={styles.pendingProductName}>{pendingProductName}</Text>
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Grocery Essentials"
            value={listName}
            onChangeText={setListName}
            onSubmitEditing={handleCreateList}
            returnKeyType="done"
            variant="ghost"
            size="lg"
            autoFocus
            inputStyle={styles.titleInput}
            containerStyle={styles.titleInputContainer}
          />
          <Link
            href={{ pathname: "/emoji-picker" }}
            style={[styles.emojiButton, { borderColor: selectedColor }]}
          >
            <View style={styles.emojiContainer}>
              <Text>{selectedEmoji}</Text>
            </View>
          </Link>
          <Link
            href={{ pathname: "/color-picker" }}
            style={[styles.colorButton, { borderColor: selectedColor }]}
          >
            <View style={styles.colorContainer}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 100,
                  backgroundColor: selectedColor,
                }}
              />
            </View>
          </Link>
        </View>
        
        <TextInput
          placeholder="Description (optional)"
          value={listDescription}
          onChangeText={setListDescription}
          onSubmitEditing={handleCreateList}
          returnKeyType="done"
          variant="ghost"
          inputStyle={styles.descriptionInput}
        />

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>When do you plan to shop?</Text>
          <DatePickerButton
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            borderColor={selectedColor}
          />
        </View>

        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>What's your budget?</Text>
          <BudgetInput
            budget={budget}
            onBudgetChange={setBudget}
            borderColor={selectedColor}
          />
        </View>
        
        <Button
          onPress={handleCreateList}
          disabled={!listName}
          variant="ghost"
          textStyle={styles.createButtonText}
        >
          {pendingProductName ? 'Create list and add product' : 'Create list'}
        </Button>
        <Button
          onPress={handleCreateTestLists}
          variant="ghost"
          textStyle={styles.createButtonText}
        >
          Create 10 test lists
        </Button>
      </BodyScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  pendingProductBanner: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  pendingProductText: {
    fontSize: 14,
    color: '#666',
  },
  pendingProductName: {
    fontWeight: '600',
    color: '#007AFF',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleInput: {
    fontWeight: "600",
    fontSize: 28,
    padding: 0,
  },
  titleInputContainer: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: "auto",
    marginBottom: 0,
  },
  emojiButton: {
    padding: 1,
    borderWidth: 3,
    borderRadius: 100,
  },
  emojiContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: {
    padding: 0,
  },
  createButtonText: {
    color: appleBlue,
    fontWeight: "normal",
  },
  colorButton: {
    padding: 1,
    borderWidth: 3,
    borderRadius: 100,
  },
  colorContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dateSection: {
    marginVertical: 16,
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  budgetSection: {
    marginVertical: 16,
    gap: 8,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
});