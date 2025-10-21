import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme, View } from 'react-native';
import { Colors } from '@/constants/Colors';


export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 10,
          marginHorizontal: 15,
          height: 70,
          left: 20,
          right: 20,
          alignItems: 'center',
          elevation: 5,
          backgroundColor: colors.tabBarBackgroundColor,
          borderRadius: 45,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: {
          marginTop: 15
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 5,
          marginBottom: 5,
        },
        tabBarActiveTintColor: colors.tabBarActiveTintColor,
        tabBarInactiveTintColor: colors.tabBarInactiveTintColor,
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
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColor : 'transparent',
                width: size + 25,
                height: size + 25,
                marginTop: 0,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol
                name="house.fill"
                color={color}
                size={size}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-lists"
        options={{
          title: 'Lists',
          headerTitle: 'Shopping Lists',
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColor : 'transparent',
                width: size + 25,
                height: size + 25,
                marginTop: 0,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol
                name="list.bullet.clipboard"
                color={color}
                size={size}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          headerTitle: 'My Inventory',
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColor : 'transparent',
                width: size + 25,
                height: size + 25,
                marginTop: 0,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol
                name="basket.fill"
                color={color}
                size={size}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="product-browser"
        options={{
          title: 'Browse',
          headerTitle: 'Browse Products',
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColor : 'transparent',
                width: size + 25,
                height: size + 25,
                marginTop: 0,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol
                name="eye"
                color={color}
                size={size}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColor : 'transparent',
                width: size + 25,
                height: size + 25,
                marginTop: 0,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol
                name="person"
                color={color}
                size={size}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
