import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Upload, Video, X, Film, FileVideo } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { FILE_CONSTRAINTS } from "@/lib/constants";

export interface SelectedVideo {
  uri: string;
  name: string;
  size: number;
  type?: string;
  duration?: number;
}

interface VideoUploaderProps {
  value?: SelectedVideo | null;
  onChange: (video: SelectedVideo | null) => void;
  error?: string;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoUploader({
  value,
  onChange,
  error,
  disabled,
}: VideoUploaderProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectVideo = async () => {
    if (disabled || isSelecting) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSelecting(true);

    try {
      // Try document picker first
      const result = await DocumentPicker.getDocumentAsync({
        type: FILE_CONSTRAINTS.supportedFormats,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsSelecting(false);
        return;
      }

      const asset = result.assets[0];

      // Check file size
      if (asset.size && asset.size > FILE_CONSTRAINTS.maxSizeBytes) {
        Alert.alert(
          "File Too Large",
          `Please select a video under ${FILE_CONSTRAINTS.maxSizeMB} MB.`,
          [{ text: "OK" }]
        );
        setIsSelecting(false);
        return;
      }

      onChange({
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        type: asset.mimeType,
      });
    } catch (err) {
      console.error("Error selecting video:", err);
      Alert.alert("Error", "Failed to select video. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(null);
  };

  const hasError = !!error;

  if (value) {
    return (
      <View className="relative">
        <View
          className={`
            bg-neutral-50 rounded-xl p-4 border
            ${hasError ? "border-error-300" : "border-neutral-200"}
          `}
        >
          <View className="flex-row items-center">
            {/* Video Icon */}
            <View className="w-16 h-16 bg-primary-100 rounded-lg items-center justify-center mr-4">
              <FileVideo size={32} color="#2563EB" />
            </View>

            {/* Video Info */}
            <View className="flex-1">
              <Text
                className="text-base font-medium text-neutral-900 mb-1"
                numberOfLines={2}
              >
                {value.name}
              </Text>
              <Text className="text-sm text-neutral-500">
                {formatFileSize(value.size)}
              </Text>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={handleRemove}
              className="w-8 h-8 items-center justify-center rounded-full bg-neutral-200"
              accessibilityLabel="Remove video"
            >
              <X size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
        {error && (
          <Text className="text-sm text-error-500 mt-1">{error}</Text>
        )}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handleSelectVideo}
        disabled={disabled || isSelecting}
        className={`
          border-2 border-dashed rounded-xl p-8
          items-center justify-center
          ${hasError ? "border-error-300 bg-error-50" : "border-neutral-300 bg-neutral-50"}
          ${disabled ? "opacity-50" : ""}
          active:bg-neutral-100
        `}
        accessibilityLabel="Select video to upload"
        accessibilityRole="button"
      >
        <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
          <Upload size={32} color="#2563EB" />
        </View>

        <Text className="text-lg font-semibold text-neutral-900 mb-1">
          {isSelecting ? "Selecting..." : "Select Video"}
        </Text>

        <Text className="text-sm text-neutral-500 text-center mb-4">
          Tap to browse your device
        </Text>

        <View className="flex-row items-center flex-wrap justify-center gap-2">
          <View className="bg-white px-2 py-1 rounded border border-neutral-200">
            <Text className="text-xs text-neutral-600">MP4</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded border border-neutral-200">
            <Text className="text-xs text-neutral-600">MOV</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded border border-neutral-200">
            <Text className="text-xs text-neutral-600">AVI</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded border border-neutral-200">
            <Text className="text-xs text-neutral-600">WEBM</Text>
          </View>
        </View>

        <Text className="text-xs text-neutral-400 mt-3">
          Max {FILE_CONSTRAINTS.maxSizeMB} MB • Up to {FILE_CONSTRAINTS.maxDurationMinutes} min
        </Text>
      </TouchableOpacity>
      {error && (
        <Text className="text-sm text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
}

export default VideoUploader;
