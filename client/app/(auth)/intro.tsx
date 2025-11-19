import * as React from "react";
import { View, StyleSheet, Image, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function IntroScreen() {
  const router = useRouter();

  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = createStyles(colors);

  return (
    <LinearGradient 
      colors={[colors.background, '#22c55e', '#16a34a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 6 }}
      style={styles.container}
    >
      {/* App Branding */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/waste_me_not_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.subtitle}>
          A Smart Android Mobile Application for Food Wastage Prevention
        </ThemedText>
      </View>

      {/* Main Actions */}
      <View style={styles.actions}>
        <Button style={styles.buttonPrimary} onPress={() => router.push("/(auth)/sign-up")}>
          Create an Account
        </Button>

        <Button style={styles.loginButton} variant="outline" onPress={() => router.push("/(auth)")}>
          Log In
        </Button>
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    header: {
      alignItems: "center",
    },
    logo: {
      width: 350,
      height: 350,
      margin: -25
    },
    subtitle: {
      fontSize: 15,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: -60,
    },
    actions: {
      gap: 16,
    },
    buttonPrimary: {
      backgroundColor: "#22c55e",
    },
    loginButton: {
      borderColor: '#22c55e',
    },
    footer: {
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      opacity: 0.6,
      bottom: 50,
    },
  });
}