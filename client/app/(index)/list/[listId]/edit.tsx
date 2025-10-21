import React, { useEffect, useState, useRef } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import BudgetInput from "@/components/BudgetInput";
import DatePickerButton from "@/components/DatePickerButton";
import { useListCreation } from "@/context/ListCreationContext";
import { useShoppingListValue } from "@/stores/ShoppingListStore";
import { StatusBar } from "expo-status-bar";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser } from "@clerk/clerk-expo";

export default function EditScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };

  // 🔔 Get notification functions
  const { user } = useUser();
  const { scheduleShoppingReminder, cancelShoppingReminder } = useNotifications(user?.id || '');

  // ✅ Use ShoppingListStore directly instead of valuesCopy
  const [storeName, setStoreName] = useShoppingListValue(listId, "name");
  const [storeDescription, setStoreDescription] = useShoppingListValue(listId, "description");
  const [storeEmoji, setStoreEmoji] = useShoppingListValue(listId, "emoji");
  const [storeColor, setStoreColor] = useShoppingListValue(listId, "color");
  const [storeBudget, setStoreBudget] = useShoppingListValue(listId, "budget");
  const [storeShoppingDate, setStoreShoppingDate] = useShoppingListValue(listId, "shoppingDate");

  // Local state for editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);
  const [emoji, setEmoji] = useState("🛒");
  const [color, setColor] = useState("#007AFF");
  const [shoppingDate, setShoppingDate] = useState<Date | null>(null);
  const [originalDate, setOriginalDate] = useState<Date | null>(null); // Track original date

  // List creation context for emoji/color/date pickers
  const { 
    selectedEmoji, 
    selectedColor, 
    selectedDate,
    setSelectedColor, 
    setSelectedEmoji,
    setSelectedDate 
  } = useListCreation();

  const initializedRef = useRef(false);

  // ✅ Initialize from store values once
  useEffect(() => {
    if (!initializedRef.current && storeName) {
      setName(storeName);
      setDescription(storeDescription || "");
      setBudget(storeBudget || 0);
      setEmoji(storeEmoji || "🛒");
      setColor(storeColor || "#007AFF");
      
      // Parse and set shopping date
      if (storeShoppingDate) {
        try {
          const parsedDate = new Date(storeShoppingDate);
          if (!isNaN(parsedDate.getTime())) {
            setShoppingDate(parsedDate);
            setOriginalDate(parsedDate); // Store original date for comparison
            setSelectedDate(parsedDate);
          }
        } catch (error) {
          console.error('Error parsing shopping date:', error);
        }
      }
      
      setSelectedEmoji(storeEmoji || "🛒");
      setSelectedColor(storeColor || "#007AFF");
      
      initializedRef.current = true;
      console.log('✅ Initialized edit screen with date:', storeShoppingDate);
    }
  }, [storeName, storeDescription, storeBudget, storeEmoji, storeColor, storeShoppingDate]);

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

  // ✅ Update date when picker changes
  useEffect(() => {
    if (initializedRef.current && selectedDate !== shoppingDate) {
      setShoppingDate(selectedDate);
    }
  }, [selectedDate]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedEmoji("");
      setSelectedColor("");
      setSelectedDate(null);
      initializedRef.current = false;
    };
  }, []);

  const handleSave = async () => {
    console.log('💾 Saving to store:', { 
      name, 
      description, 
      budget, 
      emoji, 
      color,
      shoppingDate: shoppingDate?.toISOString() || null,
      originalDate: originalDate?.toISOString() || null
    });
    
    // Save directly to ShoppingListStore
    setStoreName(name);
    setStoreDescription(description);
    setStoreBudget(budget);
    setStoreEmoji(emoji);
    setStoreColor(color);
    setStoreShoppingDate(shoppingDate?.toISOString() || "");
    
    // 🔔 Handle notification rescheduling if date changed
    const dateChanged = originalDate?.getTime() !== shoppingDate?.getTime();
    
    console.log('🔔 Date comparison:', {
      dateChanged,
      originalTime: originalDate?.getTime(),
      newTime: shoppingDate?.getTime()
    });
    
    if (dateChanged) {
      try {
        console.log('🔔 Date has changed, updating reminders...');
        
        // Schedule new reminder if new date exists
        // The backend should handle replacing/updating existing reminders for the same listId
        if (shoppingDate) {
          // Validate that the date is not in the past (compare dates only, not time)
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const selectedDay = new Date(shoppingDate.getFullYear(), shoppingDate.getMonth(), shoppingDate.getDate());
          
          if (selectedDay < today) {
            console.warn('⚠️ Cannot schedule reminder for past date');
            Alert.alert(
              'Invalid Date',
              'Cannot set a reminder for a date in the past. Please choose today or a future date.',
              [{ text: 'OK' }]
            );
            // Don't return - still save the list, just don't schedule reminder
          } else {
            // Date is valid (today or future), schedule the reminder
            const reminderScheduled = await scheduleShoppingReminder(listId, shoppingDate);
            if (reminderScheduled) {
              console.log('🔔 Shopping reminder scheduled (not sent) for', shoppingDate);
              
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              if (selectedDay.getTime() === today.getTime()) {
                Alert.alert(
                  '🔔 Reminder Set',
                  `Your shopping reminder for "${name}" has been set for later today.`,
                  [{ text: 'OK' }]
                );
              } else if (selectedDay.getTime() === tomorrow.getTime()) {
                Alert.alert(
                  '🔔 Reminder Set',
                  `Your shopping reminder for "${name}" has been set for tomorrow.`,
                  [{ text: 'OK' }]
                );
              } else {
                // Show generic confirmation for other dates
                const dateStr = shoppingDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: shoppingDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
                Alert.alert(
                  '🔔 Reminder Set',
                  `Your shopping reminder for "${name}" has been scheduled for ${dateStr}.`,
                  [{ text: 'OK' }]
                );
              }
            }
          }
        } else if (originalDate) {
          // Date was removed - try to cancel the reminder
          try {
            await cancelShoppingReminder(listId);
            console.log('🔔 Shopping date removed, reminder cancelled');
          } catch (error) {
            console.warn('⚠️ Could not cancel reminder (endpoint may not exist):', error);
          }
          
          Alert.alert(
            'Reminder Removed',
            'Shopping date has been cleared. You won\'t receive a reminder for this list.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('❌ Failed to update reminder:', error);
        Alert.alert(
          'Warning',
          'List saved, but there was an issue updating the reminder.',
          [{ text: 'OK' }]
        );
      }
    } else {
      console.log('🔔 Date unchanged, no reminder updates needed');
    }
    
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

  const handleDateChange = (date: Date | null) => {
    setShoppingDate(date);
    setSelectedDate(date);
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

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>When do you plan to shop?</Text>
          <DatePickerButton
            selectedDate={shoppingDate}
            onDateChange={handleDateChange}
            borderColor={color}
          />
        </View>

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
  dateSection: { marginVertical: 16, gap: 8 },
  dateLabel: { fontSize: 16, fontWeight: "500", color: "#666" },
  budgetSection: { marginVertical: 16, gap: 8 },
  budgetLabel: { fontSize: 16, fontWeight: "500", color: "#666" },
});