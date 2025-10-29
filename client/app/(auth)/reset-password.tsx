import * as React from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

export default function ResetPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [step, setStep] = React.useState<"email" | "verify" | "password">("email");
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
  const [passwordError, setPasswordError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

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

  const onResetPasswordPress = React.useCallback(async () => {
    if (!isLoaded) return;
    setErrors([]);
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });

      setStep("verify");
    } catch (err) {
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, signIn]);

  const onVerifyCodePress = React.useCallback(async () => {
    if (!isLoaded || !code) return;
    
    // Just move to password step - we'll verify the code when resetting password
    setStep("password");
    setErrors([]);
  }, [isLoaded, code]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;

    // Validate passwords match
    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code, password, signIn, setActive, router, validatePasswords]);

  // Step 1: Enter email
  if (step === "email") {
    return (
      <BodyScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Reset your password</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Enter your email address and we'll send you a verification code
          </ThemedText>
        </View>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          onChangeText={setEmailAddress}
        />

        <ErrorDisplay errors={errors} />

        <Button
          onPress={onResetPasswordPress}
          disabled={!emailAddress || isLoading}
          loading={isLoading}
        >
          Send verification code
        </Button>

        <View style={styles.backToLogin}>
          <Button
            variant="ghost"
            onPress={() => router.back()}
            disabled={isLoading}
          >
            Back to sign in
          </Button>
        </View>
      </BodyScrollView>
    );
  }

  // Step 2: Verify code
  if (step === "verify") {
    return (
      <BodyScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Enter verification code</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            We sent a verification code to {emailAddress}
          </ThemedText>
        </View>

        <TextInput
          value={code}
          label="Verification Code"
          placeholder="Enter your verification code"
          keyboardType="number-pad"
          autoCapitalize="none"
          onChangeText={setCode}
        />

        <ErrorDisplay errors={errors} />

        <Button
          onPress={onVerifyCodePress}
          disabled={!code || isLoading}
          loading={isLoading}
        >
          Continue
        </Button>

        <View style={styles.resendContainer}>
          <ThemedText style={styles.resendText}>
            Didn't receive the code?
          </ThemedText>
          <Button
            variant="ghost"
            onPress={onResetPasswordPress}
            disabled={isLoading}
          >
            Resend code
          </Button>
        </View>
      </BodyScrollView>
    );
  }

  // Step 3: Set new password
  if (step === "password") {
    return (
      <BodyScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Create new password</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Enter your new password below
          </ThemedText>
        </View>

        <TextInput
          value={password}
          label="New Password"
          placeholder="Enter your new password"
          secureTextEntry={true}
          onChangeText={setPassword}
        />

        <TextInput
          value={confirmPassword}
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          secureTextEntry={true}
          onChangeText={setConfirmPassword}
          error={passwordError}
        />

        {password && (
          <View style={styles.passwordRequirements}>
            <ThemedText style={styles.requirementsTitle}>
              Password requirements:
            </ThemedText>
            <ThemedText style={styles.requirementItem}>
              {password.length >= 8 ? "✓" : "○"} At least 8 characters
            </ThemedText>
          </View>
        )}

        <ErrorDisplay errors={errors} />

        <Button
          onPress={onVerifyPress}
          disabled={!password || !confirmPassword || !!passwordError || isLoading}
          loading={isLoading}
        >
          Reset password
        </Button>
      </BodyScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  passwordRequirements: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  requirementItem: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  backToLogin: {
    marginTop: 16,
    alignItems: "center",
  },
});