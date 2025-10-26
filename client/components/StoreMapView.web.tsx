import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StoreLocation } from '@/constants/storeLocations';

interface StoreMapViewProps {
  stores: StoreLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  onStorePress?: (store: StoreLocation) => void;
}

/**
 * Web version of StoreMapView
 * Note: react-native-maps doesn't work on web, so we show a placeholder
 * This component only renders on native (iOS/Android) where maps work properly
 */
export default function StoreMapView({ stores, userLocation }: StoreMapViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.subtitle}>
          Maps are only available on mobile devices
        </Text>
        <Text style={styles.info}>
          {stores.length} store{stores.length !== 1 ? 's' : ''} in your route
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  info: {
    fontSize: 12,
    color: '#999',
  },
});