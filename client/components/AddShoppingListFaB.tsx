import React, { useRef, useState } from 'react';
import { 
    Animated, 
    StyleSheet, 
    View, 
    TouchableOpacity, 
    Platform, 
    AccessibilityInfo,
    useWindowDimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { serializableMappingCache } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLOATING_TAB_BAR_HEIGHT } from '@/app/(index)/(tabs)/_layout';

interface QuickAddFabProps {
    onPress?: () => void;
    position?: { bottom: number; right: number };
    sizeMultiplier?: number;
    bgColor?: string;
    iconColor?: string;
    tabBarHeight?: number;
}

export default function QuickAddFab({
    onPress = () => {},
    position = { bottom: 24, right: 16 },
    tabBarHeight = 80,
    sizeMultiplier = 0.16,
    bgColor = '#16a34a',
    iconColor = '#fff',
}: QuickAddFabProps) {
    const [pressed, setPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current
    
    const { width } = useWindowDimensions();
    const fabSize = Math.min(72, width * sizeMultiplier);
    const extraOffset = tabBarHeight + 16;
    const insets = useSafeAreaInsets();


    //color schemes and styles
    const theme = useColorScheme();
    const colors = Colors[theme ?? 'light'];
    const styles = createStyles(colors, fabSize);

    const handlePress = () => {
        // small press animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility('Add Shopping List button pressed');
        }

        onPress();
    };

    return (
        <View
            pointerEvents="box-none"
            style={[styles.container, { bottom: FLOATING_TAB_BAR_HEIGHT + insets.bottom + 32, right: position.right }]}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="Add Shopping List"
                    onPress={handlePress}
                    style={[styles.fab]}
                >
                    <MaterialCommunityIcons name="playlist-plus" size={fabSize * 0.55} color={iconColor} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

function createStyles(colors: any, fabSize) {
    return StyleSheet.create({
        container: {
            position: 'absolute',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            zIndex: 50,
        },
        fab: {
            height: fabSize,
            width: fabSize,
            borderRadius: fabSize /2,
            backgroundColor: colors.tint,
            alignItems: 'center',
            justifyContent: 'center',

            shadowColor: '#000',
            shadowOpacity: 0.22,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
        },
    });
}
