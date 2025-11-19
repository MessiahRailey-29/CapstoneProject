import React, { useMemo, useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    BackHandler,
    useColorScheme
} from "react-native";
import { Colors } from "@/constants/Colors";

export interface AlertButton {
    text: string;
    onPress: () => void;
    type?: "default" | "cancel" | "danger";
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    buttons?: AlertButton[];
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    onClose,
    buttons = []
}) => {

    const theme = useColorScheme();
    const colors = Colors[theme ?? "light"];
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // ⭐ Keyboard Listener
    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });

        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (!visible) return;

        const onBack = () => {
            onClose();
            return true;
        };

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            onBack
        );

        return () => subscription.remove();


    },);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={() => {
            }}
        >
            <KeyboardAvoidingView
                style={styles.modalWrapper}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >

                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                <View style={[styles.centerWrapper, { marginBottom: keyboardHeight / 1.4 }]}>
                    <View style={styles.alertBox}>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonRow}>
                            {buttons.map((btn, i) => (
                                <Pressable
                                    key={i}
                                    style={[
                                        styles.button,
                                        btn.type === "cancel" && styles.cancelButton,
                                        btn.type === "danger" && styles.dangerButton,
                                    ]}
                                    onPress={() => {
                                        onClose();
                                        setTimeout(btn.onPress, 10);
                                    }}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        btn.type === "cancel" && styles.cancelButtonText
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                    </View>
                </View>

            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CustomAlert;

const createStyles = (colors: any) =>
    StyleSheet.create({
        modalWrapper: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        centerWrapper: {
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
        },
        alertBox: {
            width: "100%",
            maxWidth: 380,
            padding: 22,
            backgroundColor: "#fff",
            borderRadius: 18,
            alignItems: "center",
            elevation: 10,
        },
        title: {
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 8,
            textAlign: "center",
        },
        message: {
            fontSize: 16,
            opacity: 0.7,
            marginBottom: 20,
            textAlign: "center",
        },
        buttonRow: {
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
        },
        button: {
            backgroundColor: "#22c55e",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            minWidth: 90,
            alignItems: "center",
        },
        cancelButton: {
            backgroundColor: "#e5e7eb",
        },
        cancelButtonText: {
            color: "#374151",
        },
        dangerButton: {
            backgroundColor: "#dc2626",
        },
        buttonText: {
            color: "white",
            fontWeight: "600",
            fontSize: 15,
        },
    });
