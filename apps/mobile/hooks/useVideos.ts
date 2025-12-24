import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { videosApi, uploadApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { Video, VideoStatus } from "@/types/video";
import { useVideoStore } from "@/stores/videoStore";

/**
 * Hook to fetch paginated list of videos
 */
export function useVideos(status?: VideoStatus) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.videos, status],
    queryFn: async ({ pageParam = 1 }) => {
      return videosApi.getVideos({ page: pageParam, limit: 20, status });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single video by ID
 */
export function useVideo(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.video(id || ""),
    queryFn: () => videosApi.getVideo(id!),
    enabled: !!id,
    // Poll more frequently for processing videos
    refetchInterval: (query) => {
      const video = query.state.data;
      if (video?.status === "processing" || video?.status === "queued") {
        return 3000; // Poll every 3 seconds
      }
      return false;
    },
  });
}

/**
 * Hook to upload a video with progress tracking
 */
export function useUploadVideo() {
  const queryClient = useQueryClient();
  const setUploading = useVideoStore((state) => state.setUploading);
  const setError = useVideoStore((state) => state.setError);

  return useMutation({
    mutationFn: async (params: {
      file: { uri: string; name: string; size: number; type: string };
      options: { sourceLanguage: string; targetLanguage: string; title?: string; durationSeconds?: number };
    }) => {
      setUploading(true, 0);
      setError(null);

      try {
        const result = await uploadApi.uploadVideo(
          params.file,
          params.options,
          (progress) => {
            setUploading(true, progress);
          }
        );
        return result;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Upload failed");
        throw error;
      }
    },
    onSuccess: (result) => {
      setUploading(false, 100);
      // Invalidate videos list to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.videos });
      // Set the video in cache
      queryClient.setQueryData(QUERY_KEYS.video(result.video.id), result.video);
    },
    onError: () => {
      setUploading(false, 0);
    },
  });
}

/**
 * Hook to delete a video
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => videosApi.deleteVideo(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.videos });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData(QUERY_KEYS.videos);

      // Optimistically remove the video from all pages
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.videos }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { pages: Array<{ items: Video[] }> };
        return {
          ...data,
          pages: data.pages?.map((page) => ({
            ...page,
            items: page.items?.filter((v) => v.id !== id),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.videos, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.videos });
    },
  });
}

/**
 * Hook to get download URL for a video
 */
export function useVideoDownloadUrl(id: string | undefined) {
  return useQuery({
    queryKey: ["video-download", id],
    queryFn: () => videosApi.getDownloadUrl(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes (URLs expire)
  });
}

export default useVideos;
