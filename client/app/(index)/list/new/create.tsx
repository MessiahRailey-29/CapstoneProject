/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import { Link, Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import TextInput from "@/components/ui/text-input";
import { appleBlue, backgroundColors, emojies } from "@/constants/Colors";
import { useListCreation } from "@/context/ListCreationContext";
import { useAddShoppingListCallback } from "@/stores/ShoppingListsStore";
import DatePickerButton from "@/components/DatePickerButton";
import BudgetInput from "@/components/BudgetInput";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "@/components/ui/CustomAlert";

export default function CreateListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

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

  // Pending product params (when creating a list for a recommended product)
  const pendingProductId = params.pendingProductId
    ? Number(params.pendingProductId)
    : null;
  const pendingProductName = params.pendingProductName as string | undefined;
  const pendingProductPrice = params.pendingProductPrice
    ? Number(params.pendingProductPrice)
    : null;
  const pendingProductStore = params.pendingProductStore as string | undefined;

  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");

  const insets = useSafeAreaInsets();

  // color scheme + styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const styles = createStyles(colors, insets);

  const {
    selectedEmoji,
    setSelectedEmoji,
    selectedColor,
    setSelectedColor,
    selectedDate,
    setSelectedDate,
    budget,
    setBudget,
  } = useListCreation();

  // rename returned callback to a clear name
  const addShoppingList = useAddShoppingListCallback();

  // notifications
  const { user } = useUser();
  const { getToken } = useAuth();
  const { scheduleShoppingReminder } = useNotifications(user?.id || "", getToken);

  const navigateToListWithProduct = (
    listId: string,
    productName: string,
    productId: number,
    price: number,
    store: string
  ) => {
    router.replace({
      pathname: "/list/[listId]",
      params: {
        listId,
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

    return () => {
      setSelectedEmoji("");
      setSelectedColor("");
      setSelectedDate(null);
    };
    // intentionally empty deps to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateList = async () => {
    if (!listName) return;

    const listId = addShoppingList(
      listName,
      listDescription,
      selectedEmoji,
      selectedColor,
      selectedDate,
      budget
    );

    if (!listId) {
      showCustomAlert("Error", "Failed to create list");
      return;
    }

    if (selectedDate) {
      try {
        await scheduleShoppingReminder(listId, selectedDate);
      } catch (error) {
        console.error("Failed to schedule reminder:", error);
      }
    }

    // If there's a pending product, navigate to the list and pass product info so the list page can add it
    setTimeout(() => {
      if (
        pendingProductId &&
        pendingProductName &&
        pendingProductPrice != null &&
        pendingProductStore
      ) {
        navigateToListWithProduct(
          listId,
          pendingProductName,
          pendingProductId,
          pendingProductPrice,
          pendingProductStore
        );
      } else {
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

    const getRandomDate = (index: number) => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 7) + index);
      return date;
    };

    for (let index = 0; index < testListNames.length; index++) {
      const name = testListNames[index];
      const testDate = getRandomDate(index);

      const listId = addShoppingList(
        name,
        `This is a test list for ${name}`,
        testEmojis[index],
        testColors[index],
        testDate
      );

      if (listId && testDate) {
        await scheduleShoppingReminder(listId, testDate);
      }
    }

    router.replace("/");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle: "New List",
        }}
      />

      <BodyScrollView contentContainerStyle={styles.scrollViewContent}>
        {pendingProductName && (
          <View style={styles.pendingProductBanner}>
            <Text style={styles.pendingProductText}>
              Creating list for:{" "}
              <Text style={styles.pendingProductName}>{pendingProductName}</Text>
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Grocery Essentials"
            placeholderTextColor={colors.exposedGhost}
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
            style={[styles.circleButton, { borderColor: selectedColor }]}
          >
            <View style={styles.circleInner}>
              <Text style={styles.emoji}>{selectedEmoji}</Text>
            </View>
          </Link>

          <Link
            href={{ pathname: "/color-picker" }}
            style={[styles.circleButton, { borderColor: selectedColor }]}
          >
            <View style={styles.circleInner}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 100,
                  backgroundColor: selectedColor,
                }}
              />
            </View>
          </Link>
        </View>

        <TextInput
          placeholder="Description (optional)"
          placeholderTextColor={colors.exposedGhost}
          containerStyle={{
            borderWidth: 1,
            borderRadius: 12,
            justifyContent: "flex-start",
          }}
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

        <TouchableOpacity
          onPress={handleCreateList}
          disabled={!listName}
          style={[
            styles.createButton,
            !listName && styles.createButtonDisabled,
          ]}
        >
          <Text style={styles.createButtonText}>
            {pendingProductName ? "Create list and add product" : "Create list"}
          </Text>
        </TouchableOpacity>
      </BodyScrollView>
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
        onClose={() => setCustomAlertVisible(false)}
      />
    </>
  );
}

function createStyles(colors: any, insets: any) {
  return StyleSheet.create({
    scrollViewContent: {
      padding: 16,
      flex: 1,
      backgroundColor: colors.mainBackground,
    },
    pendingProductBanner: {
      backgroundColor: "#E3F2FD",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#007AFF",
    },
    pendingProductText: {
      fontSize: 14,
      color: "#666",
    },
    pendingProductName: {
      fontWeight: "600",
      color: "#007AFF",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    titleInputContainer: {
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
      height: "auto",
      paddingBottom: 2,
    },
    titleInput: {
      fontSize: 28,
      fontWeight: "600",
      height: "auto",
      paddingLeft: 6,
      paddingRight: 6,
      color: colors.text,
    },
    circleButton: {
      borderWidth: 3,
      borderRadius: 100,
      padding: 2,
    },
    circleInner: {
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    emoji: {
      fontSize: 20,
    },
    descriptionInput: {
      paddingLeft: 16,
    },
    createButton: {
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
      alignSelf: "center",
      marginTop: 12,
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonText: {
      alignSelf: "center",
      fontSize: 18,
      fontWeight: "600",
      color: colors.tint,
    },
    colorButton: {
      padding: 1,
      borderWidth: 3,
      borderRadius: 999,
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
      color: colors.text,
    },
    dateLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    budgetSection: {
      marginVertical: 16,
      gap: 8,
    },
    budgetLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
  });
}
