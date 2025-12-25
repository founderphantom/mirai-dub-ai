import { useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, TextInput, Image, RefreshControl, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Filter,
  Plus,
  Download,
  Share2,
  Play,
  Clock,
  Loader,
  AlertCircle,
} from "lucide-react-native";
import { useVideos, useCredits, formatCredits } from "@/hooks";
import type { Video, VideoStatus } from "@/types/video";
import { formatDuration } from "@/types/video";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

const languageFlags: Record<string, string> = {
  en: "US",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
  pt: "BR",
  ja: "JP",
  zh: "CN",
  ko: "KR",
  ar: "SA",
  hi: "IN",
  ru: "RU",
  nl: "NL",
  pl: "PL",
  tr: "TR",
  vi: "VN",
  th: "TH",
  id: "ID",
  sv: "SE",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.name || code.toUpperCase();
}

type VideoCardProps = {
  video: Video;
  onPress: () => void;
};

function VideoCard({ video, onPress }: VideoCardProps) {
  const durationSeconds = video.durationSeconds || 0;

  return (
    <Pressable
      className="bg-white rounded-xl overflow-hidden shadow-raised mb-4"
      onPress={onPress}
    >
      {/* Thumbnail */}
      <View className="relative">
        {video.thumbnailUrl ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            className="w-full h-44 bg-neutral-200"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-44 bg-neutral-200 items-center justify-center">
            <Play size={32} color="#94a3b8" />
          </View>
        )}
        {/* Duration badge */}
        <View className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-1">
          <Text className="text-white text-xs font-medium">
            {formatDuration(durationSeconds)}
          </Text>
        </View>
        {/* Processing overlay */}
        {(video.status === "processing" || video.status === "queued") && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <View className="bg-white rounded-full p-3">
              <Loader size={24} color="#3b82f6" />
            </View>
            <View className="absolute top-2 left-2 bg-primary-500 rounded px-2 py-1">
              <Text className="text-white text-xs font-medium">
                {video.status === "queued" ? "Queued..." : `Processing... ${video.progress}%`}
              </Text>
            </View>
          </View>
        )}
        {/* Failed overlay */}
        {video.status === "failed" && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <View className="bg-error-500 rounded-full p-3">
              <AlertCircle size={24} color="#fff" />
            </View>
          </View>
        )}
        {/* Play button overlay for completed */}
        {video.status === "completed" && (
          <View className="absolute inset-0 items-center justify-center">
            <View className="bg-white/90 rounded-full p-3">
              <Play size={24} color="#334155" fill="#334155" />
            </View>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-neutral-900 font-semibold text-base mb-2" numberOfLines={2}>
          {video.title}
        </Text>

        <View className="flex-row items-center mb-3">
          <Text className="text-neutral-500 text-sm">
            {languageFlags[video.sourceLanguage] || video.sourceLanguage.toUpperCase()}{" "}
            {getLanguageName(video.sourceLanguage)} →{" "}
            {languageFlags[video.targetLanguage] || video.targetLanguage.toUpperCase()}{" "}
            {getLanguageName(video.targetLanguage)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-neutral-400 text-sm">
            {formatTimeAgo(video.createdAt)}
          </Text>

          {video.status === "completed" && (
            <View className="flex-row gap-2">
              <Pressable className="bg-neutral-100 rounded-lg px-4 py-2 flex-row items-center active:bg-neutral-200">
                <Download size={16} color="#334155" />
                <Text className="text-neutral-700 text-sm font-medium ml-1.5">
                  Download
                </Text>
              </Pressable>
              <Pressable className="bg-neutral-100 rounded-lg px-4 py-2 flex-row items-center active:bg-neutral-200">
                <Share2 size={16} color="#334155" />
                <Text className="text-neutral-700 text-sm font-medium ml-1.5">
                  Share
                </Text>
              </Pressable>
            </View>
          )}

          {(video.status === "processing" || video.status === "queued") && (
            <View className="flex-row items-center">
              <Loader size={14} color="#3b82f6" />
              <Text className="text-primary-500 text-sm font-medium ml-1">
                {video.status === "queued" ? "Queued" : `${video.progress}% complete`}
              </Text>
            </View>
          )}

          {video.status === "failed" && (
            <View className="flex-row items-center">
              <AlertCircle size={14} color="#ef4444" />
              <Text className="text-error-500 text-sm font-medium ml-1">
                Failed
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<VideoStatus | undefined>(undefined);

  // Fetch videos with infinite query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideos(filterStatus);

  // Fetch credits
  const { data: credits } = useCredits();

  // Flatten pages into single array
  const allVideos = data?.pages.flatMap((page) => page.items) || [];

  // Filter by search query
  const filteredVideos = allVideos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderVideo = useCallback(
    ({ item }: { item: Video }) => (
      <VideoCard
        video={item}
        onPress={() => {
          if (item.status === "processing" || item.status === "queued") {
            router.push(`/video/processing?videoId=${item.id}`);
          } else {
            router.push(`/video/${item.id}`);
          }
        }}
      />
    ),
    [router]
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center justify-center py-16">
      <View className="w-16 h-16 bg-neutral-200 rounded-full items-center justify-center mb-4">
        <Play size={32} color="#94a3b8" />
      </View>
      <Text className="text-neutral-900 font-semibold text-lg mb-2">
        No videos yet
      </Text>
      <Text className="text-neutral-500 text-center mb-6">
        Upload your first video to get started
      </Text>
      <Pressable
        className="bg-primary-500 rounded-lg px-6 py-3 active:bg-primary-600"
        onPress={() => router.push("/(tabs)/upload")}
      >
        <Text className="text-white font-semibold">Upload Video</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-white border-b border-neutral-200">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-2xl font-bold text-neutral-900">
              Video Library
            </Text>
            <Text className="text-neutral-500">
              Manage and download your translated videos
            </Text>
          </View>
          <Pressable
            className="bg-primary-500 rounded-lg px-4 py-2.5 flex-row items-center active:bg-primary-600"
            onPress={() => router.push("/(tabs)/upload")}
          >
            <Plus size={18} color="#fff" />
            <Text className="text-white font-medium ml-1">Upload</Text>
          </Pressable>
        </View>
      </View>

      {/* Credits Bar */}
      <View className="px-4 py-3 bg-white border-b border-neutral-200 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock size={16} color="#64748b" />
          <Text className="text-neutral-600 ml-2">
            {credits ? (
              <>
                <Text className="font-semibold">{formatCredits(credits.balance)}</Text>
                {credits.trialVideosRemaining > 0 ? " + Free Video" : " remaining"}
              </>
            ) : (
              "Loading..."
            )}
          </Text>
        </View>
        <Pressable className="bg-primary-50 rounded-lg px-3 py-1.5 active:bg-primary-100">
          <Text className="text-primary-600 font-medium text-sm">+ Add</Text>
        </Pressable>
      </View>

      {/* Search & Filter */}
      <View className="px-4 py-3 bg-white border-b border-neutral-200 flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center bg-neutral-100 rounded-lg px-3 py-2.5">
          <Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-2 text-neutral-700"
            placeholder="Search videos..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable
          className="bg-neutral-100 rounded-lg px-4 py-2.5 flex-row items-center"
          onPress={() => {
            // Cycle through filter options
            if (!filterStatus) setFilterStatus("processing");
            else if (filterStatus === "processing") setFilterStatus("completed");
            else if (filterStatus === "completed") setFilterStatus("failed");
            else setFilterStatus(undefined);
          }}
        >
          <Filter size={18} color="#64748b" />
          <Text className="text-neutral-600 ml-2">
            {!filterStatus ? "All Videos" : filterStatus}
          </Text>
        </Pressable>
      </View>

      {/* Error State */}
      {isError && (
        <View className="px-4 py-3 bg-error-50 border-b border-error-200">
          <Text className="text-error-700 text-sm">
            Failed to load videos. Pull to refresh.
          </Text>
        </View>
      )}

      {/* Video List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-neutral-500 mt-3">Loading videos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={["#3b82f6"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}
