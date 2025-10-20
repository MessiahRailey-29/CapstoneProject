import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
            <IconSymbol name="house.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-lists"
        options={{
          title: 'Lists',
          headerTitle: 'Shopping Lists',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="list.bullet.clipboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          headerTitle: 'My Inventory',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="basket.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="product-browser"
        options={{
          title: 'Browse',
          headerTitle: 'Browse Products',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="eye" color={color} size={size} />
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