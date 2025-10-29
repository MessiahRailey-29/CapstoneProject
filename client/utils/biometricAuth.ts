import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const STORED_EMAIL_KEY = 'stored_email';
const STORED_PASSWORD_KEY = 'stored_password'; // Encrypted by SecureStore

export interface BiometricCapability {
  isAvailable: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | 'none';
  isEnrolled: boolean;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricCapability(): Promise<BiometricCapability> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!compatible) {
      return {
        isAvailable: false,
        biometricType: 'none',
        isEnrolled: false,
      };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let biometricType: 'fingerprint' | 'face' | 'iris' | 'none' = 'none';

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return {
      isAvailable: compatible && enrolled,
      biometricType,
      isEnrolled: enrolled,
    };
  } catch (error) {
    console.error('Error checking biometric capability:', error);
    return {
      isAvailable: false,
      biometricType: 'none',
      isEnrolled: false,
    };
  }
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const capability = await checkBiometricCapability();
    
    if (!capability.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || 'Authenticate to continue',
      fallbackLabel: 'Use password instead',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      return { success: true };
    } else {
      // result.success is false, provide generic error message
      return {
        success: false,
        error: 'Authentication failed or was cancelled',
      };
    }
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: 'An error occurred during authentication',
    };
  }
}

/**
 * Get a user-friendly name for the biometric type
 */
export function getBiometricTypeName(type: string): string {
  switch (type) {
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    case 'face':
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    case 'iris':
      return 'Iris Scan';
    default:
      return 'Biometric';
  }
}

/**
 * Check if user has enabled biometric login
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric login status:', error);
    return false;
  }
}

/**
 * Enable biometric login and store credentials securely
 */
export async function enableBiometricLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First verify biometrics work
    const authResult = await authenticateWithBiometrics(
      'Authenticate to enable biometric login'
    );

    if (!authResult.success) {
      return authResult;
    }

    // Store credentials securely
    await SecureStore.setItemAsync(STORED_EMAIL_KEY, email);
    await SecureStore.setItemAsync(STORED_PASSWORD_KEY, password);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

    return { success: true };
  } catch (error) {
    console.error('Error enabling biometric login:', error);
    return {
      success: false,
      error: 'Failed to enable biometric login',
    };
  }
}

/**
 * Disable biometric login and clear stored credentials
 */
export async function disableBiometricLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORED_EMAIL_KEY);
    await SecureStore.deleteItemAsync(STORED_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  } catch (error) {
    console.error('Error disabling biometric login:', error);
  }
}

/**
 * Get stored credentials after successful biometric authentication
 */
export async function getStoredCredentials(): Promise<{
  email: string | null;
  password: string | null;
}> {
  try {
    const email = await SecureStore.getItemAsync(STORED_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(STORED_PASSWORD_KEY);
    return { email, password };
  } catch (error) {
    console.error('Error retrieving stored credentials:', error);
    return { email: null, password: null };
  }
}

/**
 * Perform biometric login (authenticate + retrieve credentials)
 */
export async function biometricLogin(): Promise<{
  success: boolean;
  email?: string;
  password?: string;
  error?: string;
}> {
  try {
    const enabled = await isBiometricLoginEnabled();
    if (!enabled) {
      return {
        success: false,
        error: 'Biometric login is not enabled',
      };
    }

    const authResult = await authenticateWithBiometrics('Sign in with biometrics');
    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    const credentials = await getStoredCredentials();
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Stored credentials not found',
      };
    }

    return {
      success: true,
      email: credentials.email,
      password: credentials.password,
    };
  } catch (error) {
    console.error('Biometric login error:', error);
    return {
      success: false,
      error: 'An error occurred during biometric login',
    };
  }
}

/**
 * Get stored email without authentication (for display purposes)
 */
export async function getStoredEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORED_EMAIL_KEY);
  } catch (error) {
    console.error('Error getting stored email:', error);
    return null;
  }
}