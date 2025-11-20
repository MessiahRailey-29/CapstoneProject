// hooks/useResetExpenseData.ts
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as UiReact from "tinybase/ui-react/with-schemas";
import { NoValuesSchema } from "tinybase/with-schemas";
import { useUser } from '@clerk/clerk-expo';
import CustomAlert from '@/components/ui/CustomAlert';

const PURCHASE_HISTORY_STORE_ID_PREFIX = "purchaseHistoryStore-";

// Define the schema to match PurchaseHistoryStore
const TABLES_SCHEMA = {
  purchases: {
    id: { type: "string" },
    name: { type: "string" },
    quantity: { type: "number" },
    units: { type: "string" },
    category: { type: "string", default: "" },
    selectedStore: { type: "string", default: "" },
    selectedPrice: { type: "number", default: 0 },
    databaseProductId: { type: "number", default: 0 },
    purchasedFrom: { type: "string" },
    purchasedAt: { type: "string" },
    purchasedBy: { type: "string" },
    notes: { type: "string", default: "" },
  },
} as const;

const { useStore } = UiReact as UiReact.WithSchemas<[typeof TABLES_SCHEMA, NoValuesSchema]>;

export const useResetExpenseData = () => {
  const { user } = useUser();
  const storeId = PURCHASE_HISTORY_STORE_ID_PREFIX + user?.id;
  const store = useStore(storeId);

    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertTitle, setCustomAlertTitle] = useState('');
    const [customAlertMessage, setCustomAlertMessage] = useState('');
    const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);
  
    const showCustomAlert = (title: string, message: string, buttons?: any[]) => {
      setCustomAlertTitle(title);
      setCustomAlertMessage(message);
      setCustomAlertButtons(
        buttons || [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
      );
      setCustomAlertVisible(true);
    };

  const resetAllExpenseData = useCallback(() => {
    showCustomAlert(
      "Reset All Expense Data",
      "This will permanently delete:\n\n• All purchase history\n• Monthly spending trends\n• Category breakdowns\n• Expense cards data\n\nYour shopping lists will NOT be affected.\n\nThis action cannot be undone. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset All Data",
          style: "destructive",
          onPress: () => {
            try {
              // Get all row IDs from the purchases table
              const rowIds = store?.getRowIds("purchases") || [];
              
              // Delete each row individually instead of deleting the entire table
              // This preserves the table structure and doesn't affect other tables
              rowIds.forEach((rowId) => {
                store?.delRow("purchases", rowId);
              });
              
              console.log(`✅ Reset ${rowIds.length} purchase records`);
              
              showCustomAlert(
                "Success",
                "All expense data has been cleared successfully. Your shopping lists remain intact.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('❌ Error resetting expense data:', error);
              showCustomAlert(
                "Error",
                "Failed to reset expense data. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  }, [store]);

  return { resetAllExpenseData };
};