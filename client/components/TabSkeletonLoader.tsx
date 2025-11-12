// components/TabSkeletonLoader.tsx
import React from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface TabSkeletonLoaderProps {
  type?: 'home' | 'list' | 'inventory' | 'products' | 'profile';
}

export function TabSkeletonLoader({ type = 'home' }: TabSkeletonLoaderProps) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = createStyles(colors);

  const renderHomeSkeleton = () => (
    <View style={styles.container}>
      <Animated.View style={[styles.welcomeBox, { opacity }]} />
      <Animated.View style={[styles.chartBox, { opacity }]} />
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.cardBox, { opacity }]} />
        <Animated.View style={[styles.cardBox, { opacity }]} />
      </View>
    </View>
  );

  const renderListSkeleton = () => (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Animated.View key={i} style={[styles.listItemBox, { opacity }]} />
      ))}
    </View>
  );

  const renderInventorySkeleton = () => (
    <View style={styles.container}>
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.categoryBox, { opacity }]} />
        <Animated.View style={[styles.categoryBox, { opacity }]} />
      </View>
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.categoryBox, { opacity }]} />
        <Animated.View style={[styles.categoryBox, { opacity }]} />
      </View>
    </View>
  );

  const renderProductsSkeleton = () => (
    <View style={styles.container}>
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.productBox, { opacity }]} />
        <Animated.View style={[styles.productBox, { opacity }]} />
      </View>
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.productBox, { opacity }]} />
        <Animated.View style={[styles.productBox, { opacity }]} />
      </View>
    </View>
  );

  const renderProfileSkeleton = () => (
    <View style={styles.container}>
      <Animated.View style={[styles.profileBox, { opacity }]} />
      <Animated.View style={[styles.settingBox, { opacity }]} />
      <Animated.View style={[styles.settingBox, { opacity }]} />
    </View>
  );

  switch (type) {
    case 'home':
      return renderHomeSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'inventory':
      return renderInventorySkeleton();
    case 'products':
      return renderProductsSkeleton();
    case 'profile':
      return renderProfileSkeleton();
    default:
      return renderHomeSkeleton();
  }
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.mainBackground,
    },
    welcomeBox: {
      height: 80,
      backgroundColor: colors.borderColor,
      borderRadius: 12,
      marginBottom: 16,
    },
    chartBox: {
      height: 200,
      backgroundColor: colors.borderColor,
      borderRadius: 12,
      marginBottom: 16,
    },
    cardsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    cardBox: {
      flex: 1,
      height: 120,
      backgroundColor: colors.borderColor,
      borderRadius: 12,
    },
    listItemBox: {
      height: 80,
      backgroundColor: colors.borderColor,
      borderRadius: 12,
      marginBottom: 12,
    },
    categoryBox: {
      flex: 1,
      height: 160,
      backgroundColor: colors.borderColor,
      borderRadius: 20,
    },
    productBox: {
      flex: 1,
      height: 200,
      backgroundColor: colors.borderColor,
      borderRadius: 20,
    },
    profileBox: {
      height: 180,
      backgroundColor: colors.borderColor,
      borderRadius: 20,
      marginBottom: 16,
    },
    settingBox: {
      height: 60,
      backgroundColor: colors.borderColor,
      borderRadius: 12,
      marginBottom: 12,
    },
  });
}