import * as React from 'react';
import { ThemedText } from "@/components/ThemedText";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { View, StyleSheet, Alert } from "react-native";
import { Button } from '@/components/ui/button';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import TextInput from '@/components/ui/text-input';
import { ClerkAPIError } from '@clerk/types';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { 
  checkLoginAttempts, 
  recordLoginAttempt, 
  updateLastActivity 
} from '@/utils/securityUtils';

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const [remainingAttempts, setRemainingAttempts] = React.useState<number | null>(null);
    const [isLockedOut, setIsLockedOut] = React.useState(false);
    const [lockoutEndTime, setLockoutEndTime] = React.useState<number | null>(null);

    // Check login attempts when email changes
    React.useEffect(() => {
        if (emailAddress) {
            checkAttempts();
        }
    }, [emailAddress]);

    const checkAttempts = async () => {
        const result = await checkLoginAttempts(emailAddress);
        setRemainingAttempts(result.remainingAttempts);
        setIsLockedOut(!result.allowed);
        if (result.lockoutTime) {
            setLockoutEndTime(result.lockoutTime);
        }
    };

    const formatLockoutTime = () => {
        if (!lockoutEndTime) return '';
        const now = Date.now();
        const remaining = Math.ceil((lockoutEndTime - now) / 1000 / 60);
        return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
    };

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) return;

        // Check if account is locked out
        const attemptCheck = await checkLoginAttempts(emailAddress);
        if (!attemptCheck.allowed) {
            Alert.alert(
                'Account Temporarily Locked',
                `Too many failed login attempts. Please try again in ${formatLockoutTime()}.`,
                [{ text: 'OK' }]
            );
            return;
        }

        setIsSigningIn(true);
        setErrors([]);

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === "complete") {
                // Record successful login
                await recordLoginAttempt(emailAddress, true);
                await updateLastActivity();
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace("/(index)/(tabs)");
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            
            // Record failed login attempt
            await recordLoginAttempt(emailAddress, false);
            await checkAttempts();

            if (isClerkAPIResponseError(err)) {
                setErrors(err.errors);
            }

            // Show warning if getting close to lockout
            if (remainingAttempts !== null && remainingAttempts <= 2 && remainingAttempts > 0) {
                Alert.alert(
                    'Warning',
                    `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.`,
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsSigningIn(false);
        }
    }, [isLoaded, emailAddress, password, remainingAttempts]);

    return (
        <BodyScrollView
            contentContainerStyle={{
                padding: 16,
            }}
        >
            <View style={styles.header}>
                <ThemedText style={styles.welcomeText}>Welcome back</ThemedText>
                <ThemedText style={styles.subtitleText}>Sign in to your account</ThemedText>
            </View>

            {isLockedOut && (
                <View style={styles.lockoutBanner}>
                    <ThemedText style={styles.lockoutText}>
                        🔒 Account temporarily locked due to multiple failed attempts.
                    </ThemedText>
                    <ThemedText style={styles.lockoutTime}>
                        Try again in {formatLockoutTime()}
                    </ThemedText>
                </View>
            )}

            {!isLockedOut && remainingAttempts !== null && remainingAttempts < 5 && (
                <View style={styles.warningBanner}>
                    <ThemedText style={styles.warningText}>
                        ⚠️ {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </ThemedText>
                </View>
            )}

            <TextInput
                label="Email"
                value={emailAddress}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmailAddress}
                editable={!isLockedOut}
            />

            <TextInput
                value={password}
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
                editable={!isLockedOut}
            />

            <ErrorDisplay errors={errors} />

            <Button
                onPress={onSignInPress}
                loading={isSigningIn}
                disabled={!emailAddress || !password || isSigningIn || isLockedOut}
            >
                Sign In
            </Button>

            <View style={styles.linkContainer}>
                <ThemedText style={styles.linkText}>Forgot your password?</ThemedText>
                <Button
                    onPress={() => router.push("/(auth)/reset-password")}
                    variant="ghost"
                >
                    Reset Password
                </Button>
            </View>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>or</ThemedText>
                <View style={styles.dividerLine} />
            </View>

            <View style={styles.linkContainer}>
                <ThemedText style={styles.linkText}>Don't have an account?</ThemedText>
                <Button
                    onPress={() => router.push("/(auth)/sign-up")}
                    variant="ghost"
                >
                    Sign Up
                </Button>
            </View>

            <View style={styles.securityNote}>
                <ThemedText style={styles.securityNoteText}>
                    🔒 Your connection is secure and encrypted
                </ThemedText>
            </View>
        </BodyScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
        paddingTop: 50,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
    },
    lockoutBanner: {
        backgroundColor: '#FEE2E2',
        borderLeftWidth: 4,
        borderLeftColor: '#DC2626',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    lockoutText: {
        fontSize: 14,
        color: '#991B1B',
        fontWeight: '600',
        marginBottom: 4,
    },
    lockoutTime: {
        fontSize: 12,
        color: '#7F1D1D',
    },
    warningBanner: {
        backgroundColor: '#FEF3C7',
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    warningText: {
        fontSize: 13,
        color: '#92400E',
        fontWeight: '600',
    },
    linkContainer: {
        marginTop: 18,
        alignItems: "center",
    },
    linkText: {
        fontSize: 14,
        opacity: 0.7,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        opacity: 0.5,
    },
    securityNote: {
        marginTop: 24,
        alignItems: 'center',
    },
    securityNoteText: {
        fontSize: 12,
        opacity: 0.6,
    },
});