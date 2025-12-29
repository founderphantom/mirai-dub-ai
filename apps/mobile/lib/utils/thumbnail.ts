import * as VideoThumbnails from "expo-video-thumbnails";

/**
 * Generate a thumbnail image from a video file at 1 second
 * @param videoUri - Local file URI of the video
 * @returns URI of the generated thumbnail image, or null if generation failed
 */
export async function generateThumbnail(
  videoUri: string
): Promise<string | null> {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // 1 second into video
      quality: 0.7,
    });
    return uri;
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    return null;
  }
}
