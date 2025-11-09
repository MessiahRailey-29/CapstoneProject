import * as React from 'react';
import { ThemedText } from "@/components/ThemedText";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { Button } from '@/components/ui/button';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import TextInput from '@/components/ui/text-input';
import { ClerkAPIError } from '@clerk/types';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { 
  checkLoginAttempts, 
  recordLoginAttempt, 
  updateLastActivity 
} from '@/utils/securityUtils';
import {
  checkBiometricCapability,
  biometricLogin,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  getBiometricTypeName,
  getStoredEmail,
} from '@/utils/biometricAuth';

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

    // Biometric states
    const [biometricAvailable, setBiometricAvailable] = React.useState(false);
    const [biometricType, setBiometricType] = React.useState<string>('none');
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const [showEnableBiometric, setShowEnableBiometric] = React.useState(false);

    // Check biometric availability on mount
    React.useEffect(() => {
        checkBiometrics();
        loadStoredEmail();
    }, []);

    const checkBiometrics = async () => {
        const capability = await checkBiometricCapability();
        console.log('Biometric capability:', capability);
        setBiometricAvailable(capability.isAvailable);
        setBiometricType(capability.biometricType);

        const enabled = await isBiometricLoginEnabled();
        console.log('Biometric enabled:', enabled);
        setBiometricEnabled(enabled);
    };

    const loadStoredEmail = async () => {
        const email = await getStoredEmail();
        if (email) {
            setEmailAddress(email);
        }
    };

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

    const handleBiometricLogin = async () => {
        setIsSigningIn(true);
        setErrors([]);

        try {
            const result = await biometricLogin();
            
            if (!result.success) {
                Alert.alert('Authentication Failed', result.error || 'Could not authenticate');
                setIsSigningIn(false);
                return;
            }

            // Use retrieved credentials to sign in with Clerk
            const signInAttempt = await signIn.create({
                identifier: result.email!,
                password: result.password!,
            });

            if (signInAttempt.status === "complete") {
                await recordLoginAttempt(result.email!, true);
                await updateLastActivity();
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace("/(index)/(tabs)");
            }
        } catch (err) {
            console.error('Biometric login error:', err);
            if (isClerkAPIResponseError(err)) {
                setErrors(err.errors);
            }
            Alert.alert('Sign In Failed', 'Please try signing in with your password.');
        } finally {
            setIsSigningIn(false);
        }
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

                // Offer to enable biometric login after first successful sign-in
                if (biometricAvailable && !biometricEnabled) {
                    setShowEnableBiometric(true);
                } else {
                    router.replace("/(index)/(tabs)");
                }
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
    }, [isLoaded, emailAddress, password, remainingAttempts, biometricAvailable, biometricEnabled]);

    const handleEnableBiometric = async (enable: boolean) => {
        if (enable) {
            const result = await enableBiometricLogin(emailAddress, password);
            if (result.success) {
                setBiometricEnabled(true);
                Alert.alert(
                    'Success',
                    `${getBiometricTypeName(biometricType)} login enabled!`,
                    [{ text: 'OK', onPress: () => router.replace("/(index)/(tabs)") }]
                );
            } else {
                Alert.alert('Error', result.error || 'Could not enable biometric login');
                router.replace("/(index)/(tabs)");
            }
        } else {
            router.replace("/(index)/(tabs)");
        }
        setShowEnableBiometric(false);
    };

    if (showEnableBiometric) {
        return (
            <BodyScrollView contentContainerStyle={{ padding: 16, justifyContent: 'center', flex: 1 }}>
                <View style={styles.biometricPrompt}>
                    <IconSymbol name="checkmark.seal.fill" size={64} color="#22C55E" />
                    <ThemedText style={styles.biometricPromptTitle}>
                        Enable {getBiometricTypeName(biometricType)}?
                    </ThemedText>
                    <ThemedText style={styles.biometricPromptText}>
                        Sign in faster and more securely with {getBiometricTypeName(biometricType)} next time.
                    </ThemedText>
                    <Button onPress={() => handleEnableBiometric(true)} style={{ marginBottom: 12 }}>
                        Enable {getBiometricTypeName(biometricType)}
                    </Button>
                    <Button onPress={() => handleEnableBiometric(false)} variant="ghost">
                        Maybe Later
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
                <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>
                <ThemedText style={styles.subtitleText}>
                    Sign in to continue to your account
                </ThemedText>
            </View>

            {/* MANUAL ENABLE BUTTON - Fixed location */}
            {biometricAvailable && !biometricEnabled && (
                <Pressable 
                    style={{
                        backgroundColor: '#DBEAFE',
                        borderWidth: 2,
                        borderColor: '#3B82F6',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16,
                        alignItems: 'center',
                    }}
                    onPress={() => {
                        if (!emailAddress || !password) {
                            Alert.alert('Enter Credentials', 'Please enter your email and password first.');
                            return;
                        }
                        setShowEnableBiometric(true);
                    }}
                >
                    <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#1E40AF' }}>
                        🔐 Enable Biometrics Now
                    </ThemedText>
                </Pressable>
            )}

            {/* Biometric Login Button - Only shows when enabled */}
            {biometricEnabled && biometricAvailable && (
                <Pressable 
                    style={styles.biometricButton} 
                    onPress={handleBiometricLogin}
                    disabled={isSigningIn}
                >
                    <IconSymbol 
                        name={biometricType === 'face' ? 'person' : 'hand.raised'} 
                        size={32} 
                        color="#3B82F6" 
                    />
                    <ThemedText style={styles.biometricButtonText}>
                        Sign in with {getBiometricTypeName(biometricType)}
                    </ThemedText>
                </Pressable>
            )}

            {biometricEnabled && (
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <ThemedText style={styles.dividerText}>or sign in with email</ThemedText>
                    <View style={styles.dividerLine} />
                </View>
            )}

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
                    onPress={() => router.push("/reset-password")}
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
                    onPress={() => router.push("/sign-up")}
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
    debugButton: {
        backgroundColor: '#FEF3C7',
        borderWidth: 2,
        borderColor: '#F59E0B',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    debugText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        borderWidth: 2,
        borderColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    biometricButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
        marginLeft: 12,
    },
    biometricPrompt: {
        alignItems: 'center',
        padding: 24,
    },
    biometricPromptTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    biometricPromptText: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
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