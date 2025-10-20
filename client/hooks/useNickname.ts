import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const NICKNAME_STORAGE_KEY = 'user_nickname';
const NICKNAME_CHANGE_EVENT = 'nickname_changed';

// Simple event emitter for nickname changes
class NicknameEventEmitter {
    private listeners: Set<() => void> = new Set();

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit() {
        this.listeners.forEach(listener => listener());
    }
}

const nicknameEmitter = new NicknameEventEmitter();

export const useNickname = () => {
    const { user } = useUser();
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(true);

    const loadNickname = useCallback(async () => {
        try {
            if (user?.id) {
                const stored = await AsyncStorage.getItem(`${NICKNAME_STORAGE_KEY}_${user.id}`);
                if (stored) {
                    setNickname(stored);
                } else {
                    // Default to first name or email username
                    const defaultName = user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0] || '';
                    setNickname(defaultName);
                }
            }
        } catch (error) {
            console.error('Error loading nickname:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.firstName, user?.emailAddresses]);

    // Load nickname on mount and when user changes
    useEffect(() => {
        loadNickname();
    }, [loadNickname]);

    // Subscribe to nickname change events
    useEffect(() => {
        const unsubscribe = nicknameEmitter.subscribe(() => {
            loadNickname();
        });

        return () => {
            unsubscribe();
        };
    }, [loadNickname]);

    // Reload nickname when app comes to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                loadNickname();
            }
        });

        return () => {
            subscription?.remove();
        };
    }, [loadNickname]);

    const updateNickname = async (newNickname: string) => {
        try {
            if (user?.id && newNickname.trim()) {
                console.log('🔄 Updating nickname to:', newNickname.trim());
                await AsyncStorage.setItem(`${NICKNAME_STORAGE_KEY}_${user.id}`, newNickname.trim());
                setNickname(newNickname.trim());
                // Notify all listeners that nickname changed
                console.log('📢 Emitting nickname change event');
                nicknameEmitter.emit();
            }
        } catch (error) {
            console.error('Error updating nickname:', error);
            throw error;
        }
    };

    return {
        nickname: nickname || user?.firstName || 'Friend',
        loading,
        updateNickname,
        refresh: loadNickname,
    };
};
    
// Keep the old hook for backward compatibility
export const useUserIdAndNickname = () => {
    const { user } = useUser();
    const { nickname } = useNickname();

    return [user?.id, nickname] as const;
};