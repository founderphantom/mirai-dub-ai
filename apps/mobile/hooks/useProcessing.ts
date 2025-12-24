import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsApi, videosApi, STEP_INFO } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { Job, ProcessingStep } from "@/lib/api/jobs";

/**
 * Hook to poll job status by job ID
 */
export function useJobStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.processingStatus(jobId || ""),
    queryFn: () => jobsApi.getJobStatus(jobId!),
    enabled: !!jobId,
    // Poll every 2 seconds while processing
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job?.status === "processing" || job?.status === "pending") {
        return 2000;
      }
      return false;
    },
    // Keep polling even when tab is not focused
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to get the latest job for a video
 */
export function useVideoJob(videoId: string | undefined) {
  return useQuery({
    queryKey: ["video-job", videoId],
    queryFn: () => jobsApi.getVideoJob(videoId!),
    enabled: !!videoId,
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job?.status === "processing" || job?.status === "pending") {
        return 2000;
      }
      return false;
    },
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to track processing progress for a video
 * Combines video status and job status polling
 */
export function useProcessingProgress(videoId: string | undefined) {
  const queryClient = useQueryClient();

  // Poll video status
  const {
    data: video,
    isLoading: videoLoading,
    error: videoError,
  } = useQuery({
    queryKey: QUERY_KEYS.video(videoId || ""),
    queryFn: () => videosApi.getVideo(videoId!),
    enabled: !!videoId,
    refetchInterval: (query) => {
      const v = query.state.data;
      if (v?.status === "processing" || v?.status === "queued") {
        return 3000;
      }
      return false;
    },
  });

  // Get job status for detailed step info
  const { data: job } = useVideoJob(videoId);

  const isQueued = video?.status === "queued";
  const isProcessing = video?.status === "processing";
  const isCompleted = video?.status === "completed";
  const isFailed = video?.status === "failed";
  const progress = video?.progress || 0;

  // Build processing steps with status
  const steps: ProcessingStep[] = job?.steps || Object.keys(STEP_INFO).map((id) => ({
    id,
    title: STEP_INFO[id].title,
    description: STEP_INFO[id].description,
    status: "pending" as const,
  }));

  // Update step statuses based on current step
  const currentStepIndex = job?.currentStep
    ? Object.keys(STEP_INFO).indexOf(job.currentStep)
    : -1;

  const stepsWithStatus = steps.map((step, index) => {
    const stepIndex = Object.keys(STEP_INFO).indexOf(step.id);
    let status: ProcessingStep["status"] = "pending";

    if (isFailed && stepIndex === currentStepIndex) {
      status = "failed";
    } else if (stepIndex < currentStepIndex) {
      status = "completed";
    } else if (stepIndex === currentStepIndex && isProcessing) {
      status = "in-progress";
    }

    return { ...step, status };
  });

  return {
    video,
    job,
    steps: stepsWithStatus,
    currentStep: job?.currentStep,
    isLoading: videoLoading,
    error: videoError,
    isQueued,
    isProcessing,
    isCompleted,
    isFailed,
    progress,
    errorMessage: video?.errorMessage || job?.errorMessage,
  };
}

export default useJobStatus;
