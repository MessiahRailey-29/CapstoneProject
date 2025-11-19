import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { StoreLocation } from '@/constants/storeLocations';

interface StoreMapViewProps {
  stores: StoreLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  onStorePress?: (store: StoreLocation) => void;
}

export default function StoreMapView({ 
  stores, 
  userLocation, 
  onStorePress 
}: StoreMapViewProps) {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Update map when stores or location changes
    if (webViewRef.current && (stores.length > 0 || userLocation)) {
      const storesData = JSON.stringify(stores);
      const locationData = JSON.stringify(userLocation);
      
      webViewRef.current.injectJavaScript(`
        updateMap(${storesData}, ${locationData});
        true;
      `);
    }
  }, [stores, userLocation]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'storePress' && onStorePress) {
        const store = stores.find(s => s.id === data.storeId);
        if (store) {
          onStorePress(store);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    
    .custom-marker {
      background: white;
      border: 3px solid #007AFF;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    
    .marker-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #007AFF;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
    }
    
    .user-marker {
      background: #007AFF;
      border: 3px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    .route-info {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.95);
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .route-info-text {
      font-size: 14px;
      font-weight: 700;
      color: #007AFF;
      text-align: center;
    }
    
    .loading {
      display: none;
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 12px;
      font-weight: 600;
      color: #007AFF;
    }
    
    .loading.active { display: block; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="route-info" id="routeInfo" style="display:none;">
    <div class="route-info-text" id="routeInfoText"></div>
  </div>
  <div class="loading" id="loading">Loading route...</div>
  
  <script>
    // Initialize map
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([14.3886, 121.0471], 13);
    
    // Add OpenStreetMap tiles (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    let routeLayer = null;
    let markers = [];
    
    async function updateMap(stores, userLocation) {
      // Clear existing markers and route
      markers.forEach(m => map.removeLayer(m));
      markers = [];
      if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
      }
      
      if (!stores || stores.length === 0) return;
      
      // Add user location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon
        }).addTo(map);
        
        userMarker.bindPopup('<b>You are here</b>');
        markers.push(userMarker);
      }
      
      // Add store markers
      stores.forEach((store, index) => {
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: \`
            <div style="position:relative;">
              <div class="marker-badge">\${index + 1}</div>
              <span>\${store.icon}</span>
            </div>
          \`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });
        
        const marker = L.marker([store.latitude, store.longitude], {
          icon: markerIcon
        }).addTo(map);
        
        marker.bindPopup(\`
          <b>\${store.name}</b><br>
          \${store.address}
        \`);
        
        marker.on('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'storePress',
            storeId: store.id
          }));
        });
        
        markers.push(marker);
      });
      
      // Fit bounds to show all markers
      const bounds = L.latLngBounds([
        ...(userLocation ? [[userLocation.latitude, userLocation.longitude]] : []),
        ...stores.map(s => [s.latitude, s.longitude])
      ]);
      
      map.fitBounds(bounds, { padding: [50, 50] });
      
      // Fetch and draw route
      if (userLocation && stores.length > 0) {
        await fetchRoute(userLocation, stores);
      }
    }
    
    async function fetchRoute(userLocation, stores) {
      const loading = document.getElementById('loading');
      const routeInfo = document.getElementById('routeInfo');
      const routeInfoText = document.getElementById('routeInfoText');
      
      loading.classList.add('active');
      routeInfo.style.display = 'none';
      
      try {
        // Build coordinates string for OSRM
        const coordinates = [
          \`\${userLocation.longitude},\${userLocation.latitude}\`,
          ...stores.map(store => \`\${store.longitude},\${store.latitude}\`)
        ].join(';');
        
        const url = \`https://router.project-osrm.org/route/v1/driving/\${coordinates}?overview=full&geometries=geojson\`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Draw route on map
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          
          routeLayer = L.polyline(coordinates, {
            color: '#007AFF',
            weight: 4,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);
          
          console.log('✅ Route loaded:', distance, 'km', duration, 'min');
        } else {
          console.error('❌ OSRM error:', data.code);
          // Draw straight lines as fallback
          const coords = [
            [userLocation.latitude, userLocation.longitude],
            ...stores.map(s => [s.latitude, s.longitude])
          ];
          
          routeLayer = L.polyline(coords, {
            color: '#007AFF',
            weight: 3,
            opacity: 0.6,
            dashArray: '10, 10'
          }).addTo(map);
        }
      } catch (error) {
        console.error('❌ Route fetch error:', error);
      } finally {
        loading.classList.remove('active');
      }
    }
    
    // Make updateMap available globally
    window.updateMap = updateMap;
    
    // Initial load
    const initialStores = ${JSON.stringify(stores)};
    const initialLocation = ${JSON.stringify(userLocation)};
    updateMap(initialStores, initialLocation);
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
      />
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
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});