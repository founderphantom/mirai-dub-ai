import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  Play,
  Download,
  Share2,
  Trash2,
  Clock,
  Languages,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import type { Video } from "@/types/video";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface VideoCardProps {
  video: Video;
  onDelete?: (id: string) => void;
  onDownload?: (video: Video) => void;
  onShare?: (video: Video) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getLanguageFlag(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.flag || "🌐";
}

function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.name || code.toUpperCase();
}

export function VideoCard({
  video,
  onDelete,
  onDownload,
  onShare,
}: VideoCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (video.status === "processing") {
      router.push(`/video/processing?id=${video.id}`);
    } else {
      router.push(`/video/${video.id}`);
    }
  };

  const statusConfig = {
    processing: {
      badge: "warning" as const,
      icon: <Loader2 size={14} color="#D97706" />,
      label: `Processing ${video.progress || 0}%`,
    },
    completed: {
      badge: "success" as const,
      icon: <CheckCircle size={14} color="#059669" />,
      label: "Completed",
    },
    failed: {
      badge: "error" as const,
      icon: <AlertCircle size={14} color="#DC2626" />,
      label: "Failed",
    },
  };

  const status = statusConfig[video.status];

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-100"
      activeOpacity={0.7}
      accessibilityLabel={`Video: ${video.title}`}
      accessibilityHint="Tap to view details"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: video.thumbnail }}
          className="w-full h-40"
          resizeMode="cover"
        />
        {/* Duration Badge */}
        <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
          <Text className="text-white text-xs font-medium">
            {formatDuration(video.duration)}
          </Text>
        </View>
        {/* Play Overlay for completed videos */}
        {video.status === "completed" && (
          <View className="absolute inset-0 items-center justify-center">
            <View className="bg-black/40 w-12 h-12 rounded-full items-center justify-center">
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </View>
        )}
        {/* Processing Overlay */}
        {video.status === "processing" && (
          <View className="absolute inset-0 bg-black/30 items-center justify-center">
            <View className="bg-white/90 px-4 py-2 rounded-full">
              <Text className="text-sm font-medium text-neutral-700">
                Processing... {video.progress}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title */}
        <Text
          className="text-base font-semibold text-neutral-900 mb-2"
          numberOfLines={2}
        >
          {video.title}
        </Text>

        {/* Language Info */}
        <View className="flex-row items-center mb-2">
          <Text className="text-lg">
            {getLanguageFlag(video.sourceLanguage)}
          </Text>
          <Text className="text-neutral-400 mx-2">→</Text>
          <Text className="text-lg">
            {getLanguageFlag(video.targetLanguage)}
          </Text>
          <Text className="text-sm text-neutral-500 ml-2">
            {getLanguageName(video.sourceLanguage)} to{" "}
            {getLanguageName(video.targetLanguage)}
          </Text>
        </View>

        {/* Status */}
        <View className="flex-row items-center justify-between">
          <Badge variant={status.badge} icon={status.icon}>
            {status.label}
          </Badge>

          {/* Actions for completed videos */}
          {video.status === "completed" && (
            <View className="flex-row items-center gap-2">
              {onDownload && (
                <TouchableOpacity
                  onPress={() => onDownload(video)}
                  className="w-8 h-8 items-center justify-center rounded-full bg-primary-50"
                  accessibilityLabel="Download video"
                >
                  <Download size={16} color="#2563EB" />
                </TouchableOpacity>
              )}
              {onShare && (
                <TouchableOpacity
                  onPress={() => onShare(video)}
                  className="w-8 h-8 items-center justify-center rounded-full bg-neutral-100"
                  accessibilityLabel="Share video"
                >
                  <Share2 size={16} color="#374151" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Progress Bar for processing videos */}
        {video.status === "processing" && (
          <Progress
            value={video.progress || 0}
            variant="warning"
            size="sm"
            className="mt-3"
          />
        )}

        {/* File Info for completed */}
        {video.status === "completed" && video.fileSize && (
          <View className="flex-row items-center mt-2 pt-2 border-t border-neutral-100">
            <Text className="text-xs text-neutral-500">
              {video.fileSize} • {video.resolution}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default VideoCard;
