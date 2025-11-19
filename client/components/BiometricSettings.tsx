import React, { useState } from 'react';
import { View, StyleSheet, Alert, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  checkBiometricCapability,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
  getBiometricTypeName,
  authenticateWithBiometrics,
} from '@/utils/biometricAuth';
import { useUser } from '@clerk/clerk-expo';
import CustomAlert from './ui/CustomAlert';

export default function BiometricSettingsScreen() {
  const { user } = useUser();
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState<string>('none');
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);

  const showCustomAlert = (title: string, message: string, buttons?: any[]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(
      buttons || [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
    );
    setCustomAlertVisible(true);
  };

  React.useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const capability = await checkBiometricCapability();
    setBiometricAvailable(capability.isAvailable);
    setBiometricType(capability.biometricType);

    const enabled = await isBiometricLoginEnabled();
    setBiometricEnabled(enabled);
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      // Enable biometric login
      showCustomAlert(
        'Enable Biometric Login',
        'Enter your password to enable biometric login',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Enable',
            onPress: async (password) => {
              if (!password) {
                showCustomAlert('Error', 'Password is required');
                return;
              }

              setIsLoading(true);
              const result = await enableBiometricLogin(
                user?.emailAddresses[0]?.emailAddress || '',
                password
              );
              setIsLoading(false);

              if (result.success) {
                setBiometricEnabled(true);
                showCustomAlert(
                  'Success',
                  `${getBiometricTypeName(biometricType)} login enabled!`
                );
              } else {
                showCustomAlert('Error', result.error || 'Could not enable biometric login');
              }
            },
          },
        ],
      );
    } else {
      // Disable biometric login
      showCustomAlert(
        'Disable Biometric Login',
        'Are you sure you want to disable biometric login?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              // Require authentication before disabling
              const authResult = await authenticateWithBiometrics(
                'Authenticate to disable biometric login'
              );

              if (authResult.success) {
                await disableBiometricLogin();
                setBiometricEnabled(false);
                showCustomAlert('Success', 'Biometric login disabled');
              } else {
                showCustomAlert('Error', 'Authentication required to disable biometric login');
              }
            },
          },
        ]
      );
    }
  };

  const testBiometric = async () => {
    const result = await authenticateWithBiometrics('Test biometric authentication');
    if (result.success) {
      showCustomAlert('Success', 'Authentication successful!');
    } else {
      showCustomAlert('Failed', result.error || 'Authentication failed');
    }
  };

  if (!biometricAvailable) {
    return (
      <BodyScrollView contentContainerStyle={styles.container}>
        <View style={styles.unavailableContainer}>
          <IconSymbol name="exclamationmark.triangle" size={64} color="#F59E0B" />
          <ThemedText style={styles.unavailableTitle}>
            Biometric Authentication Unavailable
          </ThemedText>
          <ThemedText style={styles.unavailableText}>
            Your device does not support biometric authentication, or you haven't set up
            biometrics in your device settings.
          </ThemedText>
          <ThemedText style={styles.unavailableHint}>
            To enable biometric login, please set up {'\n'}
            Face ID, Touch ID, or Fingerprint in your device settings.
          </ThemedText>
        </View>
      </BodyScrollView>
    );
  }

  return (
    <BodyScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <IconSymbol
          name={biometricType === 'face' ? 'person' : 'hand.raised'}
          size={48}
          color="#3B82F6"
        />
        <ThemedText style={styles.title}>
          {getBiometricTypeName(biometricType)}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Use {getBiometricTypeName(biometricType)} for faster and more secure sign-ins
        </ThemedText>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingInfo}>
          <ThemedText style={styles.settingTitle}>
            Enable {getBiometricTypeName(biometricType)} Login
          </ThemedText>
          <ThemedText style={styles.settingDescription}>
            {biometricEnabled
              ? `You can sign in using ${getBiometricTypeName(biometricType)}`
              : `Sign in faster with ${getBiometricTypeName(biometricType)}`}
          </ThemedText>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={handleToggleBiometric}
          disabled={isLoading}
        />
      </View>

      {biometricEnabled && (
        <View style={styles.infoCard}>
          <IconSymbol name="checkmark.seal.fill" size={24} color="#22C55E" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>Active</ThemedText>
            <ThemedText style={styles.infoText}>
              {getBiometricTypeName(biometricType)} login is currently enabled for your account
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.securityInfo}>
        <ThemedText style={styles.securityTitle}>How it works</ThemedText>
        <View style={styles.securityItem}>
          <ThemedText style={styles.securityBullet}>•</ThemedText>
          <ThemedText style={styles.securityText}>
            Your credentials are stored securely using hardware encryption
          </ThemedText>
        </View>
        <View style={styles.securityItem}>
          <ThemedText style={styles.securityBullet}>•</ThemedText>
          <ThemedText style={styles.securityText}>
            {getBiometricTypeName(biometricType)} data never leaves your device
          </ThemedText>
        </View>
        <View style={styles.securityItem}>
          <ThemedText style={styles.securityBullet}>•</ThemedText>
          <ThemedText style={styles.securityText}>
            You can still sign in with your password anytime
          </ThemedText>
        </View>
        <View style={styles.securityItem}>
          <ThemedText style={styles.securityBullet}>•</ThemedText>
          <ThemedText style={styles.securityText}>
            Disable this feature anytime from settings
          </ThemedText>
        </View>
      </View>

      {biometricEnabled && (
        <View style={styles.testButton}>
          <ThemedText
            style={styles.testButtonText}
            onPress={testBiometric}
          >
            Test {getBiometricTypeName(biometricType)} →
          </ThemedText>
        </View>
      )}
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
        onClose={() => setCustomAlertVisible(false)}
      />
    </BodyScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 29
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  securityInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  securityItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  securityBullet: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.7,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  testButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  unavailableContainer: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 64,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  unavailableHint: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
});