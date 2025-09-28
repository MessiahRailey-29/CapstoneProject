import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import BudgetInput from "@/components/BudgetInput";
import { useListCreation } from "@/context/ListCreationContext";
// Remove ShoppingListStore imports - only use ShoppingListsStore
import { useShoppingListData, useValuesCopy } from "@/stores/ShoppingListsStore";
import { StatusBar } from "expo-status-bar";

export default function EditScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };

  // Only use ShoppingListsStore
  const listData = useShoppingListData(listId);
  const [valuesCopy, setValuesCopy] = useValuesCopy(listId);

  // Local state for editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);

  // List creation context for emoji/color pickers
  const { selectedEmoji, selectedColor, setSelectedColor, setSelectedEmoji } = useListCreation();

  // Initialize state when listData loads
  useEffect(() => {
    if (listData.name && name !== listData.name) {
      setName(listData.name);
    }
    if (listData.description !== undefined && description !== listData.description) {
      setDescription(listData.description);
    }
    if (listData.budget !== undefined && budget !== listData.budget) {
      setBudget(listData.budget);
    }
    if (listData.emoji && selectedEmoji !== listData.emoji) {
      setSelectedEmoji(listData.emoji);
    }
    if (listData.color && selectedColor !== listData.color) {
      setSelectedColor(listData.color);
    }
  }, [listData.name, listData.description, listData.budget, listData.emoji, listData.color]);

  // Cleanup function
  useEffect(() => {
    return () => {
      setSelectedEmoji("");
      setSelectedColor("");
    };
  }, [listId]);

  // Update data in store when any field changes
  const updateListData = (updates: Partial<typeof listData>) => {
    try {
      const currentData = JSON.parse(valuesCopy || '{}');
      const updatedData = {
        ...currentData,
        values: {
          ...currentData.values,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      };
      
      console.log('Updating list data:', updates);
      setValuesCopy(JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating list data:', error);
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    updateListData({ name: newName });
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    updateListData({ description: newDescription });
  };

  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
    updateListData({ budget: newBudget });
  };

  const handleEmojiPress = () => {
    router.push("/emoji-picker");
  };

  const handleColorPress = () => {
    router.push("/color-picker");
  };

  // Update when emoji/color context changes
  useEffect(() => {
    if (selectedEmoji && selectedEmoji !== listData.emoji) {
      updateListData({ emoji: selectedEmoji });
    }
  }, [selectedEmoji, listData.emoji]);

  useEffect(() => {
    if (selectedColor && selectedColor !== listData.color) {
      updateListData({ color: selectedColor });
    }
  }, [selectedColor, listData.color]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button variant="ghost" onPress={router.back}>
              Save
            </Button>
          ),
        }}
      />
      <StatusBar style="light" animated />
      <BodyScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.inputContainer}>
          <TextInput
            label="Name"
            placeholder="Grocery Essentials"
            value={name}
            onChangeText={handleNameChange}
            returnKeyType="done"
            containerStyle={styles.titleInputContainer}
          />
          <Pressable
            onPress={handleEmojiPress}
            style={[styles.emojiButton, { borderColor: selectedColor || listData.color || "#ccc" }]}
          >
            <View style={styles.emojiContainer}>
              <Text>{selectedEmoji || listData.emoji || "📝"}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleColorPress}
            style={[styles.colorButton, { borderColor: selectedColor || listData.color || "#ccc" }]}
          >
            <View style={styles.colorContainer}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: selectedColor || listData.color || "#ccc" },
                ]}
              />
            </View>
          </Pressable>
        </View>

        <TextInput
          label="Description"
          placeholder="Optional description"
          textAlignVertical="top"
          value={description}
          multiline
          numberOfLines={4}
          onChangeText={handleDescriptionChange}
        />

        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <BudgetInput
            budget={budget}
            onBudgetChange={handleBudgetChange}
            borderColor={selectedColor || listData.color || "#ccc"}
          />
        </View>
      </BodyScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: { padding: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleInputContainer: { flexGrow: 1, flexShrink: 1 },
  emojiButton: { padding: 1, borderWidth: 3, borderRadius: 100, marginTop: 16 },
  emojiContainer: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  colorButton: { marginTop: 16, padding: 1, borderWidth: 3, borderRadius: 100 },
  colorContainer: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  colorPreview: { width: 24, height: 24, borderRadius: 100 },
  budgetSection: { marginVertical: 16, gap: 8 },
  budgetLabel: { fontSize: 16, fontWeight: "500", color: "#666" },
});