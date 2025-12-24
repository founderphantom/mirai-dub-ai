import { apiClient } from "./client";

export type ProcessingStep = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
};

export type Job = {
  id: string;
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  currentStep: "upload" | "analyze" | "translate" | "voice" | "sync" | "finalize";
  steps: ProcessingStep[];
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletionAt?: string;
};

export const jobsApi = {
  /**
   * Get job status by job ID
   */
  async getJobStatus(jobId: string): Promise<Job> {
    return apiClient.get<Job>(`/api/jobs/${jobId}`);
  },

  /**
   * Get the latest job for a video
   */
  async getVideoJob(videoId: string): Promise<Job> {
    return apiClient.get<Job>(`/api/jobs/video/${videoId}`);
  },
};

// Map backend step IDs to user-friendly descriptions
export const STEP_INFO: Record<string, { title: string; description: string }> = {
  upload: {
    title: "Uploading Video",
    description: "Securely uploading your video to our servers",
  },
  analyze: {
    title: "Analyzing Audio",
    description: "Extracting and analyzing speech patterns",
  },
  translate: {
    title: "Translating Content",
    description: "AI-powered translation to target language",
  },
  voice: {
    title: "Generating Voice",
    description: "Creating natural-sounding dubbed audio",
  },
  sync: {
    title: "Syncing Lips",
    description: "Applying AI lip-sync technology",
  },
  finalize: {
    title: "Finalizing Video",
    description: "Rendering and optimizing final output",
  },
};
