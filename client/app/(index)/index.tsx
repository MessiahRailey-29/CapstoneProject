import {ThemedText} from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { appleBlue } from "@/constants/Colors";
import { useClerk } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import {Pressable, View} from "react-native";

export default function HomeScreen(){
    const router= useRouter();
    const {signOut} = useClerk();
    
    const renderHeaderRight = ()=>{
        return(
            <Pressable onPress={()=>router.push("/list/new")}>
            <IconSymbol name = "plus" color={appleBlue}/>
        </Pressable>
        );
    };

    const renderHeaderLeft = ()=>{
        return(
            <Pressable onPress={()=>router.push("/profile")}>
            <IconSymbol name = "gear" color={appleBlue}/>
        </Pressable>
        );
    };

    return(
        <>
        <Stack.Screen options={{
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
        }}/>
        <BodyScrollView contentContainerStyle={{padding: 16}}>
            <ThemedText type="title">Home In</ThemedText>
            <Button onPress={signOut}>Sign Out</Button>
        </BodyScrollView>
        </>
    );
}