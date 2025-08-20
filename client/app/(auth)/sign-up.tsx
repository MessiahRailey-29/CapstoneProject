import * as React from 'react'
import {ThemedText} from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import TextInput from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import {View} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ClerkLoading, useSignUp } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { isLoading } from 'expo-font';

export default function SignUpScreen(){
    const {signUp, setActive, isLoaded} = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
    const [code, setCode] = React.useState("");
    const [pendingVerification, setPendingVerification] = React.useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        setErrors([])

            try{
                //start authentication
                await signUp.create({
                    emailAddress,
                    password
                })
                //confirmation
                await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                });
                setPendingVerification(true);
            } catch(e){
                console.log(e)
            } finally {
                setIsLoading(false);
            }
    }
    const onVerifyPress = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        setErrors([])

            try{
                const signUpAttempt = await signUp.attemptEmailAddressVerification({
                    code,
                });

                if (signUpAttempt.status ==="complete"){
                    await setActive ({session: signUpAttempt.createdSessionId})
                    router.replace("/")
                } else{
                    console.log(signUpAttempt);
                }
            } catch(e){
                console.log(e)
            } finally {
                setIsLoading(false);
            }
    }
    if (pendingVerification){
        return(
        <BodyScrollView contentContainerStyle={{ padding: 16 }}>
                <TextInput
                value={code}
                label={`Enter the verification code we sent to ${emailAddress}`}
                placeholder="Enter your verification code"
                onChangeText={(code) => setCode(code)}
                />
                <Button
                onPress={onVerifyPress}
                disabled={!code || isLoading}
                loading={isLoading}
                >
                Verify
                </Button>
                {errors.map((error) => (
                <ThemedText key={error.longMessage} style={{ color: "red" }}>
                    {error.longMessage}
                </ThemedText>
                ))}
        </BodyScrollView>
    );
    }
    return(
            <BodyScrollView
                contentContainerStyle={{
                    padding: 16,
                }}
                >
                    <TextInput
                    label="Email"
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter Email"
                    keyboardType="email-address"
                    onChangeText={(email)=>setEmailAddress(email)}
                    />
                    <TextInput
                    value={password}
                    placeholder="Enter Password"
                    secureTextEntry={true}
                    onChangeText={(password)=>setPassword(password)}
                    />
                    <Button onPress={onSignUpPress}
                    disabled={!emailAddress || !password || isLoading}
                    loading={isLoading}
                    >Continue
                    </Button>
                   {errors.map((error) => (
                        <ThemedText key={error.longMessage} style={{ color: "red" }}>
                        {error.longMessage}
                        </ThemedText>
                    ))}
                </BodyScrollView>
    )
}