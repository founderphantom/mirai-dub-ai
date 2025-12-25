import React from "react";
import { View, Text } from "react-native";
import { ArrowRight, Languages } from "lucide-react-native";
import { LanguagePicker } from "@/components/ui/LanguagePicker";

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  sourceError?: string;
  targetError?: string;
  disabled?: boolean;
}

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
          <LanguagePicker
            label="From"
            placeholder="Select language"
            value={sourceLanguage}
            onChange={onSourceChange}
            error={sourceError}
            disabled={disabled}
            excludeAuto={false}
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
          <LanguagePicker
            label="To"
            placeholder="Select language"
            value={targetLanguage}
            onChange={onTargetChange}
            error={targetError}
            disabled={disabled}
            excludeAuto={true}
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
