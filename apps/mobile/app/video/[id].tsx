import { useState, useCallback } from "react";
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert, Linking, StyleSheet, Platform } from "react-native";
import { VideoView, useVideoPlayer } from 'expo-video';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Play,
  Download,
  Share2,
  Trash2,
  Globe,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react-native";
import { useVideo, useDeleteVideo } from "@/hooks";
import { videosApi } from "@/lib/api";
import { formatDuration } from "@/types/video";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.name || code.toUpperCase();
}

function getLanguageFlag(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.flag || "🌐";
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

async function downloadOnWeb(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    // Fallback: open URL in new tab
    window.open(url, '_blank');
  }
}

export default function VideoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Fetch video by ID
  const { data: video, isLoading, isError, error } = useVideo(id || "");
  const deleteVideoMutation = useDeleteVideo();

  // Create video player for completed videos
  const player = useVideoPlayer(
    video?.status === "completed" && video?.downloadUrl ? video.downloadUrl : null,
    (p) => {
      p.loop = false;
    }
  );

  const handleDownload = useCallback(async () => {
    if (!video || !id) return;

    try {
      setIsDownloading(true);
      const { url: downloadUrl } = await videosApi.getDownloadUrl(id);

      if (Platform.OS === 'web') {
        const filename = `${video.title.replace(/[^a-z0-9]/gi, '_')}_${video.targetLanguage}.mp4`;
        await downloadOnWeb(downloadUrl, filename);
      } else {
        const supported = await Linking.canOpenURL(downloadUrl);
        if (supported) {
          await Linking.openURL(downloadUrl);
        } else {
          Alert.alert("Error", "Unable to open download link");
        }
      }
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Download Failed", "Unable to download video. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [video, id]);

  const handleShare = useCallback(async () => {
    if (!video || !id) return;

    try {
      // Construct download URL directly
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mirai-dub-api.founder-968.workers.dev';
      const downloadUrl = `${API_URL}/api/videos/${id}/download`;

      // Use React Native's Share API
      const { Share } = await import("react-native");
      await Share.share({
        message: `Check out my translated video: ${video.title}`,
        url: downloadUrl,
      });
    } catch (error) {
      console.error("Share failed:", error);
      Alert.alert("Share Failed", "Unable to share video. Please try again.");
    }
  }, [video, id]);


  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Video",
      "Are you sure you want to delete this video? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            try {
              await deleteVideoMutation.mutateAsync(id);
              router.back();
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert("Delete Failed", "Unable to delete video. Please try again.");
            }
          },
        },
      ]
    );
  }, [id, deleteVideoMutation, router]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-4 pt-2 pb-4">
          <Pressable
            className="flex-row items-center mb-4"
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color="#64748b" />
            <Text className="text-neutral-500 ml-1">Back</Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-neutral-500 mt-3">Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !video) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-4 pt-2 pb-4">
          <Pressable
            className="flex-row items-center mb-4"
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color="#64748b" />
            <Text className="text-neutral-500 ml-1">Back</Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={48} color="#ef4444" />
          <Text className="text-neutral-900 font-semibold text-lg mt-4 text-center">
            Video Not Found
          </Text>
          <Text className="text-neutral-500 text-center mt-2">
            {error instanceof Error ? error.message : "Unable to load video details"}
          </Text>
          <Pressable
            className="mt-6 bg-primary-500 rounded-lg px-6 py-3 active:bg-primary-600"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = video.status === "completed";
  const isProcessing = video.status === "processing" || video.status === "queued";
  const isFailed = video.status === "failed";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <Pressable
            className="flex-row items-center mb-4"
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color="#64748b" />
            <Text className="text-neutral-500 ml-1">Back</Text>
          </Pressable>
        </View>

        {/* Video Preview/Player */}
        <View className="mx-4 rounded-xl overflow-hidden mb-6">
          <View className="relative">
            {isCompleted && video.downloadUrl && player && !videoError ? (
              // Show video player for completed videos
              <VideoView
                player={player}
                style={styles.videoPlayer}
                nativeControls
                contentFit="contain"
              />
            ) : (
              // Show thumbnail for non-completed or error states
              <>
                {video.thumbnailUrl ? (
                  <Image
                    source={{ uri: video.thumbnailUrl }}
                    className="w-full h-52 bg-neutral-200"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-52 bg-neutral-200 items-center justify-center">
                    <Play size={48} color="#94a3b8" />
                  </View>
                )}

                {/* Processing overlay */}
                {isProcessing && (
                  <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <View className="bg-white rounded-full p-4">
                      <Loader size={32} color="#3b82f6" />
                    </View>
                    <Text className="text-white font-medium mt-3">
                      {video.status === "queued" ? "Queued..." : `Processing ${video.progress}%`}
                    </Text>
                  </View>
                )}

                {/* Failed or Video Error overlay */}
                {(isFailed || videoError) && (
                  <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <View className="bg-error-500 rounded-full p-4">
                      <AlertCircle size={32} color="#fff" />
                    </View>
                    <Text className="text-white font-medium mt-3">
                      {isFailed ? "Processing Failed" : "Video Unavailable"}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Duration badge */}
            {video.durationSeconds && (
              <View className="absolute bottom-3 right-3 bg-black/70 rounded px-2 py-1">
                <Text className="text-white text-sm font-medium">
                  {formatDuration(video.durationSeconds)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Video Info */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center mb-2">
            {isCompleted && (
              <View className="bg-success-100 rounded-full px-2.5 py-1 flex-row items-center">
                <CheckCircle size={14} color="#10b981" />
                <Text className="text-success-700 text-xs font-medium ml-1">
                  Completed
                </Text>
              </View>
            )}
            {isProcessing && (
              <View className="bg-primary-100 rounded-full px-2.5 py-1 flex-row items-center">
                <Loader size={14} color="#3b82f6" />
                <Text className="text-primary-700 text-xs font-medium ml-1">
                  {video.status === "queued" ? "Queued" : "Processing"}
                </Text>
              </View>
            )}
            {isFailed && (
              <View className="bg-error-100 rounded-full px-2.5 py-1 flex-row items-center">
                <AlertCircle size={14} color="#ef4444" />
                <Text className="text-error-700 text-xs font-medium ml-1">
                  Failed
                </Text>
              </View>
            )}
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            {video.title}
          </Text>
          <View className="flex-row items-center">
            <Globe size={16} color="#64748b" />
            <Text className="text-neutral-600 ml-2">
              {getLanguageFlag(video.sourceLanguage)} {getLanguageName(video.sourceLanguage)} →{" "}
              {getLanguageFlag(video.targetLanguage)} {getLanguageName(video.targetLanguage)}
            </Text>
          </View>
        </View>

        {/* Error Message for Failed Videos */}
        {isFailed && video.errorMessage && (
          <View className="mx-4 mb-6 bg-error-50 border border-error-200 rounded-xl p-4">
            <Text className="text-error-700 font-medium mb-1">Processing Error</Text>
            <Text className="text-error-600 text-sm">{video.errorMessage}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {isCompleted && (
          <View className="px-4 mb-6 flex-row gap-3">
            <Pressable
              className={`flex-1 bg-primary-500 rounded-xl py-4 flex-row items-center justify-center ${
                isDownloading ? "opacity-70" : "active:bg-primary-600"
              }`}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Download size={20} color="#fff" />
              )}
              <Text className="text-white font-semibold ml-2">
                {isDownloading ? "Loading..." : "Download"}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-neutral-100 rounded-xl py-4 flex-row items-center justify-center active:bg-neutral-200"
              onPress={handleShare}
            >
              <Share2 size={20} color="#334155" />
              <Text className="text-neutral-700 font-semibold ml-2">Share</Text>
            </Pressable>
          </View>
        )}

        {/* Processing Button */}
        {isProcessing && (
          <View className="px-4 mb-6">
            <Pressable
              className="bg-primary-500 rounded-xl py-4 flex-row items-center justify-center active:bg-primary-600"
              onPress={() => router.push(`/video/processing?videoId=${video.id}`)}
            >
              <Loader size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">View Progress</Text>
            </Pressable>
          </View>
        )}

        {/* Video Details */}
        <View className="px-4 mb-6">
          <Text className="text-neutral-900 font-semibold text-lg mb-4">
            Video Details
          </Text>
          <View className="bg-neutral-50 rounded-xl p-4 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={18} color="#64748b" />
                <Text className="text-neutral-600 ml-2">Duration</Text>
              </View>
              <Text className="text-neutral-900 font-medium">
                {video.durationSeconds ? formatDuration(video.durationSeconds) : "Unknown"}
              </Text>
            </View>
            <View className="h-px bg-neutral-200" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={18} color="#64748b" />
                <Text className="text-neutral-600 ml-2">Created</Text>
              </View>
              <Text className="text-neutral-900 font-medium">
                {formatDate(video.createdAt)}
              </Text>
            </View>
            {video.fileSize && (
              <>
                <View className="h-px bg-neutral-200" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-neutral-600">File Size</Text>
                  <Text className="text-neutral-900 font-medium">
                    {formatFileSize(video.fileSize)}
                  </Text>
                </View>
              </>
            )}
            {video.id && (
              <>
                <View className="h-px bg-neutral-200" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-neutral-600">Video ID</Text>
                  <Text className="text-neutral-500 text-xs font-mono">
                    {video.id.slice(0, 12)}...
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <View className="px-4">
          <Pressable
            className={`flex-row items-center justify-center py-4 ${
              deleteVideoMutation.isPending ? "opacity-50" : "active:opacity-70"
            }`}
            onPress={handleDelete}
            disabled={deleteVideoMutation.isPending}
          >
            {deleteVideoMutation.isPending ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Trash2 size={18} color="#ef4444" />
            )}
            <Text className="text-error-500 font-medium ml-2">
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete Video"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  videoPlayer: {
    width: '100%',
    height: 208,
  },
});
