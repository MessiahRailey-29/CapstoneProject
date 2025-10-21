import { Button } from "@/components/ui/button";
import { ListCreationProvider } from "@/context/ListCreationContext";
import ShoppingListsStore from "@/stores/ShoppingListsStore";
import InventoryStore from "@/stores/InventoryStore";
import { useUser } from "@clerk/clerk-expo";
import { Redirect, Stack, useRouter } from "expo-router";
import { Provider as TinyBaseProvider } from 'tinybase/ui-react';
import { IconSymbol } from "@/components/ui/IconSymbol";
import { NotificationBell } from "@/components/NotificationBell";
import PurchaseHistoryStore from "@/stores/PurchaseHistoryStore";

export default function HomeRoutesLayout(){
  const router = useRouter();
  const {user} = useUser();

  if (!user){
    return <Redirect href={"/(auth)"}/>  
  }
  
  return(
    <TinyBaseProvider>
      <ShoppingListsStore />
      <InventoryStore />
      <PurchaseHistoryStore /> 
      <ListCreationProvider>
        <Stack
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
          {/* Main Tab Navigator */}
          <Stack.Screen 
            name="(tabs)" 
            options={{
              headerShown: false
            }}
          />
          
          {/* Modal screens that appear over tabs */}
          <Stack.Screen name="list/new/index"
            options={{
              presentation: 'modal',
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen name="list/new/scan"
            options={{
              presentation: 'modal',
              headerLargeTitle: false,
              headerTitle: "Scan QR code",
              headerLeft: () => (
                <Button variant="ghost" onPress={()=> router.back()}>
                  Cancel
                </Button>
              ),
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="emoji-picker"
            options={{
              presentation: "modal",
              headerLargeTitle: false,
              headerTitle: "Choose an emoji",
              sheetAllowedDetents: [0.5, 0.75, 1],
              sheetGrabberVisible: true,
            }}
          />
          <Stack.Screen
            name="color-picker"
            options={{
              presentation: "modal",
              headerLargeTitle: false,
              headerTitle: "Choose a color",
              sheetAllowedDetents: [0.5, 0.75, 1],
              sheetGrabberVisible: true,
            }}
          />
          <Stack.Screen
            name="list/[listId]/product/new"
            options={{
              presentation: "modal",
              sheetAllowedDetents: [0.8, 1],
              sheetGrabberVisible: true,
              headerLargeTitle: false,
              headerTitle: "Add product",
            }}
          />
          <Stack.Screen
            name="list/[listId]/edit"
            options={{
              presentation: "modal",
              sheetAllowedDetents: [0.8, 1],
              sheetGrabberVisible: true,
              headerLargeTitle: false,
              headerTitle: "Edit",
            }}
          />
          <Stack.Screen
            name="list/[listId]/share"
            options={{
              presentation: "modal",
              sheetGrabberVisible: true,
              headerLargeTitle: false,
              headerTitle: "Share",
            }}
          />
          <Stack.Screen
            name="list/[listId]/product/[productId]"
            options={{
              presentation: "modal",
              sheetAllowedDetents: [0.75, 1],
              sheetGrabberVisible: true,
              headerLargeTitle: false,
              headerTitle: "Details",
            }}
          />
          <Stack.Screen 
            name="product-detail" 
            options={{
              presentation: "modal",
              headerLargeTitle: false,
              headerTitle: "Product Details",
              sheetAllowedDetents: [0.8, 1],
              sheetGrabberVisible: true,
            }} 
          />
          <Stack.Screen
            name="list/[listId]/duplicate-check"
            options={{
              presentation: "modal",
              headerLargeTitle: false,
              headerTitle: "Check Duplicates",
              sheetAllowedDetents: [0.9, 1],
              sheetGrabberVisible: true,
            }}
          />
          <Stack.Screen
            name="list/[listId]/index"
            options={{
              headerTitle: "",
              headerLargeTitle: false,
            }}
          />
            <Stack.Screen
            name="list/[listId]/shopping-guide"
            options={{
              presentation: "modal",
              headerLargeTitle: false,
              headerTitle: "Shopping Guide",
              sheetAllowedDetents: [0.9, 1],
              sheetGrabberVisible: true,
            }}
          />
          <Stack.Screen
          name="category-products"
          options={{
            presentation: "card",
            headerLargeTitle: false,
          }}
        />
          <Stack.Screen
          options={{
            headerTitle: 'Home',
            headerLargeTitle: true,
            headerRight: () => <NotificationBell />,
          }}
        />
        </Stack>
      </ListCreationProvider>
    </TinyBaseProvider>
  )
}