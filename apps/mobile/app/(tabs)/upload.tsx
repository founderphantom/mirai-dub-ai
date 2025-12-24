import { useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import {
  Upload,
  ArrowRight,
  Info,
  ChevronDown,
  CheckCircle,
} from "lucide-react-native";
import { useCredits, formatCredits } from "@/hooks";
import { useVideoStore } from "@/stores/videoStore";
import { uploadApi } from "@/lib/api";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

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
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);

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

    // Check credits
    if (credits && credits.balance <= 0) {
      Alert.alert(
        "Insufficient Credits",
        "You don't have enough credits to translate this video. Please purchase more credits.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Purchase Credits", onPress: () => router.push("/credits/packages") },
        ]
      );
      return;
    }

    try {
      setUploading(true, 0);

      // Get file name without extension for title
      const title = selectedFile.name?.replace(/\.[^/.]+$/, "") || "Untitled Video";

      // Upload video with progress tracking
      const video = await uploadApi.uploadVideo(
        {
          uri: selectedFile.uri,
          name: selectedFile.name || "video.mp4",
          type: selectedFile.mimeType || "video/mp4",
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

      setCurrentUploadVideoId(video.id);
      setUploading(false, 100);

      // Navigate to processing screen
      router.push(`/video/processing?videoId=${video.id}`);

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

  // Languages with auto-detect option for source
  const sourceLanguages = SUPPORTED_LANGUAGES;

  const targetLanguages = SUPPORTED_LANGUAGES.filter(
    (l) => l.code !== "auto" && (l.code !== sourceLanguage || sourceLanguage === "auto")
  );

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
          className={`border-2 border-dashed rounded-xl p-8 items-center justify-center mb-6 ${
            selectedFile ? "border-primary-500 bg-primary-50" : "border-neutral-300 bg-neutral-50"
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

          <View className="flex-row items-center gap-3">
            {/* Source Language */}
            <View className="flex-1">
              <Text className="text-neutral-500 text-sm mb-2">From</Text>
              <Pressable
                className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex-row items-center justify-between"
                onPress={() => {
                  setShowSourcePicker(!showSourcePicker);
                  setShowTargetPicker(false);
                }}
                disabled={isUploading}
              >
                <Text className="text-neutral-700">
                  {sourceLanguages.find((l) => l.code === sourceLanguage)?.flag}{" "}
                  {sourceLanguages.find((l) => l.code === sourceLanguage)?.name}
                </Text>
                <ChevronDown size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Arrow */}
            <View className="pt-6">
              <ArrowRight size={20} color="#94a3b8" />
            </View>

            {/* Target Language */}
            <View className="flex-1">
              <Text className="text-neutral-500 text-sm mb-2">To</Text>
              <Pressable
                className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex-row items-center justify-between"
                onPress={() => {
                  setShowTargetPicker(!showTargetPicker);
                  setShowSourcePicker(false);
                }}
                disabled={isUploading}
              >
                <Text className={targetLanguage ? "text-neutral-700" : "text-neutral-400"}>
                  {targetLanguage
                    ? `${targetLanguages.find((l) => l.code === targetLanguage)?.flag} ${targetLanguages.find((l) => l.code === targetLanguage)?.name}`
                    : "Select target language"}
                </Text>
                <ChevronDown size={20} color="#64748b" />
              </Pressable>
            </View>
          </View>

          {/* Source Language Picker */}
          {showSourcePicker && (
            <View className="mt-2 bg-white border border-neutral-200 rounded-lg shadow-floating max-h-64">
              <ScrollView nestedScrollEnabled>
                {sourceLanguages.map((language) => (
                  <Pressable
                    key={language.code}
                    className="p-3 border-b border-neutral-100 flex-row items-center"
                    onPress={() => {
                      setSourceLanguage(language.code);
                      setShowSourcePicker(false);
                      // Reset target if same as source
                      if (language.code === targetLanguage) {
                        setTargetLanguage("");
                      }
                    }}
                  >
                    <Text className="text-lg mr-2">{language.flag}</Text>
                    <Text className="text-neutral-700">{language.name}</Text>
                    {language.code === sourceLanguage && (
                      <View className="ml-auto">
                        <CheckCircle size={18} color="#3b82f6" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Target Language Picker */}
          {showTargetPicker && (
            <View className="mt-2 bg-white border border-neutral-200 rounded-lg shadow-floating max-h-64">
              <ScrollView nestedScrollEnabled>
                {targetLanguages.map((language) => (
                  <Pressable
                    key={language.code}
                    className="p-3 border-b border-neutral-100 flex-row items-center"
                    onPress={() => {
                      setTargetLanguage(language.code);
                      setShowTargetPicker(false);
                    }}
                  >
                    <Text className="text-lg mr-2">{language.flag}</Text>
                    <Text className="text-neutral-700">{language.name}</Text>
                    {language.code === targetLanguage && (
                      <View className="ml-auto">
                        <CheckCircle size={18} color="#3b82f6" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
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
                    width: `${Math.min(100, (credits.balance / Math.max(credits.balance + credits.used, 1)) * 100)}%`,
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
                  <Text className="text-neutral-500 text-sm">Used</Text>
                  <Text className="text-neutral-700 font-medium">
                    {formatCredits(credits.used)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-neutral-500 text-sm">Remaining</Text>
                  <Text className="text-neutral-700 font-medium">
                    {formatCredits(credits.balance)}
                  </Text>
                </View>
              </View>

              {credits.trialMinutes > 0 && (
                <View className="bg-success-50 border border-success-200 rounded-lg p-2 mb-3">
                  <Text className="text-success-700 text-sm text-center">
                    Includes {credits.trialMinutes} free trial minutes
                  </Text>
                </View>
              )}
            </>
          ) : null}

          <Pressable
            className="bg-primary-500 rounded-lg py-3 items-center active:bg-primary-600"
            onPress={() => router.push("/credits/packages")}
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
          className={`rounded-lg py-4 items-center ${
            isValid
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
              className={`font-semibold text-base ${
                isValid ? "text-white" : "text-neutral-400"
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
