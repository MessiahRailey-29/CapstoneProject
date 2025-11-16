import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useClerk, useUser } from '@clerk/clerk-expo';
import Button from '@/components/ui/button';
import { appleRed } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Alert, View, StyleSheet, TouchableOpacity, Image, useColorScheme, Text, Modal, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo } from 'react';
import { useResetExpenseData } from '@/hooks/useResetExpenseData';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { signOut } = useClerk();
    const { user } = useUser();
    const router = useRouter();
    const { resetAllExpenseData } = useResetExpenseData();
    const [profilePicture, setProfilePicture] = React.useState<string | null>(null);
    const [showAvatarOptions, setShowAvatarOptions] = React.useState(false);
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);
    const [showNameEdit, setShowNameEdit] = React.useState(false);
    const [editedFirstName, setEditedFirstName] = React.useState('');
    const [editedLastName, setEditedLastName] = React.useState('');
    const [isSavingName, setIsSavingName] = React.useState(false);

    // Load profile picture from Clerk's imageUrl
    React.useEffect(() => {
        if (user?.imageUrl) {
            setProfilePicture(user.imageUrl);
        }
    }, [user?.imageUrl]);

    const saveProfilePicture = async (uri: string) => {
        try {
            if (!user) {
                console.error('❌ No user found');
                Alert.alert('Error', 'No user found. Please try logging out and back in.');
                return;
            }
            
            setIsUploadingImage(true);
            console.log('📸 Uploading profile picture...');
            
            const filename = uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            
            const file = {
                uri: uri,
                type: type,
                name: filename,
            } as any;
            
            await user.setProfileImage({ file });
            
            console.log('✅ Profile picture uploaded successfully');
            
            await user.reload();
            setProfilePicture(user.imageUrl);
            
            Alert.alert('Success', 'Profile picture updated!');
        } catch (error: any) {
            console.error('❌ Error saving profile picture:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            Alert.alert('Error', `Failed to save profile picture: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photos to change your profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
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
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your camera to take a photo.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
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
            if (user) {
                await user.setProfileImage({ file: null });
                await user.reload();
                
                setProfilePicture(null);
                setShowAvatarOptions(false);
                Alert.alert('Success', 'Profile picture removed');
            }
        } catch (error) {
            console.error('Error removing profile picture:', error);
            Alert.alert('Error', 'Failed to remove profile picture');
        }
    };

    const openNameEdit = () => {
        const metaFirstName = user?.unsafeMetadata?.firstName as string;
        const metaLastName = user?.unsafeMetadata?.lastName as string;
        
        setEditedFirstName(metaFirstName || user?.firstName || '');
        setEditedLastName(metaLastName || user?.lastName || '');
        setShowNameEdit(true);
    };

    const saveName = async () => {
        try {
            if (!user) {
                Alert.alert('Error', 'No user found');
                return;
            }

            if (!editedFirstName.trim() || !editedLastName.trim()) {
                Alert.alert('Error', 'Please enter both first and last name');
                return;
            }

            setIsSavingName(true);

            // Update user metadata with new names
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    firstName: editedFirstName.trim(),
                    lastName: editedLastName.trim(),
                },
            });

            await user.reload();
            setShowNameEdit(false);
            Alert.alert('Success', 'Name updated successfully!');
        } catch (error: any) {
            console.error('Error saving name:', error);
            Alert.alert('Error', `Failed to update name: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSavingName(false);
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
        // Try metadata first
        const metaFirstName = user?.unsafeMetadata?.firstName as string;
        const metaLastName = user?.unsafeMetadata?.lastName as string;
        
        if (metaFirstName && metaLastName) {
            return `${metaFirstName[0]}${metaLastName[0]}`.toUpperCase();
        }
        
        // Fallback to Clerk's built-in fields
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        
        const name = user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress;
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

    // Get full name for display
    const getFullName = () => {
        // Try to get from metadata first
        const metaFirstName = user?.unsafeMetadata?.firstName as string;
        const metaLastName = user?.unsafeMetadata?.lastName as string;
        
        if (metaFirstName && metaLastName) {
            return `${metaFirstName} ${metaLastName}`;
        }
        
        // Fallback to Clerk's built-in fields
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.fullName || user?.firstName || 'User';
    };
    
    const insets = useSafeAreaInsets();
    const theme = useColorScheme();
    const colors = Colors[theme ?? 'light'];
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <BodyScrollView contentContainerStyle={{backgroundColor: colors.mainBackground, paddingBottom: insets.bottom + 130}}>
            {/* Enhanced Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    {/* Avatar */}
                    <TouchableOpacity 
                        style={styles.avatarContainer}
                        onPress={() => setShowAvatarOptions(true)}
                        disabled={isUploadingImage}
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
                            {isUploadingImage && (
                                <View style={styles.uploadingOverlay}>
                                    <ThemedText style={styles.uploadingText}>⏳</ThemedText>
                                </View>
                            )}
                        </View>
                        <View style={styles.cameraIconContainer}>
                            <ThemedText style={styles.cameraIcon}>📷</ThemedText>
                        </View>
                    </TouchableOpacity>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.nameContainer}>
                            <ThemedText style={styles.fullName}>
                                {getFullName()}
                            </ThemedText>
                            <TouchableOpacity 
                                style={styles.editNameButton}
                                onPress={openNameEdit}
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

                {/* Biometric Settings */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push('/(index)/biometric-settings' as any)}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#E0F2FF' }]}>
                        <ThemedText style={styles.iconText}>🔐</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>Biometric Login</ThemedText>
                        <ThemedText style={styles.settingDescription}>Face ID, Touch ID, and fingerprint</ThemedText>
                    </View>
                    <ThemedText style={styles.chevron}>›</ThemedText>
                </TouchableOpacity>

                {/* Notification Settings */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push('/(index)/notification-settings')}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                        <ThemedText style={styles.iconText}>🔔</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
                        <ThemedText style={styles.settingDescription}>Manage reminder preferences</ThemedText>
                    </View>
                    <ThemedText style={styles.chevron}>›</ThemedText>
                </TouchableOpacity>

                {/* Duplication Settings */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push('/(index)/duplicate-settings' as any)}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
                        <ThemedText style={styles.iconText}>🔄</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>Duplicate Detection</ThemedText>
                        <ThemedText style={styles.settingDescription}>Control duplicate expense alerts</ThemedText>
                    </View>
                    <ThemedText style={styles.chevron}>›</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Account</ThemedText>

                {/* Sign Out Button */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        await signOut();
                        router.replace("/(auth)/intro");
                    }}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#FFF9E6' }]}>
                        <ThemedText style={styles.iconText}>🚪</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={styles.settingLabel}>Sign Out</ThemedText>
                        <ThemedText style={styles.settingDescription}>Log out of your account</ThemedText>
                    </View>
                </TouchableOpacity>

                {/* Delete Account Button */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        HandleDeleteAccount();
                    }}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#FFEBEE' }]}>
                        <ThemedText style={styles.iconText}>⚠️</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={[styles.settingLabel, { color: appleRed }]}>Delete Account</ThemedText>
                        <ThemedText style={styles.settingDescription}>Permanently remove your account</ThemedText>
                    </View>
                </TouchableOpacity>

                {/* Reset Expense Data Button */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert(
                            "Reset Expense Data",
                            "Are you sure you want to delete all expense data? This action cannot be undone.",
                            [
                                {
                                    text: "Cancel",
                                    style: "cancel",
                                },
                                {
                                    text: "Reset",
                                    onPress: async () => {
                                        try {
                                            await resetAllExpenseData();
                                            Alert.alert("Success", "All expense data has been reset");
                                        } catch (error) {
                                            Alert.alert("Error", "Failed to reset expense data");
                                            console.error(error);
                                        }
                                    },
                                    style: "destructive",
                                },
                            ]
                        );
                    }}
                >
                    <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                        <ThemedText style={styles.iconText}>🗑️</ThemedText>
                    </View>
                    <View style={styles.settingContent}>
                        <ThemedText style={[styles.settingLabel, { color: '#FF9800' }]}>Reset Expense Data</ThemedText>
                        <ThemedText style={styles.settingDescription}>Delete all expense records</ThemedText>
                    </View>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
                <ThemedText style={styles.appInfoText}>
                    WasteMeNot
                </ThemedText>
            </View>

            {/* Avatar Options Modal */}
            <Modal
                visible={showAvatarOptions}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAvatarOptions(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAvatarOptions(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.avatarModalContent}>
                            <ThemedText style={styles.modalTitle}>Profile Picture</ThemedText>
                            
                            <TouchableOpacity 
                                style={styles.avatarOption}
                                onPress={pickImage}
                            >
                                <ThemedText style={styles.avatarOptionIcon}>📷</ThemedText>
                                <ThemedText style={styles.avatarOptionText}>Choose from Library</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.avatarOption}
                                onPress={takePhoto}
                            >
                                <ThemedText style={styles.avatarOptionIcon}>📸</ThemedText>
                                <ThemedText style={styles.avatarOptionText}>Take Photo</ThemedText>
                            </TouchableOpacity>

                            {profilePicture && (
                                <TouchableOpacity 
                                    style={[styles.avatarOption, styles.removeOption]}
                                    onPress={removeProfilePicture}
                                >
                                    <ThemedText style={styles.avatarOptionIcon}>🗑️</ThemedText>
                                    <ThemedText style={styles.removeOptionText}>Remove Photo</ThemedText>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { marginTop: 12, width: '100%' }]}
                                onPress={() => setShowAvatarOptions(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Name Edit Modal */}
            <Modal
                visible={showNameEdit}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNameEdit(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowNameEdit(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.avatarModalContent}>
                            <ThemedText style={styles.modalTitle}>Edit Name</ThemedText>
                            
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    value={editedFirstName}
                                    onChangeText={setEditedFirstName}
                                    placeholder="Enter first name"
                                    placeholderTextColor="#999"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    value={editedLastName}
                                    onChangeText={setEditedLastName}
                                    placeholder="Enter last name"
                                    placeholderTextColor="#999"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton, { flex: 1, marginRight: 8 }]}
                                    onPress={() => setShowNameEdit(false)}
                                    disabled={isSavingName}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton, { flex: 1, marginLeft: 8 }]}
                                    onPress={saveName}
                                    disabled={isSavingName}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {isSavingName ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </BodyScrollView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    profileCard: {
        backgroundColor: colors.background,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.borderColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderColor: colors.borderColor,
        borderWidth: 0.7,
    },
    profileHeader: {
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
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
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    uploadingText: {
        fontSize: 32,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#007AFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cameraIcon: {
        fontSize: 18,
    },
    userInfo: {
        alignItems: 'center',
        width: '100%',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fullName: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 40,
    },
    editNameButton: {
        marginLeft: 8,
        padding: 4,
    },
    editIcon: {
        fontSize: 20,
    },
    userEmail: {
        fontSize: 15,
        color: colors.text,
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
    section: {
        backgroundColor: colors.background,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.borderColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderColor: colors.borderColor,
        borderWidth: 0.7,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
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
        backgroundColor: colors.background,
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
        color: colors.text
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        color: colors.text
    },
    settingDescription: {
        fontSize: 13,
        color: colors.text
    },
    chevron: {
        fontSize: 28,
        color: '#c7c7cc',
        fontWeight: '300',
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
    avatarModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 50,
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
        marginBottom: 20,
        textAlign: 'center',
        color: '#1a1a1a',
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
        width: '100%',
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
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 8,
    },
    modalButton: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    cancelButton: {
        padding: 12,
        backgroundColor: '#ff4646ff',
        borderWidth: 2,
        borderColor: 'red',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});