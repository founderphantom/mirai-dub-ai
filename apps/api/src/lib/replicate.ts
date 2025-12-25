import Replicate from "replicate";

/**
 * HeyGen video translate model configuration
 * Note: Replace with actual model version when available
 */
export const HEYGEN_MODEL = {
  owner: "heygen",
  name: "video-translate",
  // This version ID should be updated with the actual HeyGen model version
  version: "latest",
} as const;

/**
 * Map language codes to Replicate's expected language names
 * Based on HeyGen video-translate model requirements
 */
const LANGUAGE_CODE_TO_REPLICATE: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  ru: "Russian",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  sv: "Swedish",
} as const;

/**
 * Convert language code to Replicate's expected format
 * @param code - ISO language code (e.g., "en", "es", "fr")
 * @returns Full language name expected by Replicate (e.g., "English", "Spanish", "French")
 */
export function mapLanguageCodeToReplicate(code: string): string {
  const mapped = LANGUAGE_CODE_TO_REPLICATE[code.toLowerCase()];
  if (!mapped) {
    console.warn(`Unknown language code: ${code}, falling back to English`);
    return "English";
  }
  return mapped;
}

/**
 * Create Replicate client
 */
export function createReplicateClient(apiToken: string): Replicate {
  return new Replicate({ auth: apiToken });
}

/**
 * Input parameters for HeyGen video translate
 */
export interface VideoTranslateInput {
  video: string;
  output_language?: string;
}

/**
 * Create a video translation prediction
 */
export async function createTranslationPrediction(
  replicate: Replicate,
  input: VideoTranslateInput,
  webhookUrl: string
): Promise<{ id: string; status: string }> {
  const prediction = await replicate.predictions.create({
    // Use the model identifier - will need to be updated with actual HeyGen model
    model: `${HEYGEN_MODEL.owner}/${HEYGEN_MODEL.name}`,
    input: {
      video: input.video,
      output_language: input.output_language,
    },
    webhook: webhookUrl,
    webhook_events_filter: ["completed"],
  });

  return {
    id: prediction.id,
    status: prediction.status,
  };
}

/**
 * Get prediction status
 */
export async function getPredictionStatus(
  replicate: Replicate,
  predictionId: string
): Promise<{
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}> {
  const prediction = await replicate.predictions.get(predictionId);

  return {
    id: prediction.id,
    status: prediction.status,
    output: prediction.output as string | string[] | undefined,
    error: prediction.error as string | undefined,
  };
}

/**
 * Cancel a prediction
 */
export async function cancelPrediction(
  replicate: Replicate,
  predictionId: string
): Promise<void> {
  await replicate.predictions.cancel(predictionId);
}

/**
 * Replicate prediction webhook payload
 */
export interface ReplicatePredictionWebhook {
  id: string;
  version: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: Record<string, unknown>;
  output: string | string[] | null;
  error: string | null;
  logs: string | null;
  metrics: {
    predict_time?: number;
  };
}

/**
 * Validate Replicate webhook signature
 * Note: Implement actual signature verification if Replicate provides one
 */
export function validateReplicateWebhook(
  _body: string,
  _signature: string | null | undefined
): boolean {
  // TODO: Implement webhook signature validation when Replicate provides signing
  // For now, we rely on the webhook URL being secret
  return true;
}
