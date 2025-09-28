import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-lists"
        options={{
          title: 'Lists',
          headerTitle: 'Shopping Lists',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="clipboard-list" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="product-browser"
        options={{
          title: 'Browse',
          headerTitle: 'Browse Products',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="eye" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}