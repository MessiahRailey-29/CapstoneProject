import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

interface BudgetInputProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
  currency?: string;
  borderColor?: string;
}

const BUDGET_SUGGESTIONS = [500, 1000, 1500, 2000, 3000, 5000];

export default function BudgetInput({
  budget,
  onBudgetChange,
  currency = "₱",
  borderColor = "#007AFF",
}: BudgetInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleInputChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, ""); // only digits
    const numericValue = cleanValue === "" ? 0 : Number(cleanValue);

    console.log("💰 handleInputChange parsed:", {
      value,
      cleanValue,
      numericValue,
    });

    onBudgetChange(numericValue);
  };

  const handleSuggestionPress = (amount: number) => {
    console.log("💡 Suggestion pressed:", amount);
    onBudgetChange(amount);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.currencyContainer}>
          <Text style={[styles.currencySymbol, { color: borderColor }]}>
            {currency}
          </Text>
        </View>
        <TextInput
          placeholder="0"
          value={budget > 0 ? budget.toString() : ""}
          onChangeText={handleInputChange}
          keyboardType="numeric"
          style={[
            styles.inputField,
            styles.budgetInput,
            { color: borderColor, borderColor },
          ]}
          onFocus={() => setShowSuggestions(true)}
        />
        <TouchableOpacity
          onPress={() => setShowSuggestions(!showSuggestions)}
          style={[styles.suggestionButton, { borderColor }]}
        >
          <Text style={[styles.suggestionButtonText, { color: borderColor }]}>
            {showSuggestions ? "−" : "+"}
          </Text>
        </TouchableOpacity>
      </View>

      {budget > 0 && (
        <Text style={styles.budgetDisplay}>
          Budget: {currency}
          {formatCurrency(budget)}
        </Text>
      )}

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>Quick amounts:</Text>
          <View style={styles.suggestionsList}>
            {BUDGET_SUGGESTIONS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.suggestionChip,
                  budget === amount && styles.selectedSuggestion,
                ]}
                onPress={() => handleSuggestionPress(amount)}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    budget === amount && styles.selectedSuggestionText,
                  ]}
                >
                  {currency}
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyContainer: {
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
  },
  inputField: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 0,
    padding: 12,
    textAlign: "center",
  },
  budgetInput: {
    fontSize: 24,
    fontWeight: "bold",
  },
  suggestionButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  suggestionButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  budgetDisplay: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  suggestionsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#e9ecef",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  selectedSuggestion: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  suggestionText: {
    fontSize: 12,
    color: "#495057",
    fontWeight: "500",
  },
  selectedSuggestionText: {
    color: "white",
  },
});
