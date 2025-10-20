// app/(index)/duplicate-settings.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ComparisonSettings from '@/components/ComparisonSettings';
import { ComparisonSettings as IComparisonSettings } from '@/services/DuplicateDetectionService';
import { useUser } from '@clerk/clerk-expo';

export default function DuplicateSettingsScreen() {
  const { user } = useUser();
  const [settings, setSettings] = useState<IComparisonSettings>({
    option: 'last-3',
    customDays: 7,
    includeCompleted: false,
    similarityThreshold: 0.8,
  });
  const [loading, setLoading] = useState(true);

  // Load settings from storage/API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Load from AsyncStorage or your API
      // const savedSettings = await AsyncStorage.getItem('duplicateSettings');
      // if (savedSettings) {
      //   setSettings(JSON.parse(savedSettings));
      // }
      setLoading(false);
    } catch (error) {
      console.error('Error loading duplicate settings:', error);
      setLoading(false);
    }
  };

  const handleSettingsChange = async (newSettings: IComparisonSettings) => {
    setSettings(newSettings);
    
    try {
      // TODO: Save to AsyncStorage or your API
      // await AsyncStorage.setItem('duplicateSettings', JSON.stringify(newSettings));
      console.log('Duplicate settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving duplicate settings:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Duplicate Detection',
          presentation: 'modal',
        }}
      />

      <ScrollView style={styles.container}>
        <ComparisonSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />

        {/* Additional info section */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>How it works</ThemedText>
          <ThemedText style={styles.infoDescription}>
            When you add items to a new list, the app will check your previous lists 
            to help you avoid adding duplicate items. You can configure how far back 
            to look and how strict the matching should be.
          </ThemedText>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});