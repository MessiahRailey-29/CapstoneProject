import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-expo';

export default function Homepage() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Home",
          headerLargeTitle: true,
        }} 
      />
      
      <BodyScrollView contentContainerStyle={styles.container}>
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome back, {user?.firstName || 'KUPAL'}!
          </ThemedText>
          <ThemedText style={styles.welcomeSubtext}>
            TINATAMAD AKO MAG DASHBOARD
          </ThemedText>
        </View>

        <View style={styles.placeholderSection}>
          <ThemedText type="subtitle">
            Ikulong na yan, mga kurakot
          </ThemedText>
          <ThemedText style={styles.placeholderText}>
            Jinggoy Estrada X Bato paygorn
          </ThemedText>
          
          <View style={styles.quickActions}>
            <Button 
              onPress={() => router.push('/shopping-lists')}
              style={styles.actionButton}
            >
              View Shopping Lists
            </Button>
            <Button 
              onPress={() => router.push('/list/new')}
              variant="outline"
              style={styles.actionButton}
            >
              Create New List
            </Button>
            <Button 
              onPress={() => router.push('/product-browser')}
              variant="outline"
              style={styles.actionButton}
            >
              Browse Products
            </Button>
          </View>
        </View>
      </BodyScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeText: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtext: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
  },
  placeholderSection: {
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 24,
  },
  quickActions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});