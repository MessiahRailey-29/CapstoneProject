import * as React from 'react';
import { View, StyleSheet, Alert, Switch, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { Button } from '@/components/ui/button';
import TextInput from '@/components/ui/text-input';
import { useUser } from '@clerk/clerk-expo';
import {
  checkBiometricCapability,
  getBiometricTypeName,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
  getStoredEmail,
  authenticateWithBiometrics,
} from '@/utils/biometricAuth';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BiometricSettingsScreen() {
  const { user } = useUser();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();
  
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState<'fingerprint' | 'face' | 'iris' | 'none'>('none');
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [storedEmail, setStoredEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  // For enabling biometric login
  const [showPasswordPrompt, setShowPasswordPrompt] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // For changing registered account
  const [isChangingAccount, setIsChangingAccount] = React.useState(false);

  // Load biometric capability and status
  React.useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    setLoading(true);
    try {
      const capability = await checkBiometricCapability();
      setBiometricAvailable(capability.isAvailable);
      setBiometricType(capability.biometricType);
      setIsEnrolled(capability.isEnrolled);

      const enabled = await isBiometricLoginEnabled();
      setIsEnabled(enabled);

      if (enabled) {
        const email = await getStoredEmail();
        setStoredEmail(email);
      }
    } catch (error) {
      console.error('Error loading biometric status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (value) {
      // Enable biometric login
      setShowPasswordPrompt(true);
    } else {
      // Disable biometric login
      Alert.alert(
        'Disable Biometric Login',
        'Are you sure you want to disable biometric login? You will need to enter your password next time.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: handleDisableBiometric,
          },
        ]
      );
    }
  };

  const handleEnableBiometric = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!user?.emailAddresses[0]?.emailAddress) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    setIsProcessing(true);

    try {
      const email = user.emailAddresses[0].emailAddress;
      
      // Enable biometric login with password
      const result = await enableBiometricLogin(email, password);

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const action = isChangingAccount ? 'updated' : 'enabled';
        const message = isChangingAccount 
          ? `${getBiometricTypeName(biometricType)} login has been updated for ${email}.`
          : `${getBiometricTypeName(biometricType)} login has been enabled for your account.`;
        
        Alert.alert(
          'Success',
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPasswordPrompt(false);
                setPassword('');
                setIsChangingAccount(false);
                loadBiometricStatus();
              },
            },
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', result.error || 'Failed to enable biometric login');
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', error.message || 'Failed to enable biometric login');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisableBiometric = async () => {
    setIsProcessing(true);
    
    try {
      await disableBiometricLogin();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Biometric login has been disabled');
      loadBiometricStatus();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error disabling biometric:', error);
      Alert.alert('Error', 'Failed to disable biometric login');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeAccount = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Change Registered Account',
      `Currently registered: ${storedEmail}\n\nTo change the account, you'll need to enter your password for the current account (${user?.emailAddresses[0]?.emailAddress}).`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            setIsChangingAccount(true);
            setShowPasswordPrompt(true);
          },
        },
      ]
    );
  };

  const handleTestBiometric = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await authenticateWithBiometrics(
      `Test ${getBiometricTypeName(biometricType)}`
    );

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Biometric authentication successful!');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed', result.error || 'Biometric authentication failed');
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <BodyScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </BodyScrollView>
    );
  }

  return (
    <>
      <BodyScrollView contentContainerStyle={(styles.container)}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Biometric Settings</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Manage biometric authentication for quick and secure login
          </ThemedText>
        </View>

        {/* Device Capability Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Device Information</ThemedText>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Biometric Hardware:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {biometricAvailable ? 'Available' : 'Not Available'}
            </ThemedText>
          </View>

          {biometricAvailable && (
            <>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Type:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {getBiometricTypeName(biometricType)}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Enrolled:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {isEnrolled ? 'Yes' : 'No'}
                </ThemedText>
              </View>
            </>
          )}
        </View>

        {/* Biometric Login Toggle */}
        {biometricAvailable && isEnrolled ? (
          <View style={styles.section}>
            <View style={styles.toggleSection}>
              <View style={styles.toggleContent}>
                <ThemedText style={styles.toggleTitle}>
                  Enable {getBiometricTypeName(biometricType)} Login
                </ThemedText>
                <ThemedText style={styles.toggleDescription}>
                  Sign in quickly using {getBiometricTypeName(biometricType).toLowerCase()}
                </ThemedText>
                {isEnabled && storedEmail && (
                  <ThemedText style={styles.storedEmailText}>
                    Enabled for: {storedEmail}
                  </ThemedText>
                )}
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggleBiometric}
                disabled={isProcessing}
                trackColor={{ false: '#767577', true: '#22c55e' }}
                thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Action Buttons */}
            {isEnabled && (
              <View style={styles.actionButtonsContainer}>
                <Button
                  onPress={handleTestBiometric}
                  variant="outline"
                  style={styles.testButton}
                >
                  Test {getBiometricTypeName(biometricType)}
                </Button>
                
                {storedEmail !== user?.emailAddresses[0]?.emailAddress && (
                  <Button
                    onPress={handleChangeAccount}
                    variant="outline"
                    style={styles.changeAccountButton}
                  >
                    Change Account
                  </Button>
                )}
              </View>
            )}
          </View>
        ) : (
          /* Not Available Message */
          <View style={styles.warningSection}>
            <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
            <ThemedText style={styles.warningText}>
              {!biometricAvailable
                ? 'Your device does not support biometric authentication.'
                : 'No biometric data is enrolled on this device. Please set up biometric authentication in your device settings.'}
            </ThemedText>
          </View>
        )}

        {/* Security Information */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.infoSectionTitle}>🔒 Security Information</ThemedText>
          <ThemedText style={styles.infoSectionText}>
            • Your biometric data never leaves your device
          </ThemedText>
          <ThemedText style={styles.infoSectionText}>
            • Credentials are stored securely using device encryption
          </ThemedText>
          <ThemedText style={styles.infoSectionText}>
            • You can disable biometric login at any time
          </ThemedText>
          <ThemedText style={styles.infoSectionText}>
            • Password login is always available as a backup
          </ThemedText>
        </View>
      </BodyScrollView>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {isChangingAccount ? 'Change' : 'Enable'} {getBiometricTypeName(biometricType)} Login
            </ThemedText>
            <ThemedText style={styles.modalDescription}>
              {isChangingAccount
                ? `Enter your password to update the registered account to ${user?.emailAddresses[0]?.emailAddress}. Your password will be stored securely on your device.`
                : 'Enter your password to enable biometric authentication. Your password will be stored securely on your device.'}
            </ThemedText>

            <TextInput
              value={password}
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={true}
              onChangeText={setPassword}
              autoFocus
            />

            <View style={styles.modalButtonContainer}>
              <Button
                onPress={() => {
                  setShowPasswordPrompt(false);
                  setPassword('');
                  setIsChangingAccount(false);
                }}
                variant="outline"
                style={styles.cancelButton}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              
              <Button
                onPress={handleEnableBiometric}
                loading={isProcessing}
                disabled={isProcessing || !password.trim()}
                style={styles.enableButton}
              >
                {isChangingAccount ? 'Update' : 'Enable'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.mainBackground,
      paddingBottom: 120

    },
    loadingText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      opacity: 0.7,
    },
    header: {
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 8,
      lineHeight: 36
    },
    headerSubtitle: {
      fontSize: 14,
      opacity: 0.7,
      lineHeight: 20,
    },
    section: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      opacity: 0.7,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    toggleSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleContent: {
      flex: 1,
      marginRight: 16,
    },
    toggleTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    toggleDescription: {
      fontSize: 13,
      opacity: 0.7,
      lineHeight: 18,
    },
    storedEmailText: {
      fontSize: 12,
      opacity: 0.6,
      marginTop: 8,
      fontStyle: 'italic',
    },
    actionButtonsContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      gap: 12,
    },
    testButton: {
      borderColor: '#22c55e',
    },
    changeAccountButton: {
      borderColor: '#3B82F6',
    },
    warningSection: {
      backgroundColor: '#FEF3C7',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: 4,
      borderLeftColor: '#F59E0B',
    },
    warningIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: '#92400E',
      lineHeight: 20,
    },
    infoSection: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    infoSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 12,
    },
    infoSectionText: {
      fontSize: 13,
      opacity: 0.7,
      lineHeight: 20,
      marginBottom: 8,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
      color: '#1a1a1a',
    },
    modalDescription: {
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
      color: '#1a1a1a',
    },
    modalButtonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
    },
    enableButton: {
      flex: 1,
      backgroundColor: '#22c55e',
    },
  });
}