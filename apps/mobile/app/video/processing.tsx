import { useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Upload,
  AudioLines,
  Languages,
  Mic,
  Smile,
  Film,
  Check,
  Loader,
  Bell,
  Sparkles,
  AlertCircle,
} from "lucide-react-native";
import { useVideoJob, useVideo } from "@/hooks";
import type { JobStep } from "@/types/video";

type StepStatus = "pending" | "in-progress" | "completed" | "failed";

type ProcessingStep = {
  id: string;
  stepType: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  status: StepStatus;
  estimatedTime?: string;
};

// Map backend step types to UI display
const stepConfig: Record<string, { icon: React.ComponentType<any>; title: string; description: string }> = {
  upload: {
    icon: Upload,
    title: "Uploading Video",
    description: "Securely uploading your video to our servers",
  },
  transcription: {
    icon: AudioLines,
    title: "Analyzing Audio",
    description: "Extracting and analyzing speech patterns",
  },
  translation: {
    icon: Languages,
    title: "Translating Content",
    description: "AI-powered translation to target language",
  },
  voice_synthesis: {
    icon: Mic,
    title: "Generating Voice",
    description: "Creating natural-sounding dubbed audio",
  },
  lip_sync: {
    icon: Smile,
    title: "Syncing Lips",
    description: "Applying AI lip-sync technology",
  },
  render: {
    icon: Film,
    title: "Finalizing Video",
    description: "Rendering and optimizing final output",
  },
};

// Default steps when job hasn't started yet
const defaultSteps: ProcessingStep[] = [
  { id: "1", stepType: "upload", ...stepConfig.upload, status: "completed" },
  { id: "2", stepType: "transcription", ...stepConfig.transcription, status: "pending" },
  { id: "3", stepType: "translation", ...stepConfig.translation, status: "pending" },
  { id: "4", stepType: "voice_synthesis", ...stepConfig.voice_synthesis, status: "pending" },
  { id: "5", stepType: "lip_sync", ...stepConfig.lip_sync, status: "pending" },
  { id: "6", stepType: "render", ...stepConfig.render, status: "pending" },
];

function mapJobStepStatus(status: JobStep["status"]): StepStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "in_progress":
      return "in-progress";
    case "failed":
      return "failed";
    default:
      return "pending";
  }
}

function StepIndicator({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <View className="w-8 h-8 bg-success-500 rounded-full items-center justify-center">
        <Check size={18} color="#fff" strokeWidth={3} />
      </View>
    );
  }

  if (status === "in-progress") {
    return (
      <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center">
        <Loader size={18} color="#fff" />
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View className="w-8 h-8 bg-error-500 rounded-full items-center justify-center">
        <AlertCircle size={18} color="#fff" />
      </View>
    );
  }

  return (
    <View className="w-8 h-8 bg-neutral-200 rounded-full items-center justify-center">
      <View className="w-3 h-3 bg-neutral-400 rounded-full" />
    </View>
  );
}

export default function ProcessingScreen() {
  const router = useRouter();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  // Fetch video details
  const { data: video, isLoading: isLoadingVideo } = useVideo(videoId || "");

  // Fetch and poll job status
  const { data: job, isLoading: isLoadingJob, isError } = useVideoJob(videoId || "");

  // Map job steps to UI steps
  const getSteps = useCallback((): ProcessingStep[] => {
    if (!job?.steps || job.steps.length === 0) {
      // Use default steps with upload completed
      return defaultSteps;
    }

    return job.steps.map((step, index) => {
      const config = stepConfig[step.stepType] || {
        icon: Loader,
        title: step.stepType,
        description: "Processing...",
      };

      return {
        id: String(index + 1),
        stepType: step.stepType,
        ...config,
        status: mapJobStepStatus(step.status),
        estimatedTime: step.status === "in_progress" ? "~2 min" : undefined,
      };
    });
  }, [job]);

  const steps = getSteps();

  // Calculate overall progress
  const overallProgress = job?.progress ?? 0;

  // Check if completed
  const isCompleted = job?.status === "completed" || video?.status === "completed";
  const isFailed = job?.status === "failed" || video?.status === "failed";

  // Navigate to video detail when completed
  useEffect(() => {
    if (isCompleted && videoId) {
      // Small delay to show completion state
      const timeout = setTimeout(() => {
        router.replace(`/video/${videoId}`);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isCompleted, videoId, router]);

  // Loading state
  if (isLoadingVideo && !video) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-neutral-500 mt-3">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const videoTitle = video?.title || "Your Video";
  const videoDuration = video?.durationSeconds
    ? `${Math.floor(video.durationSeconds / 60)} min`
    : "";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4 border-b border-neutral-200">
          <Pressable
            className="flex-row items-center mb-4"
            onPress={() => router.push("/(tabs)/library")}
          >
            <ChevronLeft size={20} color="#64748b" />
            <Text className="text-neutral-500 ml-1">Back to Library</Text>
          </Pressable>

          <Text className="text-2xl font-bold text-neutral-900 mb-1">
            {isCompleted
              ? "Translation Complete!"
              : isFailed
              ? "Translation Failed"
              : "Translation in Progress"}
          </Text>
          <Text className="text-neutral-500">
            {isCompleted
              ? "Your video is ready to download."
              : isFailed
              ? "There was an error processing your video."
              : "Your video is being processed. This usually takes 2-5 minutes per minute of video."}
          </Text>
        </View>

        {/* Video Info */}
        <View className="px-4 py-4 border-b border-neutral-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-neutral-700 font-medium">Processing</Text>
              <Text
                className="text-neutral-900 font-semibold ml-1 flex-1"
                numberOfLines={1}
              >
                {videoTitle}
              </Text>
            </View>
            {videoDuration && (
              <View className="bg-neutral-100 rounded-full px-2 py-1">
                <Text className="text-neutral-600 text-sm">{videoDuration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Overall Progress */}
        <View className="px-4 py-6 border-b border-neutral-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-neutral-700 font-semibold">Overall Progress</Text>
            <Text
              className={`font-bold text-lg ${
                isCompleted
                  ? "text-success-500"
                  : isFailed
                  ? "text-error-500"
                  : "text-primary-500"
              }`}
            >
              {isCompleted ? "100%" : isFailed ? "Failed" : `${overallProgress}%`}
            </Text>
          </View>
          <View className="h-3 bg-neutral-200 rounded-full overflow-hidden">
            <View
              className={`h-3 rounded-full ${
                isCompleted
                  ? "bg-success-500"
                  : isFailed
                  ? "bg-error-500"
                  : "bg-primary-500"
              }`}
              style={{ width: `${isCompleted ? 100 : overallProgress}%` }}
            />
          </View>
        </View>

        {/* Error Message */}
        {isFailed && job?.error && (
          <View className="mx-4 mt-4 bg-error-50 border border-error-200 rounded-xl p-4">
            <Text className="text-error-700 font-medium mb-1">Error Details</Text>
            <Text className="text-error-600 text-sm">{job.error}</Text>
          </View>
        )}

        {/* Processing Steps */}
        <View className="px-4 py-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <View key={step.id} className="flex-row">
                {/* Left side - indicator and line */}
                <View className="items-center mr-4">
                  <StepIndicator status={step.status} />
                  {!isLast && (
                    <View
                      className={`w-0.5 flex-1 my-2 ${
                        step.status === "completed"
                          ? "bg-success-500"
                          : step.status === "failed"
                          ? "bg-error-500"
                          : "bg-neutral-200"
                      }`}
                    />
                  )}
                </View>

                {/* Right side - content */}
                <View className={`flex-1 ${!isLast ? "pb-6" : ""}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Icon
                        size={18}
                        color={
                          step.status === "completed"
                            ? "#10b981"
                            : step.status === "in-progress"
                            ? "#3b82f6"
                            : step.status === "failed"
                            ? "#ef4444"
                            : "#94a3b8"
                        }
                      />
                      <Text
                        className={`font-semibold ml-2 ${
                          step.status === "pending"
                            ? "text-neutral-400"
                            : step.status === "failed"
                            ? "text-error-600"
                            : "text-neutral-900"
                        }`}
                      >
                        {step.title}
                      </Text>
                    </View>
                    {step.estimatedTime && step.status === "in-progress" && (
                      <Text className="text-neutral-400 text-sm">
                        {step.estimatedTime}
                      </Text>
                    )}
                  </View>
                  <Text
                    className={`text-sm mt-1 ${
                      step.status === "pending"
                        ? "text-neutral-400"
                        : step.status === "failed"
                        ? "text-error-500"
                        : "text-neutral-500"
                    }`}
                  >
                    {step.description}
                  </Text>

                  {/* Progress bar for in-progress step */}
                  {step.status === "in-progress" && (
                    <View className="h-1.5 bg-neutral-200 rounded-full mt-3 overflow-hidden">
                      <View
                        className="h-1.5 bg-primary-500 rounded-full"
                        style={{ width: "60%" }}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Info Cards */}
        {!isCompleted && !isFailed && (
          <View className="px-4 flex-row gap-3">
            {/* Notification Card */}
            <View className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center mb-3">
                <Bell size={20} color="#3b82f6" />
              </View>
              <Text className="text-neutral-900 font-semibold mb-1">
                Get Notified
              </Text>
              <Text className="text-neutral-500 text-sm mb-3">
                We'll send you a notification when your video is ready. Feel free to
                close this page.
              </Text>
              <Pressable className="bg-primary-500 rounded-lg py-2.5 items-center active:bg-primary-600">
                <Text className="text-white font-medium text-sm">
                  Enable Notifications
                </Text>
              </Pressable>
            </View>

            {/* What's Happening Card */}
            <View className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center mb-3">
                <Sparkles size={20} color="#3b82f6" />
              </View>
              <Text className="text-neutral-900 font-semibold mb-1">
                What's Happening?
              </Text>
              <Text className="text-neutral-500 text-sm">
                Our AI is analyzing your video, translating the speech, generating
                natural voice, and syncing lips for a seamless result.
              </Text>
            </View>
          </View>
        )}

        {/* Completed State Actions */}
        {isCompleted && (
          <View className="px-4 pt-4">
            <Pressable
              className="bg-primary-500 rounded-lg py-4 items-center active:bg-primary-600 mb-3"
              onPress={() => router.replace(`/video/${videoId}`)}
            >
              <Text className="text-white font-semibold">View Video</Text>
            </Pressable>
          </View>
        )}

        {/* Failed State Actions */}
        {isFailed && (
          <View className="px-4 pt-4">
            <Pressable
              className="bg-primary-500 rounded-lg py-4 items-center active:bg-primary-600 mb-3"
              onPress={() => router.push("/(tabs)/upload")}
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </Pressable>
          </View>
        )}

        {/* Bottom Actions */}
        <View className="px-4 pt-6 flex-row gap-3">
          <Pressable
            className="flex-1 bg-neutral-100 rounded-lg py-3.5 items-center active:bg-neutral-200"
            onPress={() => router.push("/(tabs)/upload")}
          >
            <Text className="text-neutral-700 font-medium">
              Upload Another Video
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-white border border-neutral-200 rounded-lg py-3.5 items-center active:bg-neutral-50"
            onPress={() => router.push("/(tabs)/library")}
          >
            <Text className="text-neutral-700 font-medium">View Library</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
