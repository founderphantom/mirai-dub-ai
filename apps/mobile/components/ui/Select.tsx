import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  type ViewProps,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SelectProps extends Omit<ViewProps, "children"> {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function Select({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  error,
  disabled,
  className,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!error;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={className} {...props}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        className={`
          flex-row items-center justify-between
          h-11 px-3
          bg-white border rounded-lg
          ${hasError ? "border-error-500" : "border-neutral-300"}
          ${disabled ? "opacity-50" : ""}
        `}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ expanded: isOpen }}
      >
        <View className="flex-row items-center flex-1">
          {selectedOption?.icon && (
            <View className="mr-2">{selectedOption.icon}</View>
          )}
          <Text
            className={
              selectedOption
                ? "text-base text-neutral-900"
                : "text-base text-neutral-400"
            }
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>
      {error && <Text className="text-sm text-error-500 mt-1">{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-t-2xl max-h-[60%]">
            <View className="flex-row items-center justify-between p-4 border-b border-neutral-200">
              <Text className="text-lg font-semibold text-neutral-900">
                {label || "Select"}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-primary-500 font-medium">Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className={`
                    flex-row items-center px-4 py-3
                    ${item.value === value ? "bg-primary-50" : ""}
                  `}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: item.value === value }}
                >
                  {item.icon && <View className="mr-3">{item.icon}</View>}
                  <View className="flex-1">
                    <Text
                      className={`
                        text-base
                        ${item.value === value ? "text-primary-600 font-medium" : "text-neutral-900"}
                      `}
                    >
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text className="text-sm text-neutral-500">
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {item.value === value && (
                    <Check size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-neutral-100 mx-4" />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default Select;
