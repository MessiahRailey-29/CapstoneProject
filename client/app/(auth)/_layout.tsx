import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TERMS_ACCEPTED_PREFIX = '@terms_accepted_';

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [termsAccepted, setTermsAccepted] = React.useState<boolean | null>(null);
  const [isCheckingTerms, setIsCheckingTerms] = React.useState(true);

  // Check if user has accepted terms - now user-specific
  React.useEffect(() => {
    const checkTermsAcceptance = async () => {
      try {
        if (!userId) {
          setTermsAccepted(false);
          return;
        }
        
        // Use userId to create a unique key for each user
        const userTermsKey = `${TERMS_ACCEPTED_PREFIX}${userId}`;
        const accepted = await AsyncStorage.getItem(userTermsKey);
        setTermsAccepted(accepted === 'true');
      } catch (error) {
        console.error('Error checking terms acceptance:', error);
        setTermsAccepted(false);
      } finally {
        setIsCheckingTerms(false);
      }
    };

    if (isLoaded && isSignedIn) {
      checkTermsAcceptance();
    } else {
      setIsCheckingTerms(false);
    }
  }, [isLoaded, isSignedIn, userId]);

  // Show nothing while checking auth or terms
  if (!isLoaded || isCheckingTerms) return null;

  // If signed in and terms accepted, redirect to main app
  if (isSignedIn && termsAccepted) { 
    return <Redirect href="/(index)/(tabs)" />; 
  }

  // Show intro screen first when signed out
  return (
    <Stack
      initialRouteName="intro"
      screenOptions={{
        ...(process.env.EXPO_OS !== "ios"
          ? {}
          : {
              headerLargeTitle: true,
              headerTransparent: true,
              headerBlurEffect: "systemChromeMaterial",
              headerLargeTitleShadowVisible: false,
              headerShadowVisible: true,
              headerLargeStyle: {
                backgroundColor: "transparent",
              },
            }),
      }}
    >
      <Stack.Screen
        name="intro"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="index"
        options={{ headerTitle: '' }}
      />
      <Stack.Screen 
        name="sign-up" 
        options={{ headerTitle: "Sign up" }} 
      />
      <Stack.Screen
        name="reset-password"
        options={{ headerTitle: "Reset password" }}
      />
      <Stack.Screen
        name="terms-acceptance"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}