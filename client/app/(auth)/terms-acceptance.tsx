import * as React from 'react';
import { View, StyleSheet, ScrollView, Alert, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

const TERMS_ACCEPTED_PREFIX = '@terms_accepted_';
const TERMS_DATE_PREFIX = '@terms_accepted_date_';

export default function TermsAcceptanceScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);
  const [isAccepting, setIsAccepting] = React.useState(false);

    // Color scheme and styles
    const scheme = useColorScheme();
    const colors = Colors[scheme ?? 'light'];
    const styles = createStyles(colors);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try logging in again.');
      return;
    }

    setIsAccepting(true);
    try {
      // Store acceptance in AsyncStorage with user-specific key
      const userTermsKey = `${TERMS_ACCEPTED_PREFIX}${userId}`;
      const userDateKey = `${TERMS_DATE_PREFIX}${userId}`;
      
      await AsyncStorage.setItem(userTermsKey, 'true');
      await AsyncStorage.setItem(userDateKey, new Date().toISOString());
      
      // Navigate to the main app
      router.replace('/(index)/(tabs)');
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
      Alert.alert('Error', 'Failed to save your agreement. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Terms Required',
      'You must accept the Terms and Conditions and Privacy Policy to use Waste Me Not.',
      [
        { text: 'Review Again', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Terms and Conditions</ThemedText>
        <ThemedText style={styles.subtitle}>
          Please read and accept our terms to continue
        </ThemedText>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
        >
          {/* TERMS AND CONDITIONS */}
          <ThemedText style={styles.sectionTitle}>TERMS AND CONDITIONS</ThemedText>
          <ThemedText style={styles.lastUpdated}>Last Updated: November 16, 2025</ThemedText>

          <ThemedText style={styles.heading}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            By accessing or using the Waste Me Not application ("App", "Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </ThemedText>

          <ThemedText style={styles.heading}>2. Description of Service</ThemedText>
          <ThemedText style={styles.paragraph}>
            Waste Me Not is a grocery shopping list management application that provides:
          </ThemedText>
          <ThemedText style={styles.listItem}>• Shopping list creation and management</ThemedText>
          <ThemedText style={styles.listItem}>• Product recommendations based on purchase history</ThemedText>
          <ThemedText style={styles.listItem}>• Expense tracking and analytics</ThemedText>
          <ThemedText style={styles.listItem}>• Push notifications and reminders</ThemedText>
          <ThemedText style={styles.listItem}>• Real-time synchronization across devices</ThemedText>
          <ThemedText style={styles.listItem}>• Collaboration features for shared shopping lists</ThemedText>
          <ThemedText style={styles.listItem}>• Store location information</ThemedText>

          <ThemedText style={styles.heading}>3. User Accounts and Registration</ThemedText>
          <ThemedText style={styles.subheading}>3.1 Account Security</ThemedText>
          <ThemedText style={styles.listItem}>• You are responsible for maintaining the confidentiality of your account credentials</ThemedText>
          <ThemedText style={styles.listItem}>• You may use biometric authentication (Face ID, fingerprint) for secure access</ThemedText>
          <ThemedText style={styles.listItem}>• You must notify us immediately of any unauthorized access to your account</ThemedText>

          <ThemedText style={styles.subheading}>3.2 Account Responsibilities</ThemedText>
          <ThemedText style={styles.listItem}>• You must provide accurate and complete information when using the Service</ThemedText>
          <ThemedText style={styles.listItem}>• You are responsible for all activities that occur under your account</ThemedText>
          <ThemedText style={styles.listItem}>• You must not share your account credentials with others</ThemedText>

          <ThemedText style={styles.heading}>4. User Conduct</ThemedText>
          <ThemedText style={styles.paragraph}>You agree NOT to:</ThemedText>
          <ThemedText style={styles.listItem}>• Use the Service for any illegal or unauthorized purpose</ThemedText>
          <ThemedText style={styles.listItem}>• Violate any laws in your jurisdiction</ThemedText>
          <ThemedText style={styles.listItem}>• Transmit any malicious code, viruses, or harmful data</ThemedText>
          <ThemedText style={styles.listItem}>• Attempt to gain unauthorized access to our systems</ThemedText>
          <ThemedText style={styles.listItem}>• Interfere with or disrupt the Service or servers</ThemedText>
          <ThemedText style={styles.listItem}>• Use automated scripts or bots without our permission</ThemedText>
          <ThemedText style={styles.listItem}>• Collect or harvest information about other users</ThemedText>

          <ThemedText style={styles.heading}>5. Data and Privacy</ThemedText>
          <ThemedText style={styles.subheading}>5.1 Your Data</ThemedText>
          <ThemedText style={styles.listItem}>• You retain all rights to the data you create (shopping lists, notes, preferences)</ThemedText>
          <ThemedText style={styles.listItem}>• We collect and process data as described in our Privacy Policy</ThemedText>
          <ThemedText style={styles.listItem}>• You grant us a license to use your data solely to provide and improve the Service</ThemedText>

          <ThemedText style={styles.subheading}>5.2 Synchronization</ThemedText>
          <ThemedText style={styles.listItem}>• Data synchronization occurs automatically across your devices</ThemedText>
          <ThemedText style={styles.listItem}>• Shared lists are accessible to all collaborators you invite</ThemedText>
          <ThemedText style={styles.listItem}>• You are responsible for managing collaborator access</ThemedText>

          <ThemedText style={styles.heading}>6. Intellectual Property</ThemedText>
          <ThemedText style={styles.subheading}>6.1 Our Rights</ThemedText>
          <ThemedText style={styles.paragraph}>
            The App, including its design, features, and content, is owned by us and protected by copyright and trademark laws. You may not copy, modify, distribute, or create derivative works without our permission.
          </ThemedText>

          <ThemedText style={styles.subheading}>6.2 Your Rights</ThemedText>
          <ThemedText style={styles.listItem}>• You retain ownership of the content you create</ThemedText>

          <ThemedText style={styles.heading}>7. Third-Party Services</ThemedText>
          <ThemedText style={styles.subheading}>7.1 Integrations</ThemedText>
          <ThemedText style={styles.listItem}>• The Service may integrate with third-party services (Firebase, MongoDB, etc.)</ThemedText>
          <ThemedText style={styles.listItem}>• We are not responsible for third-party service availability or performance</ThemedText>
          <ThemedText style={styles.listItem}>• Third-party services have their own terms and privacy policies</ThemedText>

          <ThemedText style={styles.heading}>8. Limitation of Liability</ThemedText>
          <ThemedText style={styles.paragraph}>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</ThemedText>
          <ThemedText style={styles.listItem}>• The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</ThemedText>
          <ThemedText style={styles.listItem}>• We do not guarantee uninterrupted, timely, secure, or error-free service</ThemedText>
          <ThemedText style={styles.listItem}>• We are not liable for any indirect, incidental, special, or consequential damages</ThemedText>

          <ThemedText style={styles.heading}>9. Termination</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may suspend or terminate your access for violations of these Terms. You may stop using the Service at any time and request account deletion by contacting us.
          </ThemedText>

          {/* PRIVACY POLICY */}
          <ThemedText style={[styles.sectionTitle, { marginTop: 32 }]}>PRIVACY POLICY</ThemedText>
          <ThemedText style={styles.lastUpdated}>Last Updated: November 16, 2025</ThemedText>

          <ThemedText style={styles.heading}>1. Introduction</ThemedText>
          <ThemedText style={styles.paragraph}>
            Welcome to Waste Me Not. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </ThemedText>

          <ThemedText style={styles.heading}>2. Information We Collect</ThemedText>
          <ThemedText style={styles.subheading}>2.1 Information You Provide Directly</ThemedText>
          <ThemedText style={styles.paragraph}>Account Information:</ThemedText>
          <ThemedText style={styles.listItem}>• User identification (user ID, nickname)</ThemedText>
          <ThemedText style={styles.listItem}>• Device information for synchronization</ThemedText>
          <ThemedText style={styles.listItem}>• Biometric authentication data (stored locally on your device only)</ThemedText>

          <ThemedText style={styles.paragraph}>Shopping List Data:</ThemedText>
          <ThemedText style={styles.listItem}>• Products you add to shopping lists</ThemedText>
          <ThemedText style={styles.listItem}>• Product names, quantities, prices, and categories</ThemedText>
          <ThemedText style={styles.listItem}>• Purchase dates and expense information</ThemedText>
          <ThemedText style={styles.listItem}>• Notes and preferences</ThemedText>

          <ThemedText style={styles.subheading}>2.2 Automatically Collected Information</ThemedText>
          <ThemedText style={styles.listItem}>• App features you use and usage patterns</ThemedText>
          <ThemedText style={styles.listItem}>• Device type and operating system</ThemedText>
          <ThemedText style={styles.listItem}>• App version and performance data</ThemedText>
          <ThemedText style={styles.listItem}>• IP address and network information</ThemedText>

          <ThemedText style={styles.heading}>3. How We Use Your Information</ThemedText>
          <ThemedText style={styles.paragraph}>We use your information to:</ThemedText>
          <ThemedText style={styles.listItem}>• Create and manage your account</ThemedText>
          <ThemedText style={styles.listItem}>• Synchronize data across your devices</ThemedText>
          <ThemedText style={styles.listItem}>• Enable real-time collaboration on shared lists</ThemedText>
          <ThemedText style={styles.listItem}>• Send push notifications and reminders</ThemedText>
          <ThemedText style={styles.listItem}>• Generate product recommendations based on your purchase history</ThemedText>
          <ThemedText style={styles.listItem}>• Provide personalized expense analytics</ThemedText>
          <ThemedText style={styles.listItem}>• Improve our Service and develop new features</ThemedText>

          <ThemedText style={styles.heading}>4. Machine Learning and Recommendations</ThemedText>

          <ThemedText style={styles.heading}>5. How We Share Your Information</ThemedText>
          <ThemedText style={styles.subheading}>5.1 With Collaborators</ThemedText>
          <ThemedText style={styles.paragraph}>
            When you share a shopping list, collaborators can see products on the shared list, notes, quantities, and purchase status.
          </ThemedText>

          <ThemedText style={styles.subheading}>5.2 Service Providers</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may share data with third-party service providers who assist us:
          </ThemedText>
          <ThemedText style={styles.listItem}>• Firebase (Google): Push notifications, analytics, authentication</ThemedText>
          <ThemedText style={styles.listItem}>• MongoDB Atlas: Database hosting and management</ThemedText>
          <ThemedText style={styles.paragraph}>
            These providers are contractually obligated to protect your data and use it only for services they provide to us.
          </ThemedText>

          <ThemedText style={styles.heading}>6. Data Security</ThemedText>
          <ThemedText style={styles.paragraph}>We implement appropriate security measures:</ThemedText>
          <ThemedText style={styles.listItem}>• Encryption: Data is encrypted in transit (HTTPS/WSS) and at rest</ThemedText>
          <ThemedText style={styles.listItem}>• Authentication: Secure authentication with optional biometric security</ThemedText>
          <ThemedText style={styles.listItem}>• Access Controls: Limited access to personal data</ThemedText>
          <ThemedText style={styles.listItem}>• Monitoring: Regular security audits and monitoring</ThemedText>

          <ThemedText style={styles.paragraph}>
            Biometric data (Face ID, fingerprint) is stored locally on your device only. We never receive or store your biometric information.
          </ThemedText>

          <ThemedText style={styles.heading}>7. Data Retention</ThemedText>
          <ThemedText style={styles.paragraph}>
            We retain your data while your account is active. You may request account deletion at any time. We will delete your data within 30 days, except data required for legal or legitimate business purposes.
          </ThemedText>

          <ThemedText style={styles.heading}>8. Your Privacy Rights</ThemedText>
          <ThemedText style={styles.listItem}>• Access and Portability: You can access and export your data</ThemedText>
          <ThemedText style={styles.listItem}>• Correction: You can update your information directly in the app</ThemedText>
          <ThemedText style={styles.listItem}>• Deletion: You can delete individual items, lists, or your entire account</ThemedText>
          <ThemedText style={styles.listItem}>• Opt-Out: Manage push notifications in device settings</ThemedText>
          <ThemedText style={styles.listItem}>• Data Sharing: You control who can access your shared lists</ThemedText>

          <ThemedText style={styles.heading}>9. Children's Privacy</ThemedText>
          <ThemedText style={styles.paragraph}>
            Waste Me Not is not intended for children under 13. We do not knowingly collect data from children under 13. If we learn we have collected data from a child under 13, we will delete it.
          </ThemedText>

          <ThemedText style={styles.heading}>10. Push Notifications</ThemedText>
          <ThemedText style={styles.paragraph}>
            You may receive push notifications for shopping reminders, shared list updates, product recommendations, and app updates. You can disable notifications in your device settings. We use Firebase Cloud Messaging to deliver notifications.
          </ThemedText>

          <ThemedText style={styles.heading}>11. Changes to This Privacy Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update this Privacy Policy periodically. We will notify you of material changes via in-app notification or email. Continued use after changes constitutes acceptance.
          </ThemedText>

          <ThemedText style={styles.heading}>12. Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at [Your Email].
          </ThemedText>

          <ThemedText style={styles.heading}>13. Consent</ThemedText>
          <ThemedText style={styles.paragraph}>
            By using Waste Me Not, you consent to:
          </ThemedText>
          <ThemedText style={styles.listItem}>• Collection and use of information as described</ThemedText>
          <ThemedText style={styles.listItem}>• Data processing for recommendations and analytics</ThemedText>
          <ThemedText style={styles.listItem}>• Data synchronization across your devices</ThemedText>
          <ThemedText style={styles.listItem}>• Push notifications (which you can disable)</ThemedText>

          {!hasScrolledToBottom && (
            <View style={styles.scrollIndicator}>
              <ThemedText style={styles.scrollIndicatorText}>
                ↓ Scroll to continue ↓
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleAccept}
          disabled={!hasScrolledToBottom || isAccepting}
          loading={isAccepting}
        >
          I Accept
        </Button>

        <Button
          onPress={handleDecline}
          variant="outline"
          disabled={isAccepting}
        >
          Decline
        </Button>

        <ThemedText style={styles.footerNote}>
          By accepting, you agree to both the Terms and Conditions and Privacy Policy
        </ThemedText>
      </View>
    </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBackground,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    opacity: 0.8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
    marginLeft: 8,
    opacity: 0.8,
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  scrollIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    backgroundColor: colors.background,
  },
  footerNote: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
});
}