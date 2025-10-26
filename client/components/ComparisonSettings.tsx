import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Switch, useColorScheme } from 'react-native';
import TextInput from '@/components/ui/text-input';
import { ComparisonOption, ComparisonSettings as IComparisonSettings } from '@/services/DuplicateDetectionService';
import { Colors } from '@/constants/Colors';

interface ComparisonSettingsProps {
  settings: IComparisonSettings;
  onSettingsChange: (settings: IComparisonSettings) => void;
}

const COMPARISON_OPTIONS = [
  { key: 'last-1', label: 'Last 1 list', description: 'Compare with most recent list only' },
  { key: 'last-3', label: 'Last 3 lists', description: 'Compare with 3 most recent lists' },
  { key: 'last-5', label: 'Last 5 lists', description: 'Compare with 5 most recent lists' },
  { key: 'all', label: 'All lists', description: 'Compare with all previous lists' },
  { key: 'custom', label: 'Custom timeframe', description: 'Set custom number of days' },
] as const;

export default function ComparisonSettings({
  settings,
  onSettingsChange
}: ComparisonSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSettings = (updates: Partial<IComparisonSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const handleOptionChange = (option: ComparisonOption) => {
    updateSettings({ option });
  };

  // color scheme for styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duplicate Detection Settings</Text>

      {/* Comparison Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compare Against</Text>
        {COMPARISON_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionButton,
              settings.option === option.key && styles.optionButtonSelected
            ]}
            onPress={() => handleOptionChange(option.key)}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.radioButton,
                settings.option === option.key && styles.radioButtonSelected
              ]}>
                {settings.option === option.key && <View style={styles.radioButtonInner} />}
              </View>
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionLabel,
                  settings.option === option.key && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Days Input */}
      {settings.option === 'custom' && (
        <View style={styles.section}>
          <TextInput
            label="Days to look back"
            placeholder="7"
            value={settings.customDays?.toString() || ''}
            onChangeText={(text) => updateSettings({ customDays: parseInt(text) || 7 })}
            keyboardType="numeric"
            containerStyle={styles.customInput}
          />
        </View>
      )}

      {/* Advanced Settings */}
      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Text style={styles.advancedToggleText}>
          Advanced Settings {showAdvanced ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.section}>
          {/* Include Completed Items */}
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Include purchased items</Text>
              <Text style={styles.switchDescription}>
                Also check against items that were already bought
              </Text>
            </View>
            <Switch
              value={settings.includeCompleted}
              onValueChange={(value) => updateSettings({ includeCompleted: value })}
            />
          </View>

          {/* Similarity Threshold */}
          <View style={styles.thresholdSection}>
            <Text style={styles.switchLabel}>Similarity Threshold: {Math.round(settings.similarityThreshold * 100)}%</Text>
            <Text style={styles.switchDescription}>
              How similar product names need to be to match
            </Text>
            <View style={styles.thresholdButtons}>
              {[0.6, 0.7, 0.8, 0.9].map(threshold => (
                <TouchableOpacity
                  key={threshold}
                  style={[
                    styles.thresholdButton,
                    settings.similarityThreshold === threshold && styles.thresholdButtonSelected
                  ]}
                  onPress={() => updateSettings({ similarityThreshold: threshold })}
                >
                  <Text style={[
                    styles.thresholdButtonText,
                    settings.similarityThreshold === threshold && styles.thresholdButtonTextSelected
                  ]}>
                    {Math.round(threshold * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Duplicate detection helps you avoid overbuying by comparing your current list with previous lists.
          Higher similarity thresholds are more strict.
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      padding: 16,
      margin: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      backgroundColor: colors.background,
      borderColor: colors.borderColor,
      borderWidth: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: colors.text,
    },
    optionButton: {
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    optionButtonSelected: {
      borderColor: colors.borderColor,
      backgroundColor: '#34C759',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#ccc',
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      borderColor: "#000",
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 180,
      backgroundColor: "#000",
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
    },
    optionLabelSelected: {
      color: colors.oppositeText,
    },
    optionDescription: {
      fontSize: 14,
      color: '#666',
    },
    customInput: {
      marginTop: 8,
    },
    advancedToggle: {
      padding: 12,
      backgroundColor: colors.oppositeBackground,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    advancedToggleText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#34C759',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      marginBottom: 16,
    },
    switchText: {
      flex: 1,
      marginRight: 12,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 2,
    },
    switchDescription: {
      fontSize: 14,
      color: '#666',
    },
    thresholdSection: {
      marginTop: 8,
    },
    thresholdButtons: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 8,
    },
    thresholdButton: {
      flex: 1,
      padding: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 6,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    thresholdButtonSelected: {
      backgroundColor: '#34C759',
      borderColor: '#34C759',
    },
    thresholdButtonText: {
      fontSize: 14,
      color: '#666',
      fontWeight: '500',
    },
    thresholdButtonTextSelected: {
      color: 'white',
    },
    infoBox: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#007AFF',
      borderColor: colors.borderColor,
      borderWidth: 1,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}