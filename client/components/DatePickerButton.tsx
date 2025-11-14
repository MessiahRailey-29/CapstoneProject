import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from "@/constants/Colors";

interface DatePickerButtonProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  borderColor?: string;
}

export default function DatePickerButton({ 
  selectedDate, 
  onDateChange, 
  borderColor = '#007AFF' 
}: DatePickerButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

      //color scheme and styles
      const scheme = useColorScheme();
      const colors = Colors[scheme ?? 'light'];
      const styles = createStyles(colors);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Set date';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      onDateChange(date);
    }
  };

  const handleClearDate = () => {
    onDateChange(null);
    setShowPicker(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.dateButton, { borderColor }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[ {color: colors.text
         }]}>
        {formatDate(selectedDate)}
        </Text>
      </TouchableOpacity>
      
      {showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
          
          {Platform.OS === 'ios' && (
            <View style={styles.iosButtons}>
              <TouchableOpacity onPress={handleClearDate} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowPicker(false)} 
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  dateButton: {
    color: colors.text,
    padding: 8,
    borderWidth: 2,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text
  },
  pickerContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  iosButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
}