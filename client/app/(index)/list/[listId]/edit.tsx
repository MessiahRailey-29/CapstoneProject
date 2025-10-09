import React, { useEffect, useState, useRef } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import BudgetInput from "@/components/BudgetInput";
import { useListCreation } from "@/context/ListCreationContext";
import { useShoppingListValue } from "@/stores/ShoppingListStore";
import { StatusBar } from "expo-status-bar";

export default function EditScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };

  // ✅ Use ShoppingListStore directly instead of valuesCopy
  const [storeName, setStoreName] = useShoppingListValue(listId, "name");
  const [storeDescription, setStoreDescription] = useShoppingListValue(listId, "description");
  const [storeEmoji, setStoreEmoji] = useShoppingListValue(listId, "emoji");
  const [storeColor, setStoreColor] = useShoppingListValue(listId, "color");
  const [storeBudget, setStoreBudget] = useShoppingListValue(listId, "budget");

  // Local state for editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);
  const [emoji, setEmoji] = useState("🛒");
  const [color, setColor] = useState("#007AFF");

  // List creation context for emoji/color pickers
  const { selectedEmoji, selectedColor, setSelectedColor, setSelectedEmoji } = useListCreation();

  const initializedRef = useRef(false);

  // ✅ Initialize from store values once
  useEffect(() => {
    if (!initializedRef.current && storeName) {
      setName(storeName);
      setDescription(storeDescription || "");
      setBudget(storeBudget || 0);
      setEmoji(storeEmoji || "🛒");
      setColor(storeColor || "#007AFF");
      
      setSelectedEmoji(storeEmoji || "🛒");
      setSelectedColor(storeColor || "#007AFF");
      
      initializedRef.current = true;
      console.log('✅ Initialized edit screen');
    }
  }, [storeName, storeDescription, storeBudget, storeEmoji, storeColor]);

  // ✅ Update emoji when picker changes
  useEffect(() => {
    if (initializedRef.current && selectedEmoji && selectedEmoji !== emoji) {
      setEmoji(selectedEmoji);
    }
  }, [selectedEmoji]);

  // ✅ Update color when picker changes
  useEffect(() => {
    if (initializedRef.current && selectedColor && selectedColor !== color) {
      setColor(selectedColor);
    }
  }, [selectedColor]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedEmoji("");
      setSelectedColor("");
      initializedRef.current = false;
    };
  }, []);

  const handleSave = () => {
    console.log('💾 Saving to store:', { name, description, budget, emoji, color });
    
    // Save directly to ShoppingListStore
    setStoreName(name);
    setStoreDescription(description);
    setStoreBudget(budget);
    setStoreEmoji(emoji);
    setStoreColor(color);
    
    // Small delay to ensure save completes
    setTimeout(() => {
      router.back();
    }, 100);
  };

  const handleEmojiPress = () => {
    router.push("/emoji-picker");
  };

  const handleColorPress = () => {
    router.push("/color-picker");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button variant="ghost" onPress={handleSave}>
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
            onChangeText={setName}
            returnKeyType="done"
            containerStyle={styles.titleInputContainer}
          />
          <Pressable
            onPress={handleEmojiPress}
            style={[styles.emojiButton, { borderColor: color }]}
          >
            <View style={styles.emojiContainer}>
              <Text>{emoji}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleColorPress}
            style={[styles.colorButton, { borderColor: color }]}
          >
            <View style={styles.colorContainer}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: color },
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
          onChangeText={setDescription}
        />

        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <BudgetInput
            budget={budget}
            onBudgetChange={setBudget}
            borderColor={color}
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