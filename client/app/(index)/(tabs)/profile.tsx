import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useClerk, useUser } from '@clerk/clerk-expo';
import Button from '@/components/ui/button';
import { appleRed } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Alert, View, StyleSheet, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import { useNickname } from '@/hooks/useNickname';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useResetExpenseData } from '@/hooks/useResetExpenseData';
import * as Haptics from 'expo-haptics';

const PROFILE_PICTURE_KEY = 'user_profile_picture';

export default function ProfileScreen() {
    const { signOut } = useClerk();
    const { user } = useUser();
    const router = useRouter();
    const { nickname, updateNickname } = useNickname();
    const { resetAllExpenseData } = useResetExpenseData();
    const [isEditingNickname, setIsEditingNickname] = React.useState(false);
    const [tempNickname, setTempNickname] = React.useState('');
    const [profilePicture, setProfilePicture] = React.useState<string | null>(null);
    const [showAvatarOptions, setShowAvatarOptions] = React.useState(false);

    // Load profile picture on mount
    React.useEffect(() => {
        loadProfilePicture();
    }, [user?.id]);

    const loadProfilePicture = async () => {
        try {
            if (user?.id) {
                const stored = await AsyncStorage.getItem(`${PROFILE_PICTURE_KEY}_${user.id}`);
                if (stored) {
                    setProfilePicture(stored);
                }
            }
        } catch (error) {
            console.error('Error loading profile picture:', error);
        }
    };

    const saveProfilePicture = async (uri: string) => {
        try {
            if (user?.id) {
                await AsyncStorage.setItem(`${PROFILE_PICTURE_KEY}_${user.id}`, uri);
                setProfilePicture(uri);
            }
        } catch (error) {
            console.error('Error saving profile picture:', error);
        }
    };

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photos to change your profile picture.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await saveProfilePicture(result.assets[0].uri);
                setShowAvatarOptions(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your camera to take a photo.');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await saveProfilePicture(result.assets[0].uri);
                setShowAvatarOptions(false);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const removeProfilePicture = async () => {
        try {
            if (user?.id) {
                await AsyncStorage.removeItem(`${PROFILE_PICTURE_KEY}_${user.id}`);
                setProfilePicture(null);
                setShowAvatarOptions(false);
            }
        } catch (error) {
            console.error('Error removing profile picture:', error);
        }
    };

    const handleEditNickname = () => {
        setTempNickname(nickname);
        setIsEditingNickname(true);
    };

    const handleSaveNickname = async () => {
        if (tempNickname.trim()) {
            try {
                await updateNickname(tempNickname);
                setIsEditingNickname(false);
                Alert.alert('Success', 'Nickname updated successfully!');
            } catch (error) {
                console.error('Error saving nickname:', error);
                Alert.alert('Error', 'Failed to save nickname');
            }
        } else {
            Alert.alert('Error', 'Nickname cannot be empty');
        }
    };

    const HandleDeleteAccount = async () => {
        try {
            Alert.alert(
                "Delete account",
                "Are you sure you want to delete your account?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Delete",
                        onPress: async () => {
                            await user?.delete();
                            router.replace("/(auth)");
                        },
                        style: "destructive",
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to delete account");
            console.error(error);
        }
    };

    // Get user initials for avatar
    const getInitials = () => {
        const name = nickname || user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress;
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Format member since date
    const getMemberSince = () => {
        if (!user?.createdAt) return '';
        const date = new Date(user.createdAt);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const displayName = nickname || user?.fullName || user?.firstName || 'User';

    return (
        <BodyScrollView>
            {/* Enhanced Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    {/* Avatar */}
                    <TouchableOpacity 
                        style={styles.avatarContainer}
                        onPress={() => setShowAvatarOptions(true)}
                    >
                        <View style={styles.avatar}>
                            {profilePicture ? (
                                <Image 
                                    source={{ uri: profilePicture }} 
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <ThemedText style={styles.avatarText}>{getInitials()}</ThemedText>
                            )}
                        </View>
                        <View style={styles.cameraIconContainer}>
                            <ThemedText style={styles.cameraIcon}>📷</ThemedText>
                        </View>
                    </TouchableOpacity>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.nameContainer}>
                            <ThemedText style={styles.userName}>
                                {displayName}
                            </ThemedText>
                            <TouchableOpacity 
                                onPress={handleEditNickname}
                                style={styles.editButton}
                            >
                                <ThemedText style={styles.editIcon}>✏️</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.userEmail}>
                            {user?.emailAddresses[0]?.emailAddress}
                        </ThemedText>
                        <View style={styles.memberBadge}>
                            <ThemedText style={styles.memberBadgeText}>
                                🎉 Member since {getMemberSince()}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

                {/* Notification Settings */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push('/(index)/notification-settings')}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
                        <ThemedText style={styles.iconText}>🔔</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>
                            Notification Settings
                        </ThemedText>
                        <ThemedText style={styles.settingDescription}>
                            Manage alerts and reminders
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.chevron}>›</ThemedText>
                </TouchableOpacity>

                {/* Duplicate Detection Settings */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push('/(index)/duplicate-settings')}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                        <ThemedText style={styles.iconText}>⚠️</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>
                            Duplicate Detection
                        </ThemedText>
                        <ThemedText style={styles.settingDescription}>
                            Configure duplicate item warnings
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.chevron}>›</ThemedText>
                </TouchableOpacity>
            </View>


            {/* Data Management Section */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>

                {/* Reset Expense Data */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        if (process.env.EXPO_OS === "ios") {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        }
                        resetAllExpenseData();
                    }}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#FFEBEE' }]}>
                        <ThemedText style={styles.iconText}>🗑️</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>
                            Reset Expense Data
                        </ThemedText>
                        <ThemedText style={styles.settingDescription}>
                            Clear all purchase history and analytics
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.chevron}>›</ThemedText>
                </TouchableOpacity>
            </View>
            {/* Account Section */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Account</ThemedText>

                <View style={styles.accountButtons}>
                    <Button 
                        onPress={signOut} 
                        variant='ghost' 
                        textStyle={{ color: appleRed, fontSize: 16, fontWeight: '600' }}
                    >
                        Sign out
                    </Button>

                    <Button
                        onPress={HandleDeleteAccount}
                        variant="ghost"
                        textStyle={{ color: "#999", fontSize: 14 }}
                    >
                        Delete account
                    </Button>
                </View>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
                <ThemedText style={styles.appInfoText}>
                    Version 1.0.0
                </ThemedText>
            </View>

            {/* Edit Nickname Modal */}
            <Modal
                visible={isEditingNickname}
                transparent
                animationType="fade"
                onRequestClose={() => setIsEditingNickname(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsEditingNickname(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Edit Nickname</ThemedText>
                            <ThemedText style={styles.modalSubtitle}>
                                This name will appear on your homepage
                            </ThemedText>
                            
                            <TextInput
                                style={styles.input}
                                value={tempNickname}
                                onChangeText={setTempNickname}
                                placeholder="Enter your nickname"
                                placeholderTextColor="#999"
                                autoFocus
                                maxLength={30}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setIsEditingNickname(false)}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveNickname}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Avatar Options Modal */}
            <Modal
                visible={showAvatarOptions}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAvatarOptions(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.avatarModalContent}>
                        <ThemedText style={styles.modalTitle}>Profile Picture</ThemedText>
                        
                        <TouchableOpacity
                            style={styles.avatarOption}
                            onPress={takePhoto}
                        >
                            <ThemedText style={styles.avatarOptionIcon}>📷</ThemedText>
                            <ThemedText style={styles.avatarOptionText}>Take Photo</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.avatarOption}
                            onPress={pickImage}
                        >
                            <ThemedText style={styles.avatarOptionIcon}>🖼️</ThemedText>
                            <ThemedText style={styles.avatarOptionText}>Choose from Library</ThemedText>
                        </TouchableOpacity>

                        {profilePicture && (
                            <TouchableOpacity
                                style={[styles.avatarOption, styles.removeOption]}
                                onPress={removeProfilePicture}
                            >
                                <ThemedText style={styles.avatarOptionIcon}>🗑️</ThemedText>
                                <ThemedText style={styles.removeOptionText}>Remove Picture</ThemedText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
                            onPress={() => setShowAvatarOptions(false)}
                        >
                            <ThemedText lightColor="#000" darkColor="#fff" style={styles.cancelButtonText}>
                            Cancel
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </BodyScrollView>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cameraIcon: {
        fontSize: 16,
    },
    userInfo: {
        alignItems: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1a1a1a',
        marginRight: 8,
    },
    editButton: {
        padding: 4,
    },
    editIcon: {
        fontSize: 20,
    },
    userEmail: {
        fontSize: 15,
        color: '#666',
        marginBottom: 12,
    },
    memberBadge: {
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF20',
    },
    memberBadgeText: {
        fontSize: 13,
        color: '#007AFF',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e5e5e5',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
        backgroundColor: '#fff',
    },
    settingIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 24,
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        color: '#1a1a1a',
    },
    settingDescription: {
        fontSize: 13,
        color: '#666',
    },
    chevron: {
        fontSize: 28,
        color: '#c7c7cc',
        fontWeight: '300',
    },
    accountButtons: {
        paddingVertical: 8,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 32,
    },
    appInfoText: {
        fontSize: 12,
        color: '#999',
    },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
        avatarModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        color: '#1a1a1a',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 24,
        backgroundColor: '#f8f9fa',
        color: '#000',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    avatarOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarOptionIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    avatarOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    removeOption: {
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    removeOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#d32f2f',
    },
});