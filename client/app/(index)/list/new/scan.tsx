import { useEffect, useRef, useState } from "react";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { Animated, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/ui/button";
import { useJoinShoppingListCallback } from "@/stores/ShoppingListsStore";

const FRAME_SIZE = 260;
const LINE_HEIGHT = 3;

export default function ScanQRCode() {
  // permissions & navigation
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  // store callback
  const joinShoppingListCallback = useJoinShoppingListCallback();

  // local state & refs
  const [qrCodeDetected, setQrCodeDetected] = useState<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>
          We need your permission to show the camera
        </ThemedText>
        <Button onPress={requestPermission} variant="ghost">
          Grant permission
        </Button>
      </View>
    );
  }

  const extractListId = (qrCodeUrl: string): string | null => {
    const match = qrCodeUrl.match(/listId=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleBarcodeScanned = (barcodeScanningResult: BarcodeScanningResult) => {
    const qrCodeUrl = barcodeScanningResult.data;
    const listId = extractListId(qrCodeUrl);
    if (!listId) return;

    setQrCodeDetected(listId);

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setQrCodeDetected("");
      timeoutRef.current = null;
    }, 1000);
  };

  const handleConfirmJoinList = () => {
    joinShoppingListCallback(qrCodeDetected);
    if (router.canDismiss()) {
      router.dismiss();
    }
    router.push({
      pathname: "/list/[listId]",
      params: { listId: qrCodeDetected },
    });
  };

    const translateY = scanAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [15, FRAME_SIZE - LINE_HEIGHT - 15],
  });

  return (
    <CameraView
      style={styles.camera}
      facing="back"
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={handleBarcodeScanned}
    >
      <View style={styles.contentContainer}>
        {/* Darkened overlay */}
        <View style={styles.overlay} />

        {/* Scan area */}
        <View style={styles.scanArea}>
          {/* Corners */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <Animated.View
            style={[
              styles.scanningLine,
              { transform: [{ translateY }] },
            ]}
          />
        </View>

        {qrCodeDetected ? (
          <View style={styles.detectedContainer}>
            <ThemedText style={styles.detectedText} type="title">
              🥳 QR code detected!!!
            </ThemedText>
            <Button onPress={handleConfirmJoinList} variant="ghost">
              Join list
            </Button>
          </View>
        ) : (
          <ThemedText style={styles.instructionText} type="defaultSemiBold">
            Point the camera at a valid Shopping List QR Code
          </ThemedText>
        )}
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  camera: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detectedContainer: {
    backgroundColor: "black",
    borderRadius: 10,
    padding: 30,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  detectedText: {
    color: "white",
    marginBottom: 16,
  },
  instructionText: {
    color: "white",
    fontSize: 14,
    top: 80
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  opOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  middleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  scanArea: {
  width: FRAME_SIZE,
  height: FRAME_SIZE,
  overflow: "hidden",
  position: "relative",
},
  corner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderColor: "white",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanningLine: {
  alignSelf: 'center',
  top: 0,
  left: 0,
  width: "95%",
  height: LINE_HEIGHT,
  backgroundColor: "rgba(0,255,0,0.9)",
},
});