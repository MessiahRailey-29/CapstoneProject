import * as React from "react";
import { ThemedText } from "@/components/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList } from "react-native";

export default function ListScreen() {
    const router = useRouter();
    const { listId } = useLocalSearchParams() as {listId: string};

    return (
        <>
        <FlatList
        data = {[listId]}
        renderItem={({ item }) => <ThemedText>{item}</ThemedText>}
        />
        </>
    )
}