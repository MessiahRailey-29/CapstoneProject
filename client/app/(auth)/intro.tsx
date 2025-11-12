import * as React from "react";
import { View, StyleSheet, Pressable, Image, useColorScheme, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  checkBiometricCapability,
  biometricLogin,
  getBiometricTypeName,
} from "@/utils/biometricAuth";
import { useSignIn } from "@clerk/clerk-expo";
import { isClerkAPIResponseError } from "@clerk/clerk-expo";
import { recordLoginAttempt, updateLastActivity } from '@/utils/securityUtils';
import { Colors } from "@/constants/Colors";
import wasteMeNotLogo from "@/assets/images/waste_me_not_logo.png";
import { LinearGradient } from "expo-linear-gradient";

export default function IntroScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState<string>("none");
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  //color scheme and styles
      const scheme = useColorScheme();
      const colors = Colors[scheme ?? 'light'];
      const styles = createStyles(colors);


  React.useEffect(() => {
    (async () => {
      const result = await checkBiometricCapability();
      setBiometricAvailable(result.isAvailable);
      setBiometricType(result.biometricType);
    })();
  }, []);

  const handleBiometricSignIn = async () => {
    if (!isLoaded) return;
    
    setIsAuthenticating(true);
    try {
      const result = await biometricLogin();
      
      if (!result.success) {
        Alert.alert('Authentication Failed', result.error || 'Biometric authentication failed');
        return;
      }

      // Use retrieved credentials to sign in with Clerk
      const signInAttempt = await signIn.create({
        identifier: result.email!,
        password: result.password!,
      });

      if (signInAttempt.status === "complete") {
        await recordLoginAttempt(result.email!, true);
        await updateLastActivity();
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(index)/(tabs)");
      } else {
        Alert.alert('Sign In Failed', 'Please try signing in with your password.');
      }
    } catch (e) {
      console.error("Biometric login error:", e);
      if (isClerkAPIResponseError(e)) {
        Alert.alert('Sign In Failed', 'Invalid credentials. Please try signing in with your password.');
      } else {
        Alert.alert('Error', 'Biometric authentication failed. Try again or log in manually.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <LinearGradient 
    colors={[colors.background, '#22c55e', '#16a34a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 6 }}
    style={styles.container}>
      {/* App Branding */}
      <View style={styles.header}>
        <Image
          source={wasteMeNotLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.subtitle}>
          Smart Android Mobile Application for Food Wastage Prevention
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

        {biometricAvailable && (
          <Pressable
            style={[styles.biometricButton, isAuthenticating && { opacity: 0.6 }]}
            onPress={handleBiometricSignIn}
            disabled={isAuthenticating}
          >
            <IconSymbol
              name={biometricType === "face" ? "person" : "hand.raised"}
              size={32}
              color="#3B82F6"
            />
            <ThemedText style={styles.biometricText}>
              Sign in with {getBiometricTypeName(biometricType)}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          🔒 Your data is secure and encrypted
        </ThemedText>
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
    width: 250,
    height: 250,
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
  biometricButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 12,
    padding: 14,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 12,
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