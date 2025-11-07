import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Linking, Platform, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { StoreLocation } from '@/constants/storeLocations';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import Svg, { Circle, Line, Text as SvgText, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 250;

interface StoreMapViewProps {
  stores: StoreLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  onStorePress?: (store: StoreLocation) => void;
}

interface RouteInfo {
  distance: number;
  duration: number;
}

export default function StoreMapView({ 
  stores, 
  userLocation, 
  onStorePress 
}: StoreMapViewProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [mapError, setMapError] = useState(false);

  // Generate static map URL using Mapbox
  useEffect(() => {
    if (!userLocation || stores.length === 0) return;

    setMapError(false);

    // Calculate center and bounds
    const lats = [userLocation.latitude, ...stores.map(s => s.latitude)];
    const lons = [userLocation.longitude, ...stores.map(s => s.longitude)];
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    
    // Calculate appropriate zoom level based on distance
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lonDiff = Math.max(...lons) - Math.min(...lons);
    const maxDiff = Math.max(latDiff, lonDiff);
    
    // Zoom calculation
    let zoom = 13;
    if (maxDiff > 0.5) zoom = 10;
    else if (maxDiff > 0.2) zoom = 11;
    else if (maxDiff > 0.1) zoom = 12;
    else if (maxDiff > 0.05) zoom = 13;
    else zoom = 14;
    
    const mapWidth = Math.floor(SCREEN_WIDTH);
    const mapHeight = MAP_HEIGHT;
    
    // Use MapBox Static API
    const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+007AFF(${userLocation.longitude},${userLocation.latitude})${
      stores.map((s, i) => `,pin-s-${i + 1}+FF3B30(${s.longitude},${s.latitude})`).join('')
    }/${centerLon},${centerLat},${zoom},0/${mapWidth}x${mapHeight}@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
    
    setMapUrl(url);
  }, [userLocation, stores]);

  // Fetch route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || stores.length === 0) {
        setRouteInfo(null);
        return;
      }

      setLoading(true);

      try {
        // Build coordinates string: lon,lat;lon,lat;...
        const coordinates = [
          `${userLocation.longitude},${userLocation.latitude}`,
          ...stores.map(store => `${store.longitude},${store.latitude}`)
        ].join(';');

        // OSRM API endpoint
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          
          setRouteInfo({
            distance: route.distance / 1000, // Convert to km
            duration: route.duration / 60, // Convert to minutes
          });
        } else {
          // Calculate straight-line distance as fallback
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            stores[0].latitude,
            stores[0].longitude
          );
          setRouteInfo({
            distance: dist,
            duration: (dist / 40) * 60, // Rough estimate: 40 km/h average
          });
        }
      } catch (error) {
        // Calculate straight-line distance as fallback
        if (stores.length > 0) {
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            stores[0].latitude,
            stores[0].longitude
          );
          setRouteInfo({
            distance: dist,
            duration: (dist / 40) * 60,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [userLocation, stores]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Handle store selection
  const handleStorePress = (store: StoreLocation) => {
    setSelectedStore(store);
    onStorePress?.(store);
  };

  // Render simple SVG map as fallback
  const renderSimpleMap = () => {
    if (!userLocation || stores.length === 0) return null;

    const lats = [userLocation.latitude, ...stores.map(s => s.latitude)];
    const lons = [userLocation.longitude, ...stores.map(s => s.longitude)];
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    const padding = 50;
    const mapWidth = SCREEN_WIDTH;
    const mapHeight = MAP_HEIGHT;
    
    // Convert lat/lon to x/y coordinates
    const toX = (lon: number) => {
      const range = maxLon - minLon;
      if (range === 0) return mapWidth / 2;
      return padding + ((lon - minLon) / range) * (mapWidth - 2 * padding);
    };
    
    const toY = (lat: number) => {
      const range = maxLat - minLat;
      if (range === 0) return mapHeight / 2;
      return mapHeight - padding - ((lat - minLat) / range) * (mapHeight - 2 * padding);
    };
    
    const userX = toX(userLocation.longitude);
    const userY = toY(userLocation.latitude);
    
    return (
      <Svg width={mapWidth} height={mapHeight} style={styles.svgMap}>
        {/* Background with subtle gradient effect */}
        <Rect width={mapWidth} height={mapHeight} fill="#E8F4F8" />
        
        {/* Draw lines from user to each store */}
        {stores.map((store, index) => {
          const storeX = toX(store.longitude);
          const storeY = toY(store.latitude);
          return (
            <Line
              key={`line-${index}`}
              x1={userX}
              y1={userY}
              x2={storeX}
              y2={storeY}
              stroke="#007AFF"
              strokeWidth="2"
              strokeDasharray="8,4"
              opacity={0.3}
            />
          );
        })}
        
        {/* Draw store markers */}
        {stores.map((store, index) => {
          const storeX = toX(store.longitude);
          const storeY = toY(store.latitude);
          return (
            <React.Fragment key={`store-${index}`}>
              {/* Shadow */}
              <Circle
                cx={storeX}
                cy={storeY + 2}
                r="22"
                fill="#000"
                opacity={0.15}
              />
              {/* Marker */}
              <Circle
                cx={storeX}
                cy={storeY}
                r="22"
                fill="#FF3B30"
                stroke="#fff"
                strokeWidth="3"
              />
              <SvgText
                x={storeX}
                y={storeY + 7}
                fill="#fff"
                fontSize="15"
                fontWeight="bold"
                textAnchor="middle"
              >
                {index + 1}
              </SvgText>
            </React.Fragment>
          );
        })}
        
        {/* Draw user location marker with shadow */}
        <Circle
          cx={userX}
          cy={userY + 2}
          r="26"
          fill="#000"
          opacity={0.15}
        />
        <Circle
          cx={userX}
          cy={userY}
          r="26"
          fill="#007AFF"
          stroke="#fff"
          strokeWidth="4"
        />
        <Circle
          cx={userX}
          cy={userY}
          r="10"
          fill="#fff"
        />
      </Svg>
    );
  };

  // Open in native maps app
  const openInMaps = () => {
    if (!userLocation || stores.length === 0) return;

    const waypoints = stores.map(s => `${s.latitude},${s.longitude}`).join('|');
    const origin = `${userLocation.latitude},${userLocation.longitude}`;

    let url = '';
    if (Platform.OS === 'ios') {
      url = `maps://maps.apple.com/?saddr=${origin}&daddr=${waypoints}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${waypoints}&travelmode=driving`;
    }

    Linking.openURL(url).catch(err => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${waypoints}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Map View - Full Width */}
      <View style={styles.mapContainer}>
        {!mapError && mapUrl ? (
          <Image 
            source={{ uri: mapUrl }} 
            style={styles.map}
            resizeMode="cover"
            onError={() => setMapError(true)}
          />
        ) : mapError || !mapUrl ? (
          renderSimpleMap()
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.placeholderText}>Loading map...</Text>
          </View>
        )}
        
        {/* Compact Legend Overlay */}
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />
            <Text style={styles.legendLabel}>You</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
            <Text style={styles.legendLabel}>Stores</Text>
          </View>
        </View>
      </View>

      {/* Compact Route Info */}
      <View style={styles.infoBar}>
        <View style={styles.statsRow}>
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.infoText}>Calculating route...</Text>
            </>
          ) : routeInfo ? (
            <>
              <Text style={styles.statText}>📍 {routeInfo.distance.toFixed(1)} km</Text>
              <View style={styles.separator} />
              <Text style={styles.statText}>⏱️ ~{routeInfo.duration.toFixed(0)} min</Text>
            </>
          ) : null}
        </View>
        <Pressable onPress={openInMaps} style={styles.navButton}>
          <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={18} color="#007AFF" />
          <Text style={styles.navButtonText}>Navigate</Text>
        </Pressable>
      </View>

      {/* Store List */}
      <View style={styles.storeListContainer}>
        <Text style={styles.sectionTitle}>
          {stores.length} {stores.length === 1 ? 'Stop' : 'Stops'}
        </Text>
        
        {stores.map((store, index) => {
          const distance = userLocation
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                store.latitude,
                store.longitude
              )
            : 0;

          return (
            <Pressable
              key={store.id}
              style={({ pressed }) => [
                styles.storeCard,
                selectedStore?.id === store.id && styles.storeCardSelected,
                pressed && styles.storeCardPressed
              ]}
              onPress={() => handleStorePress(store)}
            >
              <View style={styles.storeBadge}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>

              <View style={styles.storeDetails}>
                <View style={styles.storeRow}>
                  <Text style={styles.storeIcon}>{store.icon}</Text>
                  <ThemedText style={styles.storeName} numberOfLines={1}>
                    {store.name}
                  </ThemedText>
                </View>
                <Text style={styles.storeAddress} numberOfLines={1}>
                  {store.address}
                </Text>
                {distance > 0 && (
                  <Text style={styles.distance}>{distance.toFixed(1)} km away</Text>
                )}
              </View>

              <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  mapContainer: {
    height: MAP_HEIGHT,
    backgroundColor: '#E8F4F8',
    position: 'relative',
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  svgMap: {
    backgroundColor: '#E8F4F8',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  legend: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendLabel: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  separator: {
    width: 1,
    height: 14,
    backgroundColor: '#C7C7CC',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  storeListContainer: {
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  storeCardSelected: {
    backgroundColor: '#F0F8FF',
  },
  storeCardPressed: {
    backgroundColor: '#F9F9F9',
  },
  storeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  storeDetails: {
    flex: 1,
    gap: 4,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeIcon: {
    fontSize: 18,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  storeAddress: {
    fontSize: 13,
    color: '#8E8E93',
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
});