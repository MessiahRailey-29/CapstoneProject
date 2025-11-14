import React, { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Pressable,
    Platform,
    AccessibilityInfo,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface FloatingActionFabProps {
    onAction?: (actionKey: string) => void;
    position?: { bottom: number; right: number };
    fabSize?: number;
    bgColor?: string;
    iconColor?: string;
}

const ACTIONS = [
    { key: 'edit', label: 'Edit', icon: 'pencil', offset: -60 },
    { key: 'duplicates', label: 'Check Duplicates', icon: 'check-square', offset: -120 },
    { key: 'share', label: 'Share', icon: 'share-alt', offset: -180 },
    { key: 'add', label: 'Add', icon: 'plus', offset: -240 },
];

export default function FloatingActionFab({
    onAction = () => {},
    position = { bottom: 24, right: 16 },
    fabSize = 64,
    bgColor = '#16a34a',
    iconColor = '#fff',
}: FloatingActionFabProps) {
    const [open, setOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const theme = useColorScheme();
    const colors = Colors[theme ?? 'light'];
    const styles = createStyles(colors);

    const toggle = () => {
        const toValue = open ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start();
        setOpen(!open);

        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility(
                !open ? 'Actions opened' : 'Actions closed'
            );
        }
    };

    const handleAction = (key: string) => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
        setOpen(false);
        onAction(key);
    };

    const overlayOpacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
    });

    return (
        <View
            pointerEvents="box-none"
            style={[styles.container, { bottom: position.bottom, right: position.right }]}
        >
            {open && (
                <Pressable
                    accessibilityLabel="Close actions"
                    style={StyleSheet.absoluteFill}
                    onPress={toggle}
                >
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: 'transparent', opacity: overlayOpacity },
                        ]}
                    />
                </Pressable>
            )}

            <View style={styles.actionsWrap} pointerEvents="box-none">
                {ACTIONS.map((action) => (
                    <ActionItem
                        key={action.key}
                        action={action}
                        animation={animation}
                        onPress={handleAction}
                        styles={styles}
                        bgColor={bgColor}
                    />
                ))}

                {/* MAIN FAB BUTTON */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel={open ? 'Close menu' : 'Open menu'}
                    onPress={toggle}
                    style={[
                        styles.fab,
                        {
                            width: fabSize,
                            height: fabSize,
                            borderRadius: fabSize / 2,
                            backgroundColor: open ? '#dc2626' : bgColor,
                        },
                    ]}
                >
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    rotate: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '90deg'],
                                    }),
                                },
                            ],
                        }}
                    >
                        {open ? (
                            <FontAwesome name="close" size={28} color={iconColor} />
                        ) : (
                            <Entypo name="dots-three-vertical" size={28} color={iconColor} />
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

interface ActionItemProps {
    action: typeof ACTIONS[0];
    animation: Animated.Value;
    onPress: (key: string) => void;
    styles: ReturnType<typeof createStyles>;
    bgColor: string;
}

function ActionItem({
    action,
    animation,
    onPress,
    styles,
    bgColor,
}: ActionItemProps) {
    return (
        <Animated.View
            style={[
                styles.actionItem,
                {
                    transform: [
                        {
                            translateY: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, action.offset],
                            }),
                        },
                        { scale: animation },
                    ],
                    opacity: animation,
                },
            ]}
        >
            <View style={styles.actionLabelWrap}>
                <Text style={styles.actionLabel}>{action.label}</Text>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: bgColor }]}
                onPress={() => onPress(action.key)}
            >
                <FontAwesome name={action.icon as any} size={20} color="#fff" />
            </TouchableOpacity>
        </Animated.View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        container: {
            position: 'absolute',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            zIndex: 999,
        },
        actionsWrap: {
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        fab: {
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        actionItem: {
            position: 'absolute',
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: 4,
            marginBottom: 13,
        },
        actionLabelWrap: {
            width: 140,
            marginRight: 12,
            alignItems: 'flex-end',
        },
        actionLabel: {
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 8,
            fontSize: 12,
            textAlign: 'right',
        },
        actionButton: {
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
        },
    });
}
