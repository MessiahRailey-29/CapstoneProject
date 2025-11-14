import React, { useMemo, useState } from "react";
import { Href, useGlobalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, useColorScheme, ScrollView, Pressable } from 'react-native';
import { StatusBar } from "expo-status-bar";
// Components
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
// Constants & Utils
import { backgroundColors, emojies } from "@/constants/Colors";
import { useJoinShoppingListCallback } from "@/stores/ShoppingListsStore";
import IconCircle from "@/components/IconCircle";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const isValidUUID = (id: string | null) => {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export default function NewListScreen() {
  const params = useGlobalSearchParams();
  const { listId: listIdParam } = params as { listId: string | undefined };

  const router = useRouter();
  const joinShoppingListCallback = useJoinShoppingListCallback();
  const [listId, setListId] = useState<string | null>(listIdParam);
  const isValidListId = useMemo(() => isValidUUID(listId), [listId]);

  const randomEmoji = useMemo(
    () => emojies[Math.floor(Math.random() * emojies.length)],
    []
  );

  const randomBackgroundColor = useMemo(
    () => backgroundColors[Math.floor(Math.random() * backgroundColors.length)],
    []
  );

  const handleDismissTo = (screen: Href) => {
    if (router.canDismiss()) {
      router.dismiss();
      setTimeout(() => {
        router.push(screen);
      }, 100);
    }
  };

  const handleJoinList = () => {
    if (listId && isValidUUID(listId)) {
      joinShoppingListCallback(listId);

      // dismissTo method is not working due to a bug in react-native-screens
      router.dismiss();
      setTimeout(() => {
        router.push({
          pathname: "/list/[listId]",
          params: { listId },
        });
      }, 100);
    }
  };

  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = createStyles(colors);

  return (
    <LinearGradient
      colors={['#22c55e', '#16a34a', colors.background, colors.background]}
      start={{ x: 1, y: 2 }}
      end={{ x: 3, y: 0 }}
      style={styles.container}
    >
    <BodyScrollView contentContainerStyle={styles.scrollViewContent}>
      <StatusBar style="light" animated />
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <IconCircle
            style={styles.iconCircle}
            size={60}
            emoji={randomEmoji}
            backgroundColor={randomBackgroundColor}
          />
          <ThemedText type="subtitle" style={styles.title}>
            Better Together
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.subtitle}>
            Create shared shopping lists and collaborate in real-time with
            family and friends
          </ThemedText>
        </View>

        <View style={styles.actionSection}>
          <Button onPress={() => handleDismissTo("/list/new/create")}>
            Create new list
          </Button>

          <View style={styles.divider}>
            <View style={styles.line} />
            <ThemedText type="default" style={styles.orText}>
              or join existing
            </ThemedText>
            <View style={styles.line} />
          </View>

          <View style={styles.joinSection}>
            <TextInput
              placeholder="Enter a list code"
              value={listId}
              onChangeText={setListId}
              onSubmitEditing={(e) => {
                joinShoppingListCallback(e.nativeEvent.text);
              }}
              containerStyle={{ marginBottom: 0 }}
            />
            <Button onPress={handleJoinList} disabled={!isValidListId}>
              Join list
            </Button>

            
            <View style={styles.divider}>
            <View style={styles.line} />
            <ThemedText type="default" style={styles.orText}>
              Scan QR
            </ThemedText>
            <View style={styles.line} />
          </View>
            <Pressable onPress={() => handleDismissTo("/list/new/scan")} >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={80}
                color={'#000'}
                style={styles.qrButton}>
              </MaterialCommunityIcons>       
            </Pressable>
          </View>
        </View>
      </View>
    </BodyScrollView>
    </LinearGradient>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  scrollViewContent: {
    marginTop: 45,
    padding: 16,
    marginBottom: 100,
  },
  container: {
    flex: 1,
    gap: 32,
  },
  heroSection: {
    alignItems: "center",
    gap: 16,
    marginTop: 32,
  },
  iconCircle: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "gray",
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  actionSection: {
    gap: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.69)",
  },
  orText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  joinSection: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  textInput: {
    flex: 1,
  },
  qrButton: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 16,
    alignSelf: 'center',
    borderRadius: 12,

  },
  joinButton: {
    marginTop: 8,
  },
  
});
}