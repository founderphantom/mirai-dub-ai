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
 * Based on HeyGen video-translate model API requirements
 * Format: Exact strings from Replicate API validation
 */
const LANGUAGE_CODE_TO_REPLICATE: Record<string, string> = {
  // Base language codes (no region)
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
  da: "Danish",
  ro: "Romanian",
  fil: "Filipino",
  uk: "Ukrainian",
  el: "Greek",
  cs: "Czech",
  bg: "Bulgarian",
  ms: "Malay",
  sk: "Slovak",
  hr: "Croatian",
  ta: "Tamil",
  fi: "Finnish",

  // Regional variants - Full format as required by Replicate (lowercase keys)
  "fa-ir": "Persian (Iran)",
  "af-za": "Afrikaans (South Africa)",
  "sq-al": "Albanian (Albania)",
  "am-et": "Amharic (Ethiopia)",
  "ar-dz": "Arabic (Algeria)",
  "ar-bh": "Arabic (Bahrain)",
  "ar-eg": "Arabic (Egypt)",
  "ar-iq": "Arabic (Iraq)",
  "ar-jo": "Arabic (Jordan)",
  "ar-kw": "Arabic (Kuwait)",
  "ar-lb": "Arabic (Lebanon)",
  "ar-ly": "Arabic (Libya)",
  "ar-ma": "Arabic (Morocco)",
  "ar-om": "Arabic (Oman)",
  "ar-qa": "Arabic (Qatar)",
  "ar-sa": "Arabic (Saudi Arabia)",
  "ar-sy": "Arabic (Syria)",
  "ar-tn": "Arabic (Tunisia)",
  "ar-ae": "Arabic (United Arab Emirates)",
  "ar-ye": "Arabic (Yemen)",
  "hy-am": "Armenian (Armenia)",
  "az-az": "Azerbaijani (Latin, Azerbaijan)",
  "bn-bd": "Bangla (Bangladesh)",
  "bn-in": "Bengali (India)",
  eu: "Basque",
  "bs-ba": "Bosnian (Bosnia and Herzegovina)",
  "bg-bg": "Bulgarian (Bulgaria)",
  "my-mm": "Burmese (Myanmar)",
  ca: "Catalan",
  "zh-hk": "Chinese (Cantonese, Traditional)",
  "zh-cn-shandong": "Chinese (Jilu Mandarin, Simplified)",
  "zh-cn-mandarin": "Chinese (Mandarin, Simplified)",
  "zh-cn": "Chinese (Mandarin, Simplified)",
  "zh-cn-liaoning": "Chinese (Northeastern Mandarin, Simplified)",
  "zh-cn-sichuan": "Chinese (Southwestern Mandarin, Simplified)",
  "zh-tw": "Chinese (Taiwanese Mandarin, Traditional)",
  "zh-cn-shanghai": "Chinese (Wu, Simplified)",
  "zh-cn-henan": "Chinese (Zhongyuan Mandarin Henan, Simplified)",
  "zh-cn-shaanxi": "Chinese (Zhongyuan Mandarin Shaanxi, Simplified)",
  "hr-hr": "Croatian (Croatia)",
  "cs-cz": "Czech (Czechia)",
  "da-dk": "Danish (Denmark)",
  "nl-be": "Dutch (Belgium)",
  "nl-nl": "Dutch (Netherlands)",
  "en-au": "English (Australia)",
  "en-ca": "English (Canada)",
  "en-hk": "English (Hong Kong SAR)",
  "en-in": "English (India)",
  "en-ie": "English (Ireland)",
  "en-ke": "English (Kenya)",
  "en-nz": "English (New Zealand)",
  "en-ng": "English (Nigeria)",
  "en-ph": "English (Philippines)",
  "en-sg": "English (Singapore)",
  "en-za": "English (South Africa)",
  "en-tz": "English (Tanzania)",
  "en-gb": "English (UK)",
  "en-us": "English (United States)",
  "et-ee": "Estonian (Estonia)",
  "fil-ph": "Filipino (Philippines)",
  "fi-fi": "Finnish (Finland)",
  "fr-be": "French (Belgium)",
  "fr-ca": "French (Canada)",
  "fr-fr": "French (France)",
  "fr-ch": "French (Switzerland)",
  gl: "Galician",
  "ka-ge": "Georgian (Georgia)",
  "de-at": "German (Austria)",
  "de-de": "German (Germany)",
  "de-ch": "German (Switzerland)",
  "el-gr": "Greek (Greece)",
  "gu-in": "Gujarati (India)",
  "he-il": "Hebrew (Israel)",
  "hi-in": "Hindi (India)",
  "hu-hu": "Hungarian (Hungary)",
  "is-is": "Icelandic (Iceland)",
  "id-id": "Indonesian (Indonesia)",
  "ga-ie": "Irish (Ireland)",
  "it-it": "Italian (Italy)",
  "ja-jp": "Japanese (Japan)",
  "jv-id": "Javanese (Latin, Indonesia)",
  "kn-in": "Kannada (India)",
  "kk-kz": "Kazakh (Kazakhstan)",
  "km-kh": "Khmer (Cambodia)",
  "ko-kr": "Korean (Korea)",
  "lo-la": "Lao (Laos)",
  "lv-lv": "Latvian (Latvia)",
  "lt-lt": "Lithuanian (Lithuania)",
  "mk-mk": "Macedonian (North Macedonia)",
  "ms-my": "Malay (Malaysia)",
  "ml-in": "Malayalam (India)",
  "mt-mt": "Maltese (Malta)",
  "mr-in": "Marathi (India)",
  "mn-mn": "Mongolian (Mongolia)",
  "ne-np": "Nepali (Nepal)",
  "nb-no": "Norwegian Bokmål (Norway)",
  "ps-af": "Pashto (Afghanistan)",
  "pl-pl": "Polish (Poland)",
  "pt-br": "Portuguese (Brazil)",
  "pt-pt": "Portuguese (Portugal)",
  "ro-ro": "Romanian (Romania)",
  "ru-ru": "Russian (Russia)",
  "sr-rs": "Serbian (Latin, Serbia)",
  "si-lk": "Sinhala (Sri Lanka)",
  "sk-sk": "Slovak (Slovakia)",
  "sl-si": "Slovenian (Slovenia)",
  "so-so": "Somali (Somalia)",
  "es-ar": "Spanish (Argentina)",
  "es-bo": "Spanish (Bolivia)",
  "es-cl": "Spanish (Chile)",
  "es-co": "Spanish (Colombia)",
  "es-cr": "Spanish (Costa Rica)",
  "es-cu": "Spanish (Cuba)",
  "es-do": "Spanish (Dominican Republic)",
  "es-ec": "Spanish (Ecuador)",
  "es-sv": "Spanish (El Salvador)",
  "es-gq": "Spanish (Equatorial Guinea)",
  "es-gt": "Spanish (Guatemala)",
  "es-hn": "Spanish (Honduras)",
  "es-mx": "Spanish (Mexico)",
  "es-ni": "Spanish (Nicaragua)",
  "es-pa": "Spanish (Panama)",
  "es-py": "Spanish (Paraguay)",
  "es-pe": "Spanish (Peru)",
  "es-pr": "Spanish (Puerto Rico)",
  "es-es": "Spanish (Spain)",
  "es-us": "Spanish (United States)",
  "es-uy": "Spanish (Uruguay)",
  "es-ve": "Spanish (Venezuela)",
  "su-id": "Sundanese (Indonesia)",
  "sw-ke": "Swahili (Kenya)",
  "sw-tz": "Swahili (Tanzania)",
  "sv-se": "Swedish (Sweden)",
  "ta-in": "Tamil (India)",
  "ta-my": "Tamil (Malaysia)",
  "ta-sg": "Tamil (Singapore)",
  "ta-lk": "Tamil (Sri Lanka)",
  "te-in": "Telugu (India)",
  "th-th": "Thai (Thailand)",
  "tr-tr": "Turkish (Türkiye)",
  "uk-ua": "Ukrainian (Ukraine)",
  "ur-in": "Urdu (India)",
  "ur-pk": "Urdu (Pakistan)",
  "uz-uz": "Uzbek (Latin, Uzbekistan)",
  "vi-vn": "Vietnamese (Vietnam)",
  "cy-gb": "Welsh (United Kingdom)",
  "zu-za": "Zulu (South Africa)",
  "en-accent": "English - Your Accent",
  "en-us-accent": "English - American Accent",
} as const;

/**
 * Convert language code to Replicate's expected format
 * Handles both base codes (e.g., "en") and regional variants (e.g., "en-US", "fa-IR")
 * @param code - ISO language code (e.g., "en", "es", "fr", "fa-IR")
 * @returns Full language name expected by Replicate (e.g., "English", "Spanish", "French", "Persian")
 */
export function mapLanguageCodeToReplicate(code: string): string {
  // Normalize to lowercase
  const normalizedCode = code.toLowerCase();

  // Try exact match first
  let mapped = LANGUAGE_CODE_TO_REPLICATE[normalizedCode];

  // If not found and code contains a hyphen (regional variant), try base language code
  if (!mapped && normalizedCode.includes('-')) {
    const baseCode = normalizedCode.split('-')[0];
    mapped = LANGUAGE_CODE_TO_REPLICATE[baseCode];
  }

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
 * Validate Replicate webhook signature using HMAC-SHA256
 * Based on Replicate's webhook verification documentation
 */
export async function validateReplicateWebhook(
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string,
  body: string,
  secret: string
): Promise<boolean> {
  if (!secret) {
    console.warn("REPLICATE_WEBHOOK_SIGNING_SECRET not set - webhook validation disabled");
    return true;
  }

  try {
    // Extract the secret (remove 'whsec_' prefix if present)
    const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;

    // Construct signed content: webhook-id.webhook-timestamp.body
    const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;

    // Generate expected signature using HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(signedContent);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    // webhook-signature header may contain multiple signatures with version prefixes
    // Format: "v1,signature1 v1,signature2"
    const signatures = webhookSignature.split(' ').map(sig => {
      const parts = sig.split(',');
      return parts.length > 1 ? parts[1] : sig;
    });

    return signatures.includes(expectedSignature);
  } catch (error) {
    console.error("Webhook signature validation error:", error);
    return false;
  }
}
