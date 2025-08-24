import * as React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList } from "react-native";

export default function ListScreen() {
    const router = useRouter();
    const { listId } = useLocalSearchParams() as {listId: string};

    return (
        <>
        <Stack.Screen
        options={{}}
        />
        <FlatList
        data = {[listId]}
        renderItem={({ item }) => <ThemedText>{item}</ThemedText>}
        contentInsetAdjustmentBehavior="automatic"
        />
        </>
    )
}