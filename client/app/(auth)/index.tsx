import * as React from 'react';
import {ThemedText} from "@/components/ThemedText";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import {useRouter, Link} from "expo-router";
import {View} from "react-native";
import { Button } from '@/components/ui/button';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import TextInput from '@/components/ui/text-input';
import { ClerkAPIError } from '@clerk/types';

export default function SignInScreen(){
    const {signIn, setActive, isLoaded} = useSignIn();
    const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isSigningIn, setIsSigningIn] = React.useState(false);


    const onSignInPress = React.useCallback (async () => {
        if (!isLoaded) return;
        setIsSigningIn(true);

        //start the sign-in process using the email and password provided
        try{
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            //if sign-in process is complete, set the created session
            // and redirect the user
            if(signInAttempt.status === "complete"){
                await setActive({session: signInAttempt.createdSessionId});
                router.replace("/(index)");
            }else{
            //If status isn't complete, check why. user might need to complete further steps
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch(err){
            console.error(JSON.stringify(err, null, 2));
            if (isClerkAPIResponseError(err)){
                setErrors(err.errors);
            }
        } finally{
            setIsSigningIn(false);
        }
    }, [isLoaded, emailAddress, password]);

    return(
        <BodyScrollView
        contentContainerStyle={{
            padding: 16,
        }}
        >
            <TextInput
            label="Email"
            value={emailAddress}
            placeholder="Enter Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmailAddress}
            />
            <TextInput
            value={password}
            label="Password"
            placeholder="Enter Password"
            secureTextEntry={true}
            onChangeText={(password)=>setPassword(password)}
            />
            <Button onPress={onSignInPress}
            loading={isSigningIn}
            disabled={!emailAddress || !password || isSigningIn}
            >Sign In
            </Button>
            {errors.map((error) => (
                <ThemedText key={error.longMessage} style={{ color: "red" }}>
                {error.longMessage}
                </ThemedText>
            ))}
            <View style={{marginTop: 16, alignItems: "center"}}>
                <ThemedText>Dont have an account?</ThemedText>
                <Button onPress={() => router.push("/sign-up")} variant="ghost">Sign Up</Button>
            </View>

            <View style={{marginTop: 16, alignItems: "center"}}>
                <ThemedText>Forgot Password?</ThemedText>
                <Button onPress={() => router.push("/reset-password")} variant="ghost">
                Reset Password
                </Button>
            </View>
        </BodyScrollView>
    )
}