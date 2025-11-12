import * as React from 'react';
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import TextInput from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { PasswordStrengthMeter, calculatePasswordStrength } from '@/components/ui/PasswordStrengthMeter';
import { storeVerificationCode, checkVerificationCodeExpiry, clearVerificationCode } from '@/utils/securityUtils';

export default function SignUpScreen() {
    const { signUp, setActive, isLoaded } = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
    const [passwordError, setPasswordError] = React.useState("");
    const [code, setCode] = React.useState("");
    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [codeExpiryTime, setCodeExpiryTime] = React.useState<number | null>(null);
    const [remainingTime, setRemainingTime] = React.useState<string>('');

    // Validate password match
    const validatePasswords = React.useCallback(() => {
        if (password && confirmPassword && password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return false;
        }
        setPasswordError("");
        return true;
    }, [password, confirmPassword]);

    // Check password match on change
    React.useEffect(() => {
        if (confirmPassword) {
            validatePasswords();
        }
    }, [password, confirmPassword, validatePasswords]);

    // Timer for verification code expiration
    React.useEffect(() => {
        if (!pendingVerification || !codeExpiryTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeLeft = codeExpiryTime - now;

            if (timeLeft <= 0) {
                setRemainingTime('Code expired');
                clearInterval(interval);
                Alert.alert(
                    'Code Expired',
                    'Your verification code has expired. Please request a new one.',
                    [{ text: 'OK' }]
                );
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [pendingVerification, codeExpiryTime]);

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        // Validate passwords match
        if (!validatePasswords()) {
            return;
        }

        // Check password strength
        const strength = calculatePasswordStrength(password);
        if (!strength.isStrong) {
            Alert.alert(
                'Weak Password',
                'Your password does not meet the security requirements. Please create a stronger password.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            await signUp.create({
                emailAddress,
                password
            });

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            // Store verification code timestamp
            const expiryTime = Date.now() + (2 * 60 * 1000); // 2 minutes from now
            setCodeExpiryTime(expiryTime);
            await storeVerificationCode(emailAddress, '', 'signup');

            setPendingVerification(true);
        } catch (e) {
            console.log(e);
            if (isClerkAPIResponseError(e)) {
                setErrors(e.errors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        setErrors([]);

        try {
            // Check if verification code has expired
            const expiryCheck = await checkVerificationCodeExpiry(emailAddress, 'signup');
            if (expiryCheck.expired) {
                Alert.alert(
                    'Code Expired',
                    'Your verification code has expired. Please request a new one.',
                    [{ text: 'OK' }]
                );
                setIsLoading(false);
                return;
            }

            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === "complete") {
                await clearVerificationCode(emailAddress, 'signup');
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace("/");
            } else {
                console.log(signUpAttempt);
            }
        } catch (e) {
            console.log(e);
            if (isClerkAPIResponseError(e)) {
                setErrors(e.errors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <BodyScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>
                        Verify your email
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle}>
                        We sent a verification code to {emailAddress}
                    </ThemedText>
                </View>

                <View style={styles.securityTip}>
                    <ThemedText style={styles.securityTipText}>
                        💡 Tip: Check your spam folder if you don't see the email
                    </ThemedText>
                    {remainingTime && (
                        <ThemedText style={[styles.securityTipText, { marginTop: 8, fontWeight: '600' }]}>
                            ⏱️ Code expires in: {remainingTime}
                        </ThemedText>
                    )}
                </View>

                <TextInput
                    value={code}
                    label="Verification Code"
                    placeholder="Enter your verification code"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    onChangeText={(code) => setCode(code)}
                />

                <ErrorDisplay errors={errors} />

                <Button
                    onPress={onVerifyPress}
                    disabled={!code || isLoading}
                    loading={isLoading}
                >
                    Verify Email
                </Button>

                <View style={styles.linkContainer}>
                    <ThemedText style={styles.linkText}>
                        Didn't receive the code?
                    </ThemedText>
                    <Button
                        variant="ghost"
                        onPress={onSignUpPress}
                        disabled={isLoading}
                    >
                        Resend code
                    </Button>
                </View>
            </BodyScrollView>
        );
    }

    return (
        <BodyScrollView
            contentContainerStyle={{
                padding: 16,
            }}
        >
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Create an account</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                    Sign up to get started with your shopping lists
                </ThemedText>
            </View>

            <View style={styles.securityBanner}>
                <ThemedText style={styles.securityBannerText}>
                    🔒 We take your security seriously
                </ThemedText>
                <ThemedText style={styles.securityBannerSubtext}>
                    Your data is encrypted and secure
                </ThemedText>
            </View>

            <TextInput
                label="Email"
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter your email"
                keyboardType="email-address"
                onChangeText={(email) => setEmailAddress(email)}
            />

            <TextInput
                value={password}
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
            />

            {password && <PasswordStrengthMeter password={password} />}

            <TextInput
                value={confirmPassword}
                label="Confirm Password"
                placeholder="Re-enter your password"
                secureTextEntry={true}
                onChangeText={(password) => setConfirmPassword(password)}
                error={passwordError}
            />

            <ErrorDisplay errors={errors} />

            <Button
                onPress={onSignUpPress}
                disabled={!emailAddress || !password || !confirmPassword || !!passwordError || isLoading}
                loading={isLoading}
            >
                Create Account
            </Button>

            <View style={styles.linkContainer}>
                <ThemedText style={styles.linkText}>
                    Already have an account?
                </ThemedText>
                <Button
                    variant="ghost"
                    onPress={() => router.back()}
                    disabled={isLoading}
                >
                    Sign In
                </Button>
            </View>

            <View style={styles.securityNote}>
                <ThemedText style={styles.securityNoteText}>
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </ThemedText>
            </View>
        </BodyScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
        lineHeight: 20,
    },
    securityBanner: {
        backgroundColor: '#DBEAFE',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    securityBannerText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '600',
        marginBottom: 2,
    },
    securityBannerSubtext: {
        fontSize: 12,
        color: '#1E3A8A',
    },
    securityTip: {
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    securityTipText: {
        fontSize: 13,
        color: '#92400E',
    },
    linkContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    linkText: {
        fontSize: 14,
        opacity: 0.7,
    },
    securityNote: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    securityNoteText: {
        fontSize: 11,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 16,
    },
});