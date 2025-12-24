import { create } from "zustand";

// Upload state managed locally (not persisted)
type VideoState = {
  isUploading: boolean;
  uploadProgress: number;
  currentUploadVideoId: string | null;
  error: string | null;
};

type VideoActions = {
  setUploading: (uploading: boolean, progress?: number) => void;
  setCurrentUploadVideoId: (videoId: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
};

type VideoStore = VideoState & VideoActions;

const initialState: VideoState = {
  isUploading: false,
  uploadProgress: 0,
  currentUploadVideoId: null,
  error: null,
};

export const useVideoStore = create<VideoStore>()((set) => ({
  ...initialState,

  setUploading: (uploading: boolean, progress = 0) => {
    set({ isUploading: uploading, uploadProgress: progress });
  },

  setCurrentUploadVideoId: (videoId: string | null) => {
    set({ currentUploadVideoId: videoId });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// Re-export Video type for convenience
export type { Video, VideoStatus } from "@/types/video";
