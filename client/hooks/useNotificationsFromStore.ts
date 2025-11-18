// hooks/useNotificationsFromStore.ts
import { useCallback, useMemo, useEffect, useState } from 'react';
import { createMergeableStore, MergeableStore } from 'tinybase';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client';

// ✅ FIXED: Use the same env var as your other hooks
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.142:3000';
const API_URL = API_BASE_URL.replace('/api', ''); // Remove /api suffix if present
const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');

console.log('🔧 Notifications Config:', {
  API_BASE_URL,
  API_URL,
  WS_URL,
  wsFullUrl: `${WS_URL}/sync/globalNotificationsStore`
});

interface NotificationData {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  listId: string;
  productName: string;
  scheduledDate: string;
  isRead: boolean;
  createdAt: number;
  expiresAt: number;
}

// WebSocket adapter for React Native
class BrowserWebSocketAdapter {
  private ws: WebSocket;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(url: string) {
    console.log('🔌 Creating WebSocket adapter for:', url);
    this.ws = new WebSocket(url);
    
    this.ws.onopen = (event) => {
      console.log('✅ WebSocket connected to notifications store');
      this.listeners.get('open')?.forEach(fn => fn(event));
    };
    
    this.ws.onmessage = (event) => {
      console.log('📩 Received notification update');
      this.listeners.get('message')?.forEach(fn => fn(event));
    };
    
    this.ws.onerror = (event) => {
      console.error('❌ WebSocket error:', event);
      this.listeners.get('error')?.forEach(fn => fn(event));
    };
    
    this.ws.onclose = (event) => {
      console.log('👋 WebSocket closed');
      this.listeners.get('close')?.forEach(fn => fn(event));
    };
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  send(data: string | ArrayBuffer | ArrayBufferView | Blob) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  get readyState() {
    return this.ws.readyState;
  }

  get CONNECTING() { return WebSocket.CONNECTING; }
  get OPEN() { return WebSocket.OPEN; }
  get CLOSING() { return WebSocket.CLOSING; }
  get CLOSED() { return WebSocket.CLOSED; }
}

// Global store instance (singleton)
let globalNotificationsStoreInstance: MergeableStore | null = null;
let globalSynchronizer: any = null;
let isInitializing = false;

export function useNotificationsFromStore(userId: string) {
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [store, setStore] = useState<MergeableStore | null>(null);
  
  // Initialize store
  useEffect(() => {
    if (!globalNotificationsStoreInstance) {
      console.log('🆕 Creating global notifications store on client');
      globalNotificationsStoreInstance = createMergeableStore();
      console.log('✅ Global store instance created');
    }
    setStore(globalNotificationsStoreInstance);
  }, []);

  // Start synchronization
  useEffect(() => {
    if (!store || isInitializing || globalSynchronizer) {
      return;
    }
    
    isInitializing = true;
    
    console.log('🔌 Starting global notifications synchronizer...');
    const wsUrl = `${WS_URL}/sync/globalNotificationsStore`;
    console.log('📡 Connecting to:', wsUrl);
    
    const initSync = async () => {
      try {
        const adaptedWebSocket = new BrowserWebSocketAdapter(wsUrl) as any;
        
        console.log('🔄 Creating synchronizer...');
        const synchronizer = await createWsSynchronizer(store, adaptedWebSocket);
        
        console.log('▶️ Starting sync...');
        await synchronizer.startSync();
        
        console.log('✅ Global notifications store synchronized!');
        globalSynchronizer = synchronizer;
        setIsStoreReady(true);
        isInitializing = false;
        
      } catch (error: any) {
        console.error('❌ Failed to sync global notifications:', error);
        console.error('Error details:', error.message);
        isInitializing = false;
        setIsStoreReady(false);
      }
    };
    
    initSync();
    
    return () => {
      if (globalSynchronizer) {
        console.log('👋 Stopping global notifications synchronizer');
        try {
          globalSynchronizer.stopSync();
        } catch (e) {
          console.log('Error stopping sync:', e);
        }
        globalSynchronizer = null;
      }
      isInitializing = false;
    };
  }, [store]);
  
  // Listen to store changes
  const [allNotificationIds, setAllNotificationIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (!store || !isStoreReady) {
      return;
    }
    
    console.log('👂 Setting up store listener...');
    
    const updateNotificationIds = () => {
      const table = store.getTable('notifications');
      const ids = Object.keys(table);
      console.log(`📊 Notification IDs updated: ${ids.length} total`);
      setAllNotificationIds(ids);
    };
    
    updateNotificationIds();
    
    const listenerId = store.addTablesListener(() => {
      console.log('🔔 Store changed - updating notification IDs');
      updateNotificationIds();
    });
    
    return () => {
      store.delListener(listenerId);
    };
  }, [store, isStoreReady]);
  
  // Filter to user's notifications
  const userNotificationIds = useMemo(() => {
    if (!store || !isStoreReady) return [];
    
    const now = Date.now();
    const filtered = allNotificationIds.filter(id => {
      const row = store.getRow('notifications', id) as any;
      if (!row) return false;
      return row.userId === userId && row.expiresAt > now;
    });
    
    console.log(`👤 Filtered notifications for ${userId}: ${filtered.length} of ${allNotificationIds.length}`);
    return filtered;
  }, [allNotificationIds, userId, store, isStoreReady]);
  
  // Get notification data
  const notifications = useMemo(() => {
    if (!store || !isStoreReady) return [];
    
    const notifs = userNotificationIds.map(id => {
      const row = store.getRow('notifications', id) as any;
      return {
        id,
        ...row
      } as NotificationData;
    }).sort((a, b) => b.createdAt - a.createdAt);
    
    console.log(`📋 Returning ${notifs.length} notifications`);
    return notifs;
  }, [userNotificationIds, store, isStoreReady]);
  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);
  
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);
  
  const markAsRead = useCallback((notificationId: string) => {
    if (!store) return;
    console.log(`✔ Marking ${notificationId} as read`);
    store.setCell('notifications', notificationId, 'isRead', true);
  }, [store]);
  
  const markAllAsRead = useCallback(() => {
    if (!store) return;
    console.log(`✔ Marking all ${userNotificationIds.length} as read`);
    userNotificationIds.forEach(id => {
      store.setCell('notifications', id, 'isRead', true);
    });
  }, [store, userNotificationIds]);
  
  const deleteNotification = useCallback((notificationId: string) => {
    if (!store) return;
    console.log(`🗑️ Deleting ${notificationId}`);
    store.setCell('notifications', notificationId, 'expiresAt', Date.now() - 1);
  }, [store]);
  
  const clearAllNotifications = useCallback(() => {
    if (!store) return;
    console.log(`🗑️ Clearing all ${userNotificationIds.length} notifications`);
    const now = Date.now() - 1;
    userNotificationIds.forEach(id => {
      store.setCell('notifications', id, 'expiresAt', now);
    });
  }, [store, userNotificationIds]);
  
  const hasUnreadByType = useCallback((type: string) => {
    return notifications.some(n => !n.isRead && n.type === type);
  }, [notifications]);
  
  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);
  
  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isStoreReady,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    hasUnreadByType,
    getNotificationsByType,
  };
}

export function getGlobalNotificationsStore(): MergeableStore | null {
  return globalNotificationsStoreInstance;
}