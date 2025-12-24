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
  maxChunkSize: number;
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
    offset: number,
    totalSize: number
  ): Promise<void> {
    const formData = new FormData();
    formData.append("chunk", chunk);

    // Get cookies from Better Auth for Expo compatibility
    const cookies = authClient.getCookie();
    const headers: Record<string, string> = {
      "X-Chunk-Offset": offset.toString(),
      "X-Total-Size": totalSize.toString(),
    };

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(`${API_CONFIG.baseUrl}/api/upload/${videoId}/chunk`, {
      method: "PUT",
      headers,
      body: formData,
      credentials: "omit", // Use "omit" when manually setting cookies (Expo best practice)
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

    // 2. Read file and upload in chunks
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);
    let uploadedBytes = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, blob.size);
      const chunk = blob.slice(start, end);

      await this.uploadChunk(videoId, chunk, start, blob.size);

      uploadedBytes += chunk.size;
      const progress = Math.round((uploadedBytes / blob.size) * 100);
      onProgress?.(progress);
    }

    // 3. Complete upload
    return this.completeUpload(videoId, file.size);
  },
};
