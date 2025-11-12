import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  // Redirect to main app if signed in
  if (isSignedIn) { 
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
                // Make the large title transparent to match the background
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
    </Stack>
  );
}