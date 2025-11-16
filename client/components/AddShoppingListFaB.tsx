import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View, TouchableOpacity, Platform, AccessibilityInfo } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface QuickAddFabProps {
    onPress?: () => void;
    position?: { bottom: number; right: number };
    fabSize?: number;
    bgColor?: string;
    iconColor?: string;
}

export default function QuickAddFab({
    onPress = () => {},
    position = { bottom: 24, right: 16 },
    fabSize = 64,
    bgColor = '#16a34a',
    iconColor = '#fff',
}: QuickAddFabProps) {
    const [pressed, setPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const theme = useColorScheme();
    const colors = Colors[theme ?? 'light'];
    const styles = createStyles(colors);

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
            style={[styles.container, { bottom: position.bottom, right: position.right }]}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="Add Shopping List"
                    onPress={handlePress}
                    style={[styles.fab, { width: fabSize, height: fabSize, borderRadius: fabSize / 2, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="playlist-plus" size={35} color={iconColor} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        container: {
            position: 'absolute',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            zIndex: 10,
        },
        fab: {
            bottom: 90,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
}
