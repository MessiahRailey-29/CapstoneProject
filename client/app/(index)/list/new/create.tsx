import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { ThemedText } from '@/components/ThemedText';
import React, { useState } from "react";
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { appleBlue } from '@/constants/Colors';
import TextInput from '@/components/ui/text-input';
import Button from '@/components/ui/button';

export default function NewListScreen(){
    const [listName, setListName] = useState("");
    const [listDescription, setListDescription] = useState("");
    const handleCreateList = ()=>{}
    return(
        <>
        <Stack.Screen
        options={{
            headerTitle: "New list",
            headerLargeTitle: false,
        }}
        />
            <BodyScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.inputContainer}>
                    <TextInput
                    placeholder="Grocery essentials"
                    size="lg"
                    variant="ghost"
                    value={listName}
                    onChangeText={setListName}
                    onSubmitEditing={()=>{handleCreateList}}
                    returnKeyType="done"
                    autoFocus
                    inputStyle={styles.titleInput}
                    containerStyle={styles.titleInputContainer}
                    />
                    <Link href={{
                        pathname: "/",
                    }}
                    style={[styles.emojiButton, {borderColor: "blue"}]}
                    >
                    <View style={styles.emojiContainer}>
                        <Text>{"😊"}</Text>
                    </View>
                    </Link>

                    <Link href={{
                        pathname: "/",  
                    }}
                    style={[styles.emojiButton, {borderColor: "blue"}]}
                    >
                    <View style={styles.colorContainer}>
                        <View
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 100,
                            backgroundColor: "blue",
                        }}
                        />
                    </View>
                    </Link>
                </View>
                <TextInput
                placeholder="description: optional"
                value={listDescription}
                onChangeText={setListDescription}
                onSubmitEditing={handleCreateList}
                returnKeyType="done"
                variant="ghost"
                inputStyle={styles.descriptionInput}
                />
                <Button
                onPress={handleCreateList}
                disabled={!listName}
                variant='ghost'
                >
                Create list
                </Button>
            </BodyScrollView>
        </>
    )
}

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleInput: {
    fontWeight: "600",
    fontSize: 28,
    padding: 0,
  },
  titleInputContainer: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: "auto",
    marginBottom: 0,
  },
  emojiButton: {
    padding: 1,
    borderWidth: 3,
    borderRadius: 100,
  },
  emojiContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: {
    padding: 0,
  },
  colorButton: {
    padding: 1,
    borderWidth: 3,
    borderRadius: 100,
  },
  colorContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});