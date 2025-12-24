export type VideoStatus = "uploading" | "queued" | "processing" | "completed" | "failed";

export type ProcessingStepStatus = "pending" | "in-progress" | "completed" | "failed";

export type ProcessingStep = {
  id: string;
  title: string;
  description: string;
  status: ProcessingStepStatus;
  estimatedTime?: string;
};

export type Video = {
  id: string;
  userId: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  resolution: string | null;
  mimeType: string;
  status: VideoStatus;
  progress: number;
  errorMessage: string | null;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  // URL fields (populated by API)
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
};

export type UploadOptions = {
  sourceLanguage: string;
  targetLanguage: string;
  title?: string;
  durationSeconds?: number;
};

export type TranslationJob = {
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

// Helper to format duration for display
export function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Helper to format file size for display
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) {
    return `${(mb / 1000).toFixed(1)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}
