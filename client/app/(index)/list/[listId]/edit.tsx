import React, { useEffect, useState, useRef } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Alert, useColorScheme } from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import BudgetInput from "@/components/BudgetInput";
import DatePickerButton from "@/components/DatePickerButton";
import { useListCreation } from "@/context/ListCreationContext";
import { useShoppingListValue } from "@/stores/ShoppingListStore";
import { StatusBar } from "expo-status-bar";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Colors } from "@/constants/Colors";
import { useShoppingListData } from "@/stores/ShoppingListsStore";
import CustomAlert from "@/components/ui/CustomAlert";

export default function EditScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };

  // 🔔 Get notification functions
  const { user } = useUser();
  const { getToken } = useAuth();
  const { scheduleShoppingReminder, cancelShoppingReminder } = useNotifications(user?.id || '', getToken);


  //color schemes and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  // ✅ Use ShoppingListStore directly instead of valuesCopy
  const listData = useShoppingListData(listId);
  const [storeName, setStoreName] = useShoppingListValue(listId, "name");
  const [storeDescription, setStoreDescription] = useShoppingListValue(listId, "description");
  const [storeEmoji, setStoreEmoji] = useShoppingListValue(listId, "emoji");
  const [storeColor, setStoreColor] = useShoppingListValue(listId, "color");
  const [storeBudget, setStoreBudget] = useShoppingListValue(listId, "budget");
  const [storeShoppingDate, setStoreShoppingDate] = useShoppingListValue(listId, "shoppingDate");
  const [storeStatus] = useShoppingListValue(listId, "status");

  // Check if this list is in history (completed)
  const isHistory = storeStatus === 'completed';

  // Local state for editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);
  const [emoji, setEmoji] = useState("🛒");
  const [color, setColor] = useState("#007AFF");
  const [shoppingDate, setShoppingDate] = useState<Date | null>(null);
  const [originalDate, setOriginalDate] = useState<Date | null>(null); // Track original date

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);

  const showCustomAlert = (title: string, message: string, buttons?: any[]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(
      buttons || [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
    );
    setCustomAlertVisible(true);
  };

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

    // 🔥 NEW: Track what changed for notification
    const changes = [];
    if (storeName !== name) changes.push('name');
    if (storeDescription !== description) changes.push('description');
    if (storeEmoji !== emoji) changes.push('emoji');
    if (storeColor !== color) changes.push('color');
    if (storeBudget !== budget) changes.push('budget');
    if ((storeShoppingDate || '') !== (shoppingDate?.toISOString() || '')) changes.push('shopping date');

    const hasChanges = changes.length > 0;

    // Save directly to ShoppingListStore
    setStoreName(name);
    setStoreDescription(description);
    setStoreBudget(budget);
    setStoreEmoji(emoji);
    setStoreColor(color);
    setStoreShoppingDate(shoppingDate?.toISOString() || "");

    // Handle notification rescheduling if date changed
    const dateChanged = originalDate?.getTime() !== shoppingDate?.getTime();

    console.log('🔔 Date comparison:', {
      dateChanged,
      originalTime: originalDate?.getTime(),
      newTime: shoppingDate?.getTime()
    });

    if (dateChanged) {
      try {
        console.log('🔔 Date has changed, updating reminders...');

        if (shoppingDate) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const selectedDay = new Date(shoppingDate.getFullYear(), shoppingDate.getMonth(), shoppingDate.getDate());

          if (selectedDay < today) {
            console.warn('⚠️ Cannot schedule reminder for past date');
            showCustomAlert(
              'Invalid Date',
              'Cannot set a reminder for a date in the past. Please choose today or a future date.',
              [{ text: 'OK' }]
            );
          } else {
            const reminderScheduled = await scheduleShoppingReminder(listId, shoppingDate, name, emoji);
            if (reminderScheduled) {
              console.log('🔔 Shopping reminder scheduled (not sent) for', shoppingDate);

              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);

              if (selectedDay.getTime() === today.getTime()) {
                showCustomAlert(
                  '🔔 Reminder Set',
                  `Your shopping reminder for "${name}" has been set for later today.`,
                  [{ text: 'OK' }]
                );
              } else if (selectedDay.getTime() === tomorrow.getTime()) {
                showCustomAlert(
                  '🔔 Reminder Set',
                  `Your shopping reminder for "${name}" has been set for tomorrow.`,
                  [{ text: 'OK' }]
                );
              } else {
                const dateStr = shoppingDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: shoppingDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
                showCustomAlert(
                  '🔔 Reminder Set',
                  `Your shopping reminder for "${name}" has been scheduled for ${dateStr}.`,
                  [{ text: 'OK' }]
                );
              }
            }
          }
        } else if (originalDate) {
          try {
            await cancelShoppingReminder(listId);
            console.log('🔔 Shopping date removed, reminder cancelled');
          } catch (error) {
            console.warn('⚠️ Could not cancel reminder (endpoint may not exist):', error);
          }

          showCustomAlert(
            'Reminder Removed',
            'Shopping date has been cleared. You won\'t receive a reminder for this list.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('❌ Failed to update reminder:', error);
        showCustomAlert(
          'Warning',
          'List saved, but there was an issue updating the reminder.',
          [{ text: 'OK' }]
        );
      }
    } else {
      console.log('🔔 Date unchanged, no reminder updates needed');
    }

    // 🔥 NEW: Notify collaborators if this is a shared list and something changed
    if (hasChanges && listData?.collaborators && listData.collaborators.length > 0) {
      try {
        // Dynamically import to avoid circular dependencies
        const { notifyCollaborators } = await import('@/utils/notifyCollaborators');

        await notifyCollaborators({
          listId,
          listName: name,
          emoji: emoji,
          action: 'updated_list',
          itemName: changes.join(', '), // e.g., "name, emoji, budget"
          currentUserId: user?.id || '',
          currentUserName: user?.firstName || user?.username || 'Someone',
          collaborators: listData.collaborators,
        });

        console.log('✅ Notified collaborators about list update:', changes);
      } catch (error) {
        console.error('❌ Failed to notify collaborators:', error);
        // Don't show error to user - list was still saved successfully
      }
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
            <Button
              variant="ghost"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
          ),
          headerRight: () => (
            <Button
              variant="ghost"
              onPress={handleSave}
              disabled={isHistory}
              style={isHistory && { opacity: 0.3 }}
            >
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
            editable={!isHistory}
          />
          <Pressable
            onPress={handleEmojiPress}
            style={[styles.emojiButton, { borderColor: color }]}
            disabled={isHistory}
          >
            <View style={[styles.emojiContainer, isHistory && { opacity: 0.5 }]}>
              <Text>{emoji}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleColorPress}
            style={[styles.colorButton, { borderColor: color }]}
            disabled={isHistory}
          >
            <View style={[styles.colorContainer, isHistory && { opacity: 0.5 }]}>
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
          editable={!isHistory}
        />

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>When do you plan to shop?</Text>
          <View pointerEvents={isHistory ? 'none' : 'auto'} style={isHistory && { opacity: 0.5 }}>
            <DatePickerButton
              selectedDate={shoppingDate}
              onDateChange={handleDateChange}
              borderColor={color}
            />
          </View>
        </View>

        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <View pointerEvents={isHistory ? 'none' : 'auto'} style={isHistory && { opacity: 0.5 }}>
            <BudgetInput
              budget={budget}
              onBudgetChange={setBudget}
              borderColor={color}
            />
          </View>
        </View>
        <CustomAlert
          visible={customAlertVisible}
          title={customAlertTitle}
          message={customAlertMessage}
          buttons={customAlertButtons}
          onClose={() => setCustomAlertVisible(false)}
        />
      </BodyScrollView>
    </>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    scrollViewContent: { padding: 16 },
    inputContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
    titleInputContainer: { flexGrow: 1, flexShrink: 1 },
    emojiButton: { padding: 1, borderWidth: 3, borderRadius: 100, marginTop: 16 },
    emojiContainer: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
    colorButton: { marginTop: 16, padding: 1, borderWidth: 3, borderRadius: 100 },
    colorContainer: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
    colorPreview: { width: 24, height: 24, borderRadius: 100 },
    dateSection: { marginVertical: 16, gap: 8 },
    dateLabel: { fontSize: 16, fontWeight: "500", color: colors.exposedGhost },
    budgetSection: { marginVertical: 16, gap: 8 },
    budgetLabel: { fontSize: 16, fontWeight: "500", color: colors.exposedGhost },
  });
}