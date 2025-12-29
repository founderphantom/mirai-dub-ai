import { Platform } from "react-native";
import { apiClient } from "./client";
import { authClient } from "./auth";
import { API_CONFIG } from "@/lib/constants";

export type UploadInitiateParams = {
  fileName: string;
  fileSize: number;
  contentType: string;
  sourceLanguage?: string; // Optional for auto-detect
  targetLanguage: string;
  title?: string;
  durationSeconds?: number;
};

export type UploadInitiateResponse = {
  videoId: string;
  uploadId: string;
  uploadUrl: string;
  estimatedCredits: number;
};

export type UploadCompleteResponse = {
  video: {
    id: string;
    status: string;
  };
  job: {
    id: string;
    status: string;
  };
};

export type UploadProgressCallback = (progress: number) => void;

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const uploadApi = {
  /**
   * Initiate a new video upload
   */
  async initiateUpload(params: UploadInitiateParams): Promise<UploadInitiateResponse> {
    return apiClient.post<UploadInitiateResponse>("/api/upload/initiate", params);
  },

  /**
   * Upload a chunk of the video file
   */
  async uploadChunk(
    videoId: string,
    chunk: Blob,
    partNumber: number,
    totalParts: number
  ): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream", // Raw binary
      "X-Part-Number": partNumber.toString(),
      "X-Total-Parts": totalParts.toString(),
    };

    let credentials: RequestCredentials = "include";

    // On native, manually add cookies (credentials: "include" doesn't work in RN)
    if (Platform.OS !== "web") {
      const cookies = authClient.getCookie();
      if (cookies) {
        headers["Cookie"] = cookies;
      }
      credentials = "omit";
    }

    // Send Blob directly (NOT FormData)
    const response = await fetch(`${API_CONFIG.baseUrl}/api/upload/${videoId}/chunk`, {
      method: "PUT",
      headers,
      body: chunk, // Raw binary Blob
      credentials,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Chunk upload failed" } }));
      throw new Error(error.error?.message || "Chunk upload failed");
    }
  },

  /**
   * Complete the upload after all chunks are uploaded
   */
  async completeUpload(videoId: string, fileSize?: number): Promise<UploadCompleteResponse> {
    return apiClient.post<UploadCompleteResponse>(`/api/upload/${videoId}/complete`, {
      fileSize,
    });
  },

  /**
   * Abort upload and cleanup
   */
  async abortUpload(videoId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/upload/${videoId}/abort`);
    } catch (err) {
      console.error("Failed to abort upload:", err);
    }
  },

  /**
   * Upload a complete video file with progress tracking
   * Handles chunking automatically for large files
   */
  async uploadVideo(
    file: { uri: string; name: string; size: number; type: string },
    options: {
      sourceLanguage?: string; // Optional for auto-detect
      targetLanguage: string;
      title?: string;
      durationSeconds?: number;
    },
    onProgress?: UploadProgressCallback
  ): Promise<UploadCompleteResponse> {
    // 1. Initiate upload
    const initResponse = await this.initiateUpload({
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
      title: options.title,
      durationSeconds: options.durationSeconds,
    });

    const { videoId } = initResponse;

    try {
      // 2. Read file and upload in chunks
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);
      let uploadedBytes = 0;

      for (let i = 0; i < totalChunks; i++) {
        const partNumber = i + 1; // R2 uses 1-indexed parts
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, blob.size);
        const chunk = blob.slice(start, end);

        // Upload with retry
        let retries = 3;
        while (retries > 0) {
          try {
            await this.uploadChunk(videoId, chunk, partNumber, totalChunks);
            break;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            await new Promise((r) => setTimeout(r, 1000)); // Wait 1s before retry
          }
        }

        uploadedBytes += chunk.size;
        const progress = Math.round((uploadedBytes / blob.size) * 100);
        onProgress?.(progress);
      }

      // 3. Complete upload
      return this.completeUpload(videoId, file.size);
    } catch (error) {
      // Abort upload on error
      await this.abortUpload(videoId);
      throw error;
    }
  },
};
