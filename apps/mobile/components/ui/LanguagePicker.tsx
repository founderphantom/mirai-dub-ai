import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Platform,
  type ViewProps,
} from "react-native";
import { ChevronDown, Check, Search, X } from "lucide-react-native";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface LanguagePickerProps extends Omit<ViewProps, "children"> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  excludeAuto?: boolean;
}

export function LanguagePicker({
  label,
  placeholder = "Select language",
  value,
  onChange,
  error,
  disabled,
  excludeAuto = false,
  className,
  ...props
}: LanguagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter languages based on excludeAuto prop
  const availableLanguages = useMemo(() => {
    return excludeAuto
      ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== "auto")
      : SUPPORTED_LANGUAGES;
  }, [excludeAuto]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableLanguages;
    }

    const query = searchQuery.toLowerCase();
    return availableLanguages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery, availableLanguages]);

  const selectedLanguage = availableLanguages.find((lang) => lang.code === value);
  const hasError = !!error;

  const handleSelect = (languageCode: string) => {
    onChange(languageCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  // Stop click propagation on web to prevent backdrop from closing modal
  const handleContentClick = useCallback((e: any) => {
    if (Platform.OS === 'web') {
      e.stopPropagation();
    }
  }, []);

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
          {selectedLanguage && (
            <Text className="text-lg mr-2">{selectedLanguage.flag}</Text>
          )}
          <Text
            className={
              selectedLanguage
                ? "text-base text-neutral-900"
                : "text-base text-neutral-400"
            }
            numberOfLines={1}
          >
            {selectedLanguage?.name || placeholder}
          </Text>
        </View>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>
      {error && <Text className="text-sm text-error-500 mt-1">{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={handleClose}
        >
          <View
            className="bg-white rounded-t-2xl"
            style={{ maxHeight: "80%" }}
            onStartShouldSetResponder={() => true}
            {...(Platform.OS === 'web' ? { onClick: handleContentClick } : {})}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-neutral-200">
              <Text className="text-lg font-semibold text-neutral-900">
                {label || "Select Language"}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-primary-500 font-medium">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View className="p-4 border-b border-neutral-100">
              <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-lg px-3 h-11">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-base text-neutral-900"
                  placeholder="Search languages..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    className="p-1"
                  >
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Language List */}
            {filteredLanguages.length > 0 ? (
              <FlatList
                data={filteredLanguages}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.code)}
                    className={`
                      flex-row items-center px-4 py-3
                      ${item.code === value ? "bg-primary-50" : ""}
                    `}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: item.code === value }}
                  >
                    <Text className="text-xl mr-3">{item.flag}</Text>
                    <View className="flex-1">
                      <Text
                        className={`
                          text-base
                          ${item.code === value ? "text-primary-600 font-medium" : "text-neutral-900"}
                        `}
                      >
                        {item.name}
                      </Text>
                      {item.nativeName !== item.name && (
                        <Text className="text-sm text-neutral-500">
                          {item.nativeName}
                        </Text>
                      )}
                    </View>
                    {item.code === value && (
                      <Check size={20} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View className="h-px bg-neutral-100 mx-4" />
                )}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View className="p-8 items-center">
                <Text className="text-neutral-500 text-base text-center">
                  No languages found for "{searchQuery}"
                </Text>
                <Text className="text-neutral-400 text-sm text-center mt-2">
                  Try a different search term
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default LanguagePicker;
