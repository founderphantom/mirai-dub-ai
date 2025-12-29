import { useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import {
  Upload,
  ArrowRight,
  Info,
  CheckCircle,
} from "lucide-react-native";
import { useCredits, formatCredits } from "@/hooks";
import { useVideoStore } from "@/stores/videoStore";
import { uploadApi } from "@/lib/api";
import { LanguagePicker } from "@/components/ui/LanguagePicker";
import { detectMimeType } from "@/lib/utils/mimeType";

const tips = [
  "Use videos with clear audio and minimal background noise",
  "Face should be clearly visible for lip-sync",
  "HD quality videos produce better results",
  "Shorter videos process faster",
];

export default function UploadScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("");

  // Real API hooks
  const { data: credits, isLoading: isLoadingCredits } = useCredits();
  const { isUploading, uploadProgress, setUploading, setCurrentUploadVideoId, setError } = useVideoStore();

  const handleFilePick = async () => {
    if (isUploading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick video file");
    }
  };

  const handleStartTranslation = useCallback(async () => {
    if (!selectedFile || !targetLanguage) {
      Alert.alert("Missing Information", "Please select a video and target language");
      return;
    }

    // Check credits (balance, trial videos, or bonus videos)
    const hasCredits = credits && (credits.balance > 0 || credits.trialVideosRemaining > 0 || credits.bonusVideosAvailable > 0);

    if (!hasCredits) {
      Alert.alert(
        "Insufficient Credits",
        "You don't have enough credits to translate this video. Please purchase more credits.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Purchase Credits", onPress: () => router.push("/credits") },
        ]
      );
      return;
    }

    try {
      setUploading(true, 0);

      // Get file name without extension for title
      const title = selectedFile.name?.replace(/\.[^/.]+$/, "") || "Untitled Video";

      // Upload video with progress tracking
      // Use detectMimeType to handle browser inconsistencies with MIME type detection
      const fileName = selectedFile.name || "video.mp4";
      const video = await uploadApi.uploadVideo(
        {
          uri: selectedFile.uri,
          name: fileName,
          type: detectMimeType(fileName, selectedFile.mimeType),
          size: selectedFile.size || 0,
        },
        {
          title,
          sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
          targetLanguage,
        },
        (progress) => {
          setUploading(true, progress);
        }
      );

      setCurrentUploadVideoId(video.video.id);
      setUploading(false, 100);

      // Navigate to processing screen
      router.push(`/video/processing?videoId=${video.video.id}`);

      // Reset form
      setSelectedFile(null);
      setTargetLanguage("");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false, 0);
      setError(error instanceof Error ? error.message : "Upload failed");
      Alert.alert("Upload Failed", "There was an error uploading your video. Please try again.");
    }
  }, [selectedFile, targetLanguage, sourceLanguage, credits, router, setUploading, setCurrentUploadVideoId, setError]);

  const isValid = selectedFile && targetLanguage && !isUploading;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="pt-6 pb-4">
          <Text className="text-2xl font-bold text-neutral-900">
            Upload Video
          </Text>
          <Text className="text-neutral-500 mt-1">
            Upload your video and select languages to start translation
          </Text>
        </View>

        {/* Upload Zone */}
        <Pressable
          className={`border-2 border-dashed rounded-xl p-8 items-center justify-center mb-6 ${selectedFile ? "border-primary-500 bg-primary-50" : "border-neutral-300 bg-neutral-50"
            } ${isUploading ? "opacity-50" : ""}`}
          onPress={handleFilePick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-primary-600 font-semibold text-center mt-3">
                Uploading... {uploadProgress}%
              </Text>
              <View className="w-full h-2 bg-neutral-200 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-2 bg-primary-500 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </View>
            </>
          ) : selectedFile ? (
            <>
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mb-3">
                <CheckCircle size={24} color="#3b82f6" />
              </View>
              <Text className="text-neutral-900 font-semibold text-center mb-1">
                {selectedFile.name}
              </Text>
              <Text className="text-neutral-500 text-sm text-center">
                {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : ""}
              </Text>
              <Text className="text-primary-500 text-sm text-center mt-2">
                Tap to change file
              </Text>
            </>
          ) : (
            <>
              <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center mb-3">
                <Upload size={24} color="#64748b" />
              </View>
              <Text className="text-neutral-700 font-medium text-center mb-1">
                Tap to select your video
              </Text>
              <Text className="text-neutral-500 text-sm text-center mb-2">
                or drag and drop
              </Text>
              <Text className="text-neutral-400 text-xs text-center">
                Supported formats: MP4, MOV, AVI, WebM (Max 500MB)
              </Text>
            </>
          )}
        </Pressable>

        {/* Language Selection */}
        <View className="mb-6">
          <Text className="text-neutral-900 font-semibold mb-3">
            Select Languages
          </Text>

          <View className="flex-row items-end gap-3">
            {/* Source Language */}
            <View className="flex-1">
              <LanguagePicker
                label="From"
                placeholder="Select language"
                value={sourceLanguage}
                onChange={setSourceLanguage}
                disabled={isUploading}
                excludeAuto={false}
              />
            </View>

            {/* Arrow */}
            <View className="pb-2">
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
                onChange={setTargetLanguage}
                disabled={isUploading}
                excludeAuto={true}
              />
            </View>
          </View>

          {/* Helper Text */}
          <Text className="text-xs text-neutral-500 mt-3 text-center">
            Auto-detect will identify the spoken language in your video
          </Text>
        </View>

        {/* Translation Credits Card */}
        <View className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-neutral-900 font-semibold">
              Translation Credits
            </Text>
            {credits?.isAnonymous === false && (
              <View className="bg-primary-100 rounded-full px-2 py-1">
                <Text className="text-primary-700 text-xs font-medium">
                  Account
                </Text>
              </View>
            )}
          </View>

          {isLoadingCredits ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : credits ? (
            <>
              {/* Progress bar */}
              <View className="h-2 bg-neutral-200 rounded-full mb-3">
                <View
                  className="h-2 bg-primary-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (credits.balance / Math.max(credits.balance + credits.trialVideosUsed, 1)) * 100)}%`,
                  }}
                />
              </View>

              <View className="flex-row justify-between mb-4">
                <Text className="text-neutral-900 font-semibold">
                  {formatCredits(credits.balance)} available
                </Text>
              </View>

              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-neutral-500 text-sm">Trial Used</Text>
                  <Text className="text-neutral-700 font-medium">
                    {credits.trialVideosUsed}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-neutral-500 text-sm">Remaining</Text>
                  <Text className="text-neutral-700 font-medium">
                    {formatCredits(credits.balance)}
                  </Text>
                </View>
              </View>

              {(credits.trialVideosRemaining > 0 || credits.bonusVideosAvailable > 0) && (
                <View className="bg-success-50 border border-success-200 rounded-lg p-2 mb-3">
                  <Text className="text-success-700 text-sm text-center">
                    {credits.trialVideosRemaining > 0
                      ? `Includes ${credits.trialVideosRemaining} free trial video`
                      : `Includes ${credits.bonusVideosAvailable} free videos`}
                  </Text>
                </View>
              )}
            </>
          ) : null}

          <Pressable
            className="bg-primary-500 rounded-lg py-3 items-center active:bg-primary-600"
            onPress={() => router.push("/credits")}
            disabled={isUploading}
          >
            <Text className="text-white font-medium">+ Purchase More Credits</Text>
          </Pressable>

          <Text className="text-neutral-500 text-xs text-center mt-3">
            Credits are based on video duration. 1 minute of video = 1 credit.
          </Text>
        </View>

        {/* Tips Section */}
        <View className="mb-6">
          <Text className="text-neutral-900 font-semibold mb-3">
            Tips for Best Results
          </Text>
          {tips.map((tip, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text className="text-neutral-400 mr-2">•</Text>
              <Text className="text-neutral-600 text-sm flex-1">{tip}</Text>
            </View>
          ))}
        </View>

        {/* Processing Time Notice */}
        <View className="flex-row items-start bg-info-50 border border-info-200 rounded-lg p-4 mb-6">
          <Info size={20} color="#0ea5e9" className="mr-3 mt-0.5" />
          <View className="flex-1 ml-3">
            <Text className="text-info-700 text-sm">
              Translation typically takes 2-5 minutes per minute of video. You'll receive a notification when it's ready.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          className={`rounded-lg py-4 items-center ${isValid
            ? "bg-primary-500 active:bg-primary-600"
            : "bg-neutral-200"
            }`}
          onPress={handleStartTranslation}
          disabled={!isValid}
        >
          {isUploading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Uploading...
              </Text>
            </View>
          ) : (
            <Text
              className={`font-semibold text-base ${isValid ? "text-white" : "text-neutral-400"
                }`}
            >
              Start Translation
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
