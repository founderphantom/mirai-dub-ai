import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Play, Volume2, VolumeX } from "lucide-react-native";

interface VideoPreviewProps {
  thumbnailUri: string;
  duration?: number;
  title?: string;
  onPress?: () => void;
  showPlayButton?: boolean;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const aspectRatioStyles = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
};

export function VideoPreview({
  thumbnailUri,
  duration,
  title,
  onPress,
  showPlayButton = true,
  aspectRatio = "16:9",
  className,
}: VideoPreviewProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      className={`relative overflow-hidden rounded-xl ${className || ""}`}
      activeOpacity={0.9}
      accessibilityLabel={title ? `Video: ${title}` : "Video preview"}
      accessibilityRole={onPress ? "button" : "image"}
    >
      <Image
        source={{ uri: thumbnailUri }}
        className={`w-full ${aspectRatioStyles[aspectRatio]}`}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <View className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Play Button */}
      {showPlayButton && onPress && (
        <View className="absolute inset-0 items-center justify-center">
          <View className="bg-white/90 w-16 h-16 rounded-full items-center justify-center shadow-lg">
            <Play size={28} color="#111827" fill="#111827" className="ml-1" />
          </View>
        </View>
      )}

      {/* Duration Badge */}
      {duration !== undefined && (
        <View className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded">
          <Text className="text-white text-sm font-medium">
            {formatDuration(duration)}
          </Text>
        </View>
      )}

      {/* Title */}
      {title && (
        <View className="absolute bottom-3 left-3 right-16">
          <Text
            className="text-white text-base font-semibold"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

export default VideoPreview;
