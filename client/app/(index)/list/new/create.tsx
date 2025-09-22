/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import { Link, Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import { appleBlue, backgroundColors, emojies } from "@/constants/Colors";
import { useListCreation } from "@/context/ListCreationContext";
import { useAddShoppingListCallback } from "@/stores/ShoppingListsStore";
import DatePickerButton from "@/components/DatePickerButton"; // You'll need to create this component
import BudgetInput from "@/components/BudgetInput"; // You'll need to create this component

export default function CreateListScreen() {
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

  const router = useRouter();
  const useAddShoppingList = useAddShoppingListCallback();

  useEffect(() => {
    console.log('🔧 Budget changed in CreateListScreen:', {
      budget,
      budgetType: typeof budget
    });
  }, [budget]);

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
      setBudget(0); // Add this to reset budget
    };
  }, []);
  
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

  const handleCreateList = () => {
    if (!listName) {
      return;
    }

    console.log('Creating list with budget:', {
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

    router.replace({
      pathname: "/list/[listId]",
      params: { listId },
    });
  };

  const handleCreateTestLists = () => {
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

    testListNames.forEach((name, index) => {
      useAddShoppingList(
        name,
        `This is a test list for ${name}`,
        testEmojis[index],
        testColors[index],
        getRandomDate(index)
      );
    });

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
          onBudgetChange={(val) => {
            console.log("📝 BudgetInput change:", val, typeof val);
            setBudget(val);
          }}
          borderColor={selectedColor}
        />

        </View>
        
        <Button
          onPress={handleCreateList}
          disabled={!listName}
          variant="ghost"
          textStyle={styles.createButtonText}
        >
          Create list
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