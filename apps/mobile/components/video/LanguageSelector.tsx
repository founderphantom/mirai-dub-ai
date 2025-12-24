import React from "react";
import { View, Text } from "react-native";
import { ArrowRight, Languages } from "lucide-react-native";
import { Select, type SelectOption } from "@/components/ui/Select";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  sourceError?: string;
  targetError?: string;
  disabled?: boolean;
}

// Convert supported languages to select options
const sourceLanguageOptions: SelectOption[] = SUPPORTED_LANGUAGES.map((lang) => ({
  value: lang.code,
  label: `${lang.flag} ${lang.name}`,
  description: lang.nativeName,
  icon: <Text className="text-xl">{lang.flag}</Text>,
}));

// Target languages exclude auto-detect
const targetLanguageOptions: SelectOption[] = SUPPORTED_LANGUAGES
  .filter((lang) => lang.code !== "auto")
  .map((lang) => ({
    value: lang.code,
    label: `${lang.flag} ${lang.name}`,
    description: lang.nativeName,
    icon: <Text className="text-xl">{lang.flag}</Text>,
  }));

export function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  sourceError,
  targetError,
  disabled,
}: LanguageSelectorProps) {
  return (
    <View className="bg-white rounded-xl p-4 border border-neutral-200">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Languages size={20} color="#3B82F6" />
        <Text className="text-base font-semibold text-neutral-900 ml-2">
          Languages
        </Text>
      </View>

      {/* Language Selection */}
      <View className="flex-row items-end">
        {/* Source Language */}
        <View className="flex-1">
          <Select
            label="From"
            placeholder="Select language"
            options={sourceLanguageOptions}
            value={sourceLanguage}
            onChange={onSourceChange}
            error={sourceError}
            disabled={disabled}
          />
        </View>

        {/* Arrow */}
        <View className="w-12 items-center justify-center pb-3">
          <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center">
            <ArrowRight size={16} color="#2563EB" />
          </View>
        </View>

        {/* Target Language */}
        <View className="flex-1">
          <Select
            label="To"
            placeholder="Select language"
            options={targetLanguageOptions}
            value={targetLanguage}
            onChange={onTargetChange}
            error={targetError}
            disabled={disabled}
          />
        </View>
      </View>

      {/* Helper Text */}
      <Text className="text-xs text-neutral-500 mt-3 text-center">
        Auto-detect will identify the spoken language in your video
      </Text>
    </View>
  );
}

export default LanguageSelector;
