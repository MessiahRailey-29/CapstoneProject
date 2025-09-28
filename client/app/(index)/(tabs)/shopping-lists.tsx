import IconCircle from "@/components/IconCircle";
import ShoppingListItem from "@/components/ShoppingListItem";
import {ThemedText} from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { appleBlue, backgroundColors } from "@/constants/Colors";
import { useShoppingListIds } from "@/stores/ShoppingListsStore";
import { Stack, useRouter } from "expo-router";
import {FlatList, Platform, Pressable, StyleSheet, View} from "react-native";

export default function HomeScreen(){
    const router= useRouter();
    const shoppingListIds = useShoppingListIds();

    const renderEmptyList = () => (
        <BodyScrollView contentContainerStyle = {styles.emptyStateContainer}>
            <IconCircle
            emoji="🛒"
            backgroundColor={
                backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
            }
            />
            <Button onPress={() => router.push("/list/new")} variant="ghost">
                Create your first list
            </Button>
        </BodyScrollView>
    )
    
    const renderHeaderRight = ()=>{
        return(
            <Pressable onPress={()=>router.push("/list/new")}>
                <IconSymbol name="plus" color={appleBlue}/>
            </Pressable>
        );
    };

    return(
        <>
        <Stack.Screen options={{
            headerRight: renderHeaderRight,
        }}/>
        <FlatList
        data={shoppingListIds}
        renderItem={({ item: listId}) => <ShoppingListItem listId = {listId}/>}
        contentContainerStyle={styles.listContainer}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={renderEmptyList}
        />
        </>
    );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 8,
  },
  emptyStateContainer: {
    alignItems: "center",
    gap: 8,
    paddingTop: 100,
  },
  headerButton: {
    padding: 8,
    paddingRight: 0,
    marginHorizontal: Platform.select({ web: 16, default: 0 }),
  },
  headerButtonLeft: {
    paddingLeft: 0,
  },
});