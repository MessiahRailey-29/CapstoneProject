import { Tabs, useRouter, useSegments } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme, View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

const TABS = ['index', 'shopping-lists', 'inventory', 'product-browser', 'profile'];

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

const createGradientHeader = (gradientColors) => {
    const GradientHeaderComponent = () => (
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}
      />
    );
    GradientHeaderComponent.displayName = 'GradientHeader';
    return GradientHeaderComponent;
  };

  const renderTabLabel = (label: string, focused: boolean) => (
    <Text style={{ fontSize: 12, color: focused ? '#000' : '#888' }}>
      {focused ? null : label}
    </Text>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 20,
          marginHorizontal: 15,
          height: 70,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: colors.tabBarBackgroundColor,
          borderRadius: 45,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          paddingBottom: 5,
        },
        tabBarItemStyle: {
          marginTop: 12,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            zIndex: 1,
          },
          headerBackground: createGradientHeader(['#22c55e', '#16a34a']),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          tabBarLabel: ({ focused }) => renderTabLabel("Home", focused),
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColorHome : 'transparent',
                width: size + 25,
                height: size + 25,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: focused ? colors.tabBarActiveBorderColorHome : 'transparent',
                borderWidth: focused ? 2 : 0,
                marginTop: focused ? 5 : -5,
              }}
            >
              <IconSymbol
                name="house.fill"
                color={focused ? colors.tabBarActiveBorderColorHome : colors.unfocusedTabBarIcon}
                size={focused ? size + 7 : size}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            zIndex: 1,
          },
          headerBackground: createGradientHeader(['#3b82f6', '#1d4ed8']),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          tabBarLabel: ({ focused }) => renderTabLabel("Lists", focused),
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColorSL : 'transparent',
                width: size + 25,
                height: size + 25,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: focused ? colors.tabBarActiveBorderColorSL : 'transparent',
                borderWidth: focused ? 2 : 0,
                marginTop: focused ? 5 : -5,
              }}
            >
              <IconSymbol
                name="list.bullet.clipboard"
                color={focused ? colors.tabBarActiveBorderColorSL : colors.unfocusedTabBarIcon}
                size={focused ? size + 6 : size}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            zIndex: 1,
          },
          headerBackground: createGradientHeader(['#facc15', '#eab308']),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          tabBarLabel: ({ focused }) => renderTabLabel("Inventory", focused),
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColorInv : 'transparent',
                width: size + 25,
                height: size + 25,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: focused ? colors.tabBarActiveBorderColorInv : 'transparent',
                borderWidth: focused ? 2 : 0,
                marginTop: focused ? 5 : -5,
              }}
            >
              <IconSymbol
                name="basket.fill"
                color={focused ? colors.tabBarActiveBorderColorInv : colors.unfocusedTabBarIcon}
                size={focused ? size + 6 : size}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            zIndex: 1,
          },
          headerBackground: createGradientHeader(['#f87171', '#dc2626']),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          tabBarLabel: ({ focused }) => renderTabLabel("Browse", focused),
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColorBrowse : 'transparent',
                width: size + 25,
                height: size + 25,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: focused ? colors.tabBarActiveBorderColorBrowse : 'transparent',
                borderWidth: focused ? 2 : 0,
                marginTop: focused ? 5 : -5,
              }}
            >
              <IconSymbol
                name="eye"
                color={focused ? colors.tabBarActiveBorderColorBrowse : colors.unfocusedTabBarIcon}
                size={focused ? size + 6 : size}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            zIndex: 1,
          },
          headerBackground: createGradientHeader(['#8b5cf6ff', '#7c3aedff']),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          tabBarLabel: ({ focused }) => renderTabLabel("Profile", focused),
          tabBarIcon: ({ color, focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.tabBarActiveBackgroundColorProfile : 'transparent',
                width: size + 25,
                height: size + 25,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: focused ? colors.tabBarActiveBorderColorProfile : 'transparent',
                borderWidth: focused ? 2 : 0,
                marginTop: focused ? 5 : -5,
              }}
            >
              <IconSymbol
                name="person"
                color={focused ? colors.tabBarActiveBorderColorProfile : colors.unfocusedTabBarIcon}
                size={focused ? size + 6 : size}
              />
            </View>
          ),
        }}
      />
    </Tabs>
    </GestureHandlerRootView>
  );
}