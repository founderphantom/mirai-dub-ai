// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Auto-detect", flag: "🔍", nativeName: "Auto" },
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", nativeName: "Português" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
  { code: "ko", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", flag: "🇵🇱", nativeName: "Polski" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", nativeName: "Türkçe" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", flag: "🇹🇭", nativeName: "ไทย" },
  { code: "id", name: "Indonesian", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },
  { code: "sv", name: "Swedish", flag: "🇸🇪", nativeName: "Svenska" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

// Processing Steps
export const PROCESSING_STEPS = [
  {
    id: "upload",
    title: "Uploading Video",
    description: "Securely uploading your video to our servers",
  },
  {
    id: "analyze",
    title: "Analyzing Audio",
    description: "Extracting and analyzing speech patterns",
  },
  {
    id: "translate",
    title: "Translating Content",
    description: "AI-powered translation to target language",
  },
  {
    id: "voice",
    title: "Generating Voice",
    description: "Creating natural-sounding dubbed audio",
  },
  {
    id: "sync",
    title: "Syncing Lips",
    description: "Applying AI lip-sync technology",
  },
  {
    id: "finalize",
    title: "Finalizing Video",
    description: "Rendering and optimizing final output",
  },
] as const;

// Animation Durations (in ms)
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  base: 200,
  moderate: 300,
  slow: 500,
  slower: 700,
} as const;

// File Constraints
export const FILE_CONSTRAINTS = {
  maxSizeMB: 500,
  maxSizeBytes: 500 * 1024 * 1024,
  supportedFormats: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
  supportedExtensions: [".mp4", ".mov", ".avi", ".webm"],
  maxDurationMinutes: 60,
} as const;

// Credit Plans
export const CREDIT_PLANS = [
  { id: "starter", name: "Starter", minutes: 30, price: 9, popular: false },
  { id: "creator", name: "Creator", minutes: 120, price: 29, popular: true },
  { id: "pro", name: "Pro", minutes: 300, price: 59, popular: false },
  { id: "enterprise", name: "Enterprise", minutes: 1000, price: 149, popular: false },
] as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.miraidub.ai",
  timeout: 30000,
  retryAttempts: 3,
} as const;

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  videos: ["videos"] as const,
  video: (id: string) => ["video", id] as const,
  credits: ["credits"] as const,
  user: ["user"] as const,
  processingStatus: (jobId: string) => ["processing", jobId] as const,
} as const;
