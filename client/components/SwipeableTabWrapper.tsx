// components/SwipeableTabWrapper.tsx
import React, { useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['index', 'shopping-lists', 'inventory', 'product-browser', 'profile'];

interface SwipeableTabWrapperProps {
  children: React.ReactNode;
  currentTab: 'index' | 'shopping-lists' | 'inventory' | 'product-browser' | 'profile';
  disableSwipe?: boolean;
  onPrefetchNeighbors?: (prevTab: string | null, nextTab: string | null) => void;
}

export function SwipeableTabWrapper({ 
  children, 
  currentTab, 
  disableSwipe = false,
  onPrefetchNeighbors 
}: SwipeableTabWrapperProps) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const offsetX = useSharedValue(0);

  const currentIndex = useMemo(() => TABS.indexOf(currentTab), [currentTab]);

  // Prefetch adjacent tabs when component mounts or tab changes
  useEffect(() => {
    if (onPrefetchNeighbors) {
      const prevTab = currentIndex > 0 ? TABS[currentIndex - 1] : null;
      const nextTab = currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null;
      onPrefetchNeighbors(prevTab, nextTab);
    }
  }, [currentTab, currentIndex, onPrefetchNeighbors]);

  const navigateToTab = (tabName: string) => {
    // Use replace for instant transitions without animation
    router.replace(tabName === 'index' ? '/(index)/(tabs)' : `/(index)/(tabs)/${tabName}` as any);
  };

  const panGesture = Gesture.Pan()
    .enabled(!disableSwipe)
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .minDistance(10)
    .onStart(() => {
      'worklet';
      cancelAnimation(translateX);
      offsetX.value = translateX.value;
    })
    .onUpdate((event) => {
      'worklet';
      const canSwipeLeft = currentIndex < TABS.length - 1;
      const canSwipeRight = currentIndex > 0;

      const newTranslation = offsetX.value + event.translationX;

      if (newTranslation < 0 && canSwipeLeft) {
        translateX.value = newTranslation;
      } else if (newTranslation > 0 && canSwipeRight) {
        translateX.value = newTranslation;
      } else {
        translateX.value = newTranslation * 0.3;
      }
    })
    .onEnd((event) => {
      'worklet';
      const swipeThreshold = SCREEN_WIDTH * 0.25;
      const velocityThreshold = 800;

      const totalTranslation = offsetX.value + event.translationX;
      const shouldSwipeLeft =
        (totalTranslation < -swipeThreshold || event.velocityX < -velocityThreshold) &&
        currentIndex < TABS.length - 1;
      const shouldSwipeRight =
        (totalTranslation > swipeThreshold || event.velocityX > velocityThreshold) &&
        currentIndex > 0;

      if (shouldSwipeLeft) {
        const nextTab = TABS[currentIndex + 1];
        runOnJS(navigateToTab)(nextTab);

        translateX.value = withTiming(
          -SCREEN_WIDTH * 0.3,
          { duration: 100 },
          (finished) => {
            if (finished) {
              translateX.value = withSpring(0, {
                damping: 30,
                stiffness: 200,
                mass: 0.3,
              });
            }
          }
        );
      } else if (shouldSwipeRight) {
        const prevTab = TABS[currentIndex - 1];
        runOnJS(navigateToTab)(prevTab);

        translateX.value = withTiming(
          SCREEN_WIDTH * 0.3,
          { duration: 100 },
          (finished) => {
            if (finished) {
              translateX.value = withSpring(0, {
                damping: 30,
                stiffness: 200,
                mass: 0.3,
              });
            }
          }
        );
      } else {
        translateX.value = withSpring(0, {
          damping: 30,
          stiffness: 180,
          mass: 0.4,
          velocity: event.velocityX,
        });
      }

      offsetX.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const absTranslation = Math.abs(translateX.value);

    const opacity = interpolate(
      absTranslation,
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.97],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      absTranslation,
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.99],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value }, { scale: scale }] as any,
      opacity: opacity,
    };
  });

  // DON'T memoize children - let them update naturally when tab changes
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}