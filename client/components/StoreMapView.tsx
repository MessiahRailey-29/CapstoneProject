import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StoreLocation } from '@/constants/storeLocations';

interface StoreMapViewProps {
  stores: StoreLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  onStorePress?: (store: StoreLocation) => void;
}

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export default function StoreMapView({ 
  stores, 
  userLocation, 
  onStorePress 
}: StoreMapViewProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Fetch route from OSRM (Free, no API key needed!)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || stores.length === 0) {
        setRouteCoordinates([]);
        return;
      }

      setLoading(true);

      try {
        // Build coordinates string: lon,lat;lon,lat;...
        const coordinates = [
          `${userLocation.longitude},${userLocation.latitude}`,
          ...stores.map(store => `${store.longitude},${store.latitude}`)
        ].join(';');

        // OSRM API endpoint (free public server)
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

        console.log('🗺️ Fetching route from OSRM (free)...');

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Convert GeoJSON coordinates to React Native Maps format
          const points: RouteCoordinate[] = route.geometry.coordinates.map(
            (coord: [number, number]) => ({
              latitude: coord[1],  // GeoJSON is [lon, lat]
              longitude: coord[0],
            })
          );

          setRouteCoordinates(points);
          setDistance(route.distance / 1000); // Convert to km
          setDuration(route.duration / 60); // Convert to minutes
          
          console.log('✅ Route loaded with', points.length, 'points');
          console.log('📏 Distance:', (route.distance / 1000).toFixed(1), 'km');
          console.log('⏱️ Duration:', (route.duration / 60).toFixed(0), 'min');
        } else {
          console.error('❌ OSRM API error:', data.code, data.message);
          // Fallback to straight lines
          setRouteCoordinates([
            userLocation,
            ...stores.map(s => ({ latitude: s.latitude, longitude: s.longitude }))
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching route:', error);
        // Fallback to straight lines
        setRouteCoordinates([
          userLocation,
          ...stores.map(s => ({ latitude: s.latitude, longitude: s.longitude }))
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [userLocation, stores]);

  // Calculate map region to show all stores
  const getMapRegion = () => {
    if (!userLocation && stores.length === 0) {
      return {
        latitude: 14.3886,
        longitude: 121.0471,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const allLocations = [
      ...(userLocation ? [userLocation] : []),
      ...stores.map(s => ({ latitude: s.latitude, longitude: s.longitude })),
    ];

    const latitudes = allLocations.map(l => l.latitude);
    const longitudes = allLocations.map(l => l.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.5;
    const lonDelta = (maxLon - minLon) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lonDelta, 0.02),
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getMapRegion()}
        showsUserLocation={!!userLocation}
        showsMyLocationButton
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="blue"
          />
        )}

        {/* Store markers */}
        {stores.map((store, index) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            title={store.name}
            description={store.address}
            onPress={() => onStorePress?.(store)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerBadge}>
                <Text style={styles.markerNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.markerIcon}>{store.icon}</Text>
            </View>
          </Marker>
        ))}

        {/* Route polyline with real road directions */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      )}

      {/* Route info */}
      {!loading && distance > 0 && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeInfoText}>
            📏 {distance.toFixed(1)} km • ⏱️ {duration.toFixed(0)} min
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'blue' }]} />
          <Text style={styles.legendText}>Your Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>
            {routeCoordinates.length > 10 ? 'Road Route' : 'Direct Route'}
          </Text>
        </View>
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
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  markerNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  markerIcon: {
    fontSize: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  routeInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});