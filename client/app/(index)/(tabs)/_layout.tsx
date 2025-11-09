import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme, View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';


export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const renderTabLabel = (label, focused) => (
    <Text style={{ fontSize: 12, color: focused ? '#000' : '#888' }}>
      {focused ? null : label}
    </Text>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom,
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
          paddingBottom: 10,
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: {
          marginTop: 15
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            marginLeft: 6,
          },
          headerStyle: {
            backgroundColor: "#3daa58ff",
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
              }}
            >
              <IconSymbol
                name="house.fill"
                color={focused ? colors.tabBarActiveBorderColorHome : colors.unfocusedTabBarIcon}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            marginLeft: 6
          },
          headerStyle: {
            backgroundColor: "#60a5fa",
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
              }}
            >
              <IconSymbol
                name="list.bullet.clipboard"
                color={focused ? colors.tabBarActiveBorderColorSL : colors.unfocusedTabBarIcon}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            marginLeft: 6
          },
          headerStyle: {
            backgroundColor: "#eab308",
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
              }}
            >
              <IconSymbol
                name="basket.fill"
                color={focused ? colors.tabBarActiveBorderColorInv : colors.unfocusedTabBarIcon}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            marginLeft: 6
          },
          headerStyle: {
            backgroundColor: "#f87171",
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
              }}
            >
              <IconSymbol
                name="eye"
                color={focused ? colors.tabBarActiveBorderColorBrowse : colors.unfocusedTabBarIcon}
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
          headerTitleStyle: {
            fontWeight: 'bold',
            color: "#000",
            marginLeft: 6
          },
          headerStyle: {
            backgroundColor: "#8b5cf6",
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
              }}
            >
              <IconSymbol
                name="person"
                color={focused ? colors.tabBarActiveBorderColorProfile : colors.unfocusedTabBarIcon}
                size={size}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
