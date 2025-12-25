import { apiClient, PaginatedData } from "./client";
import type { Video, VideoStatus } from "@/types/video";

export type VideoListParams = {
  page?: number;
  limit?: number;
  status?: VideoStatus;
};

export type VideoWithJob = Video & {
  job?: {
    id: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    currentStep: string;
  };
};

export const videosApi = {
  /**
   * Get paginated list of user's videos
   */
  async getVideos(params: VideoListParams = {}): Promise<PaginatedData<Video>> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.status) query.set("status", params.status);

    const queryString = query.toString();
    const endpoint = `/api/videos${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<PaginatedData<Video>>(endpoint);
  },

  /**
   * Get single video by ID with job status
   */
  async getVideo(id: string): Promise<VideoWithJob> {
    return apiClient.get<VideoWithJob>(`/api/videos/${id}`);
  },

  /**
   * Delete a video
   */
  async deleteVideo(id: string): Promise<void> {
    await apiClient.delete(`/api/videos/${id}`);
  },

  /**
   * Get signed download URL for translated video
   */
  async getDownloadUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    return apiClient.get<{ url: string; expiresAt: string }>(`/api/videos/${id}/download-url`);
  },
};
