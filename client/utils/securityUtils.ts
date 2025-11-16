import AsyncStorage from '@react-native-async-storage/async-storage';

// Rate limiting for login attempts
const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const LOGIN_LOCKOUT_KEY = 'login_lockout';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

export interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

export async function checkLoginAttempts(email: string): Promise<{ allowed: boolean; remainingAttempts: number; lockoutTime?: number }> {
  try {
    const attemptsData = await AsyncStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    const lockoutData = await AsyncStorage.getItem(`${LOGIN_LOCKOUT_KEY}_${email}`);

    // Check if account is locked out
    if (lockoutData) {
      const lockoutTime = parseInt(lockoutData);
      const now = Date.now();
      
      if (now < lockoutTime) {
        return {
          allowed: false,
          remainingAttempts: 0,
          lockoutTime: lockoutTime,
        };
      } else {
        // Lockout expired, clear it
        await AsyncStorage.removeItem(`${LOGIN_LOCKOUT_KEY}_${email}`);
        await AsyncStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
      }
    }

    // Check attempts
    if (attemptsData) {
      const attempts: LoginAttempt = JSON.parse(attemptsData);
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      
      // Reset attempts if more than 1 hour has passed
      if (timeSinceLastAttempt > 60 * 60 * 1000) {
        await AsyncStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
        return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
      }

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts.count;
      return {
        allowed: remainingAttempts > 0,
        remainingAttempts: Math.max(0, remainingAttempts),
      };
    }

    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }
}

export async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  try {
    if (success) {
      // Clear attempts on successful login
      await AsyncStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
      await AsyncStorage.removeItem(`${LOGIN_LOCKOUT_KEY}_${email}`);
      return;
    }

    // Record failed attempt
    const attemptsData = await AsyncStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    let attempts: LoginAttempt = attemptsData 
      ? JSON.parse(attemptsData)
      : { count: 0, lastAttempt: Date.now() };

    attempts.count += 1;
    attempts.lastAttempt = Date.now();

    await AsyncStorage.setItem(`${LOGIN_ATTEMPTS_KEY}_${email}`, JSON.stringify(attempts));

    // Lock account if max attempts reached
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      await AsyncStorage.setItem(`${LOGIN_LOCKOUT_KEY}_${email}`, lockoutTime.toString());
    }
  } catch (error) {
    console.error('Error recording login attempt:', error);
  }
}

// Session timeout management
const LAST_ACTIVITY_KEY = 'last_activity';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export async function updateLastActivity(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
}

export async function checkSessionTimeout(): Promise<boolean> {
  try {
    const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;

    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    return timeSinceActivity > SESSION_TIMEOUT;
  } catch (error) {
    console.error('Error checking session timeout:', error);
    return false;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

// Device fingerprinting (basic)
export async function getDeviceFingerprint(): Promise<string> {
  try {
    // In a real app, you'd use a library like expo-device to get more info
    const timestamp = Date.now().toString();
    return `device_${timestamp}`;
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    return 'unknown_device';
  }
}

// Secure storage helper for sensitive data
export async function secureStore(key: string, value: string): Promise<void> {
  try {
    // In production, use expo-secure-store instead of AsyncStorage
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('Error storing secure data:', error);
  }
}

export async function secureRetrieve(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
}

export async function secureDelete(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting secure data:', error);
  }
}

// Verification code expiration management
const VERIFICATION_CODE_KEY = 'verification_code';
const VERIFICATION_CODE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export interface VerificationCodeData {
  code: string;
  email: string;
  type: 'signup' | 'reset_password';
  createdAt: number;
}

export async function storeVerificationCode(email: string, code: string, type: 'signup' | 'reset_password'): Promise<void> {
  try {
    const data: VerificationCodeData = {
      code,
      email,
      type,
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(`${VERIFICATION_CODE_KEY}_${email}_${type}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing verification code:', error);
  }
}

export async function checkVerificationCodeExpiry(email: string, type: 'signup' | 'reset_password'): Promise<{ expired: boolean; remainingTime?: number }> {
  try {
    const data = await AsyncStorage.getItem(`${VERIFICATION_CODE_KEY}_${email}_${type}`);
    if (!data) {
      return { expired: true };
    }

    const codeData: VerificationCodeData = JSON.parse(data);
    const timeSinceCreation = Date.now() - codeData.createdAt;
    
    if (timeSinceCreation > VERIFICATION_CODE_EXPIRY) {
      // Code expired, remove it
      await AsyncStorage.removeItem(`${VERIFICATION_CODE_KEY}_${email}_${type}`);
      return { expired: true };
    }

    const remainingTime = VERIFICATION_CODE_EXPIRY - timeSinceCreation;
    return { expired: false, remainingTime };
  } catch (error) {
    console.error('Error checking verification code expiry:', error);
    return { expired: true };
  }
}

export async function clearVerificationCode(email: string, type: 'signup' | 'reset_password'): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${VERIFICATION_CODE_KEY}_${email}_${type}`);
  } catch (error) {
    console.error('Error clearing verification code:', error);
  }
}