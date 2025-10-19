// server/src/models/notification.ts
import mongoose from 'mongoose';

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['shopping_reminder', 'low_stock', 'duplicate_warning', 'price_drop', 'shared_list_update']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    listId: { type: String },
    productId: { type: Number },
    productName: { type: String },
    scheduledDate: { type: Date },
    oldPrice: { type: Number },
    newPrice: { type: Number },
    store: { type: String },
  },
  isRead: { type: Boolean, default: false },
  isSent: { type: Boolean, default: false },
  scheduledFor: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: true }, // Auto-delete old notifications
});

// Notification Settings Schema
const NotificationSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  preferences: {
    shoppingReminders: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    duplicateWarnings: { type: Boolean, default: true },
    priceDrops: { type: Boolean, default: true },
    sharedListUpdates: { type: Boolean, default: true },
  },
  reminderTiming: {
    // How many hours before scheduled shopping date to remind
    hoursBefore: { type: Number, default: 2 },
    // Days of week to send reminders (0 = Sunday, 6 = Saturday)
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  },
  lowStockThreshold: {
    // Remind after X days since last purchase
    daysAfterLastPurchase: { type: Number, default: 14 },
  },
  pushToken: { type: String }, // Expo push notification token
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Shopping Schedule Schema - Track when users plan to shop
const ShoppingScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  listId: { type: String, required: true },
  scheduledDate: { type: Date, required: true, index: true },
  reminderSent: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Low Stock Tracking Schema
const LowStockTrackingSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  productId: { type: Number, required: true, index: true },
  productName: { type: String, required: true },
  lastPurchaseDate: { type: Date, required: true },
  averagePurchaseInterval: { type: Number }, // in days
  nextExpectedPurchase: { type: Date, index: true },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create TTL index for auto-deletion of old notifications (after 30 days)
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model('Notification', NotificationSchema);
export const NotificationSettings = mongoose.model('NotificationSettings', NotificationSettingsSchema);
export const ShoppingSchedule = mongoose.model('ShoppingSchedule', ShoppingScheduleSchema);
export const LowStockTracking = mongoose.model('LowStockTracking', LowStockTrackingSchema);

export type NotificationType = 'shopping_reminder' | 'low_stock' | 'duplicate_warning' | 'price_drop' | 'shared_list_update';

export interface INotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    listId?: string;
    productId?: number;
    productName?: string;
    scheduledDate?: Date;
    oldPrice?: number;
    newPrice?: number;
    store?: string;
  };
  isRead: boolean;
  isSent: boolean;
  scheduledFor?: Date;
  createdAt: Date;
  expiresAt?: Date;
}