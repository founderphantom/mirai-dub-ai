// Supported Languages - Full HeyGen API Support
export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Auto-detect", flag: "🔍", nativeName: "Auto" },

  // Popular Languages (General)
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "pl", name: "Polish", flag: "🇵🇱", nativeName: "Polski" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", nativeName: "Nederlands" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", nativeName: "Türkçe" },
  { code: "ko", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
  { code: "da", name: "Danish", flag: "🇩🇰", nativeName: "Dansk" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "ro", name: "Romanian", flag: "🇷🇴", nativeName: "Română" },
  { code: "zh-CN", name: "Mandarin", flag: "🇨🇳", nativeName: "普通话" },
  { code: "fil", name: "Filipino", flag: "🇵🇭", nativeName: "Filipino" },
  { code: "sv", name: "Swedish", flag: "🇸🇪", nativeName: "Svenska" },
  { code: "id", name: "Indonesian", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦", nativeName: "Українська" },
  { code: "el", name: "Greek", flag: "🇬🇷", nativeName: "Ελληνικά" },
  { code: "cs", name: "Czech", flag: "🇨🇿", nativeName: "Čeština" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬", nativeName: "Български" },
  { code: "ms", name: "Malay", flag: "🇲🇾", nativeName: "Bahasa Melayu" },
  { code: "sk", name: "Slovak", flag: "🇸🇰", nativeName: "Slovenčina" },
  { code: "hr", name: "Croatian", flag: "🇭🇷", nativeName: "Hrvatski" },
  { code: "ta", name: "Tamil", flag: "🇮🇳", nativeName: "தமிழ்" },
  { code: "fi", name: "Finnish", flag: "🇫🇮", nativeName: "Suomi" },
  { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },

  // Regional Variants - Afrikaans
  { code: "af-ZA", name: "Afrikaans (South Africa)", flag: "🇿🇦", nativeName: "Afrikaans" },

  // Regional Variants - Albanian
  { code: "sq-AL", name: "Albanian (Albania)", flag: "🇦🇱", nativeName: "Shqip" },

  // Regional Variants - Amharic
  { code: "am-ET", name: "Amharic (Ethiopia)", flag: "🇪🇹", nativeName: "አማርኛ" },

  // Regional Variants - Arabic
  { code: "ar-DZ", name: "Arabic (Algeria)", flag: "🇩🇿", nativeName: "العربية" },
  { code: "ar-BH", name: "Arabic (Bahrain)", flag: "🇧🇭", nativeName: "العربية" },
  { code: "ar-EG", name: "Arabic (Egypt)", flag: "🇪🇬", nativeName: "العربية" },
  { code: "ar-IQ", name: "Arabic (Iraq)", flag: "🇮🇶", nativeName: "العربية" },
  { code: "ar-JO", name: "Arabic (Jordan)", flag: "🇯🇴", nativeName: "العربية" },
  { code: "ar-KW", name: "Arabic (Kuwait)", flag: "🇰🇼", nativeName: "العربية" },
  { code: "ar-LB", name: "Arabic (Lebanon)", flag: "🇱🇧", nativeName: "العربية" },
  { code: "ar-LY", name: "Arabic (Libya)", flag: "🇱🇾", nativeName: "العربية" },
  { code: "ar-MA", name: "Arabic (Morocco)", flag: "🇲🇦", nativeName: "العربية" },
  { code: "ar-OM", name: "Arabic (Oman)", flag: "🇴🇲", nativeName: "العربية" },
  { code: "ar-QA", name: "Arabic (Qatar)", flag: "🇶🇦", nativeName: "العربية" },
  { code: "ar-SA", name: "Arabic (Saudi Arabia)", flag: "🇸🇦", nativeName: "العربية" },
  { code: "ar-SY", name: "Arabic (Syria)", flag: "🇸🇾", nativeName: "العربية" },
  { code: "ar-TN", name: "Arabic (Tunisia)", flag: "🇹🇳", nativeName: "العربية" },
  { code: "ar-AE", name: "Arabic (United Arab Emirates)", flag: "🇦🇪", nativeName: "العربية" },
  { code: "ar-YE", name: "Arabic (Yemen)", flag: "🇾🇪", nativeName: "العربية" },

  // Regional Variants - Armenian
  { code: "hy-AM", name: "Armenian (Armenia)", flag: "🇦🇲", nativeName: "Հայերեն" },

  // Regional Variants - Azerbaijani
  { code: "az-AZ", name: "Azerbaijani (Latin, Azerbaijan)", flag: "🇦🇿", nativeName: "Azərbaycan" },

  // Regional Variants - Bangla/Bengali
  { code: "bn-BD", name: "Bangla (Bangladesh)", flag: "🇧🇩", nativeName: "বাংলা" },
  { code: "bn-IN", name: "Bengali (India)", flag: "🇮🇳", nativeName: "বাংলা" },

  // Regional Variants - Basque
  { code: "eu", name: "Basque", flag: "🇪🇸", nativeName: "Euskara" },

  // Regional Variants - Bosnian
  { code: "bs-BA", name: "Bosnian (Bosnia and Herzegovina)", flag: "🇧🇦", nativeName: "Bosanski" },

  // Regional Variants - Bulgarian
  { code: "bg-BG", name: "Bulgarian (Bulgaria)", flag: "🇧🇬", nativeName: "Български" },

  // Regional Variants - Burmese
  { code: "my-MM", name: "Burmese (Myanmar)", flag: "🇲🇲", nativeName: "မြန်မာ" },

  // Regional Variants - Catalan
  { code: "ca", name: "Catalan", flag: "🇪🇸", nativeName: "Català" },

  // Regional Variants - Chinese
  { code: "zh-HK", name: "Chinese (Cantonese, Traditional)", flag: "🇭🇰", nativeName: "粵語" },
  { code: "zh-CN-shandong", name: "Chinese (Jilu Mandarin, Simplified)", flag: "🇨🇳", nativeName: "冀鲁官话" },
  { code: "zh-CN-mandarin", name: "Chinese (Mandarin, Simplified)", flag: "🇨🇳", nativeName: "普通话" },
  { code: "zh-CN-liaoning", name: "Chinese (Northeastern Mandarin, Simplified)", flag: "🇨🇳", nativeName: "东北官话" },
  { code: "zh-CN-sichuan", name: "Chinese (Southwestern Mandarin, Simplified)", flag: "🇨🇳", nativeName: "西南官话" },
  { code: "zh-TW", name: "Chinese (Taiwanese Mandarin, Traditional)", flag: "🇹🇼", nativeName: "國語" },
  { code: "zh-CN-shanghai", name: "Chinese (Wu, Simplified)", flag: "🇨🇳", nativeName: "吴语" },
  { code: "zh-CN-henan", name: "Chinese (Zhongyuan Mandarin Henan, Simplified)", flag: "🇨🇳", nativeName: "中原官话" },
  { code: "zh-CN-shaanxi", name: "Chinese (Zhongyuan Mandarin Shaanxi, Simplified)", flag: "🇨🇳", nativeName: "陕西话" },

  // Regional Variants - Croatian
  { code: "hr-HR", name: "Croatian (Croatia)", flag: "🇭🇷", nativeName: "Hrvatski" },

  // Regional Variants - Czech
  { code: "cs-CZ", name: "Czech (Czechia)", flag: "🇨🇿", nativeName: "Čeština" },

  // Regional Variants - Danish
  { code: "da-DK", name: "Danish (Denmark)", flag: "🇩🇰", nativeName: "Dansk" },

  // Regional Variants - Dutch
  { code: "nl-BE", name: "Dutch (Belgium)", flag: "🇧🇪", nativeName: "Nederlands" },
  { code: "nl-NL", name: "Dutch (Netherlands)", flag: "🇳🇱", nativeName: "Nederlands" },

  // Regional Variants - English
  { code: "en-AU", name: "English (Australia)", flag: "🇦🇺", nativeName: "English" },
  { code: "en-CA", name: "English (Canada)", flag: "🇨🇦", nativeName: "English" },
  { code: "en-HK", name: "English (Hong Kong SAR)", flag: "🇭🇰", nativeName: "English" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳", nativeName: "English" },
  { code: "en-IE", name: "English (Ireland)", flag: "🇮🇪", nativeName: "English" },
  { code: "en-KE", name: "English (Kenya)", flag: "🇰🇪", nativeName: "English" },
  { code: "en-NZ", name: "English (New Zealand)", flag: "🇳🇿", nativeName: "English" },
  { code: "en-NG", name: "English (Nigeria)", flag: "🇳🇬", nativeName: "English" },
  { code: "en-PH", name: "English (Philippines)", flag: "🇵🇭", nativeName: "English" },
  { code: "en-SG", name: "English (Singapore)", flag: "🇸🇬", nativeName: "English" },
  { code: "en-ZA", name: "English (South Africa)", flag: "🇿🇦", nativeName: "English" },
  { code: "en-TZ", name: "English (Tanzania)", flag: "🇹🇿", nativeName: "English" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧", nativeName: "English" },
  { code: "en-US", name: "English (United States)", flag: "🇺🇸", nativeName: "English" },

  // Regional Variants - Estonian
  { code: "et-EE", name: "Estonian (Estonia)", flag: "🇪🇪", nativeName: "Eesti" },

  // Regional Variants - Filipino
  { code: "fil-PH", name: "Filipino (Philippines)", flag: "🇵🇭", nativeName: "Filipino" },

  // Regional Variants - Finnish
  { code: "fi-FI", name: "Finnish (Finland)", flag: "🇫🇮", nativeName: "Suomi" },

  // Regional Variants - French
  { code: "fr-BE", name: "French (Belgium)", flag: "🇧🇪", nativeName: "Français" },
  { code: "fr-CA", name: "French (Canada)", flag: "🇨🇦", nativeName: "Français" },
  { code: "fr-FR", name: "French (France)", flag: "🇫🇷", nativeName: "Français" },
  { code: "fr-CH", name: "French (Switzerland)", flag: "🇨🇭", nativeName: "Français" },

  // Regional Variants - Galician
  { code: "gl", name: "Galician", flag: "🇪🇸", nativeName: "Galego" },

  // Regional Variants - Georgian
  { code: "ka-GE", name: "Georgian (Georgia)", flag: "🇬🇪", nativeName: "ქართული" },

  // Regional Variants - German
  { code: "de-AT", name: "German (Austria)", flag: "🇦🇹", nativeName: "Deutsch" },
  { code: "de-DE", name: "German (Germany)", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "de-CH", name: "German (Switzerland)", flag: "🇨🇭", nativeName: "Deutsch" },

  // Regional Variants - Greek
  { code: "el-GR", name: "Greek (Greece)", flag: "🇬🇷", nativeName: "Ελληνικά" },

  // Regional Variants - Gujarati
  { code: "gu-IN", name: "Gujarati (India)", flag: "🇮🇳", nativeName: "ગુજરાતી" },

  // Regional Variants - Hebrew
  { code: "he-IL", name: "Hebrew (Israel)", flag: "🇮🇱", nativeName: "עברית" },

  // Regional Variants - Hindi
  { code: "hi-IN", name: "Hindi (India)", flag: "🇮🇳", nativeName: "हिन्दी" },

  // Regional Variants - Hungarian
  { code: "hu-HU", name: "Hungarian (Hungary)", flag: "🇭🇺", nativeName: "Magyar" },

  // Regional Variants - Icelandic
  { code: "is-IS", name: "Icelandic (Iceland)", flag: "🇮🇸", nativeName: "Íslenska" },

  // Regional Variants - Indonesian
  { code: "id-ID", name: "Indonesian (Indonesia)", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },

  // Regional Variants - Irish
  { code: "ga-IE", name: "Irish (Ireland)", flag: "🇮🇪", nativeName: "Gaeilge" },

  // Regional Variants - Italian
  { code: "it-IT", name: "Italian (Italy)", flag: "🇮🇹", nativeName: "Italiano" },

  // Regional Variants - Japanese
  { code: "ja-JP", name: "Japanese (Japan)", flag: "🇯🇵", nativeName: "日本語" },

  // Regional Variants - Javanese
  { code: "jv-ID", name: "Javanese (Latin, Indonesia)", flag: "🇮🇩", nativeName: "Basa Jawa" },

  // Regional Variants - Kannada
  { code: "kn-IN", name: "Kannada (India)", flag: "🇮🇳", nativeName: "ಕನ್ನಡ" },

  // Regional Variants - Kazakh
  { code: "kk-KZ", name: "Kazakh (Kazakhstan)", flag: "🇰🇿", nativeName: "Қазақ" },

  // Regional Variants - Khmer
  { code: "km-KH", name: "Khmer (Cambodia)", flag: "🇰🇭", nativeName: "ខ្មែរ" },

  // Regional Variants - Korean
  { code: "ko-KR", name: "Korean (Korea)", flag: "🇰🇷", nativeName: "한국어" },

  // Regional Variants - Lao
  { code: "lo-LA", name: "Lao (Laos)", flag: "🇱🇦", nativeName: "ລາວ" },

  // Regional Variants - Latvian
  { code: "lv-LV", name: "Latvian (Latvia)", flag: "🇱🇻", nativeName: "Latviešu" },

  // Regional Variants - Lithuanian
  { code: "lt-LT", name: "Lithuanian (Lithuania)", flag: "🇱🇹", nativeName: "Lietuvių" },

  // Regional Variants - Macedonian
  { code: "mk-MK", name: "Macedonian (North Macedonia)", flag: "🇲🇰", nativeName: "Македонски" },

  // Regional Variants - Malay
  { code: "ms-MY", name: "Malay (Malaysia)", flag: "🇲🇾", nativeName: "Bahasa Melayu" },

  // Regional Variants - Malayalam
  { code: "ml-IN", name: "Malayalam (India)", flag: "🇮🇳", nativeName: "മലയാളം" },

  // Regional Variants - Maltese
  { code: "mt-MT", name: "Maltese (Malta)", flag: "🇲🇹", nativeName: "Malti" },

  // Regional Variants - Marathi
  { code: "mr-IN", name: "Marathi (India)", flag: "🇮🇳", nativeName: "मराठी" },

  // Regional Variants - Mongolian
  { code: "mn-MN", name: "Mongolian (Mongolia)", flag: "🇲🇳", nativeName: "Монгол" },

  // Regional Variants - Nepali
  { code: "ne-NP", name: "Nepali (Nepal)", flag: "🇳🇵", nativeName: "नेपाली" },

  // Regional Variants - Norwegian
  { code: "nb-NO", name: "Norwegian Bokmål (Norway)", flag: "🇳🇴", nativeName: "Norsk" },

  // Regional Variants - Pashto
  { code: "ps-AF", name: "Pashto (Afghanistan)", flag: "🇦🇫", nativeName: "پښتو" },

  // Regional Variants - Persian
  { code: "fa-IR", name: "Persian (Iran)", flag: "🇮🇷", nativeName: "فارسی" },

  // Regional Variants - Polish
  { code: "pl-PL", name: "Polish (Poland)", flag: "🇵🇱", nativeName: "Polski" },

  // Regional Variants - Portuguese
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷", nativeName: "Português" },
  { code: "pt-PT", name: "Portuguese (Portugal)", flag: "🇵🇹", nativeName: "Português" },

  // Regional Variants - Romanian
  { code: "ro-RO", name: "Romanian (Romania)", flag: "🇷🇴", nativeName: "Română" },

  // Regional Variants - Russian
  { code: "ru-RU", name: "Russian (Russia)", flag: "🇷🇺", nativeName: "Русский" },

  // Regional Variants - Serbian
  { code: "sr-RS", name: "Serbian (Latin, Serbia)", flag: "🇷🇸", nativeName: "Srpski" },

  // Regional Variants - Sinhala
  { code: "si-LK", name: "Sinhala (Sri Lanka)", flag: "🇱🇰", nativeName: "සිංහල" },

  // Regional Variants - Slovak
  { code: "sk-SK", name: "Slovak (Slovakia)", flag: "🇸🇰", nativeName: "Slovenčina" },

  // Regional Variants - Slovenian
  { code: "sl-SI", name: "Slovenian (Slovenia)", flag: "🇸🇮", nativeName: "Slovenščina" },

  // Regional Variants - Somali
  { code: "so-SO", name: "Somali (Somalia)", flag: "🇸🇴", nativeName: "Soomaali" },

  // Regional Variants - Spanish
  { code: "es-AR", name: "Spanish (Argentina)", flag: "🇦🇷", nativeName: "Español" },
  { code: "es-BO", name: "Spanish (Bolivia)", flag: "🇧🇴", nativeName: "Español" },
  { code: "es-CL", name: "Spanish (Chile)", flag: "🇨🇱", nativeName: "Español" },
  { code: "es-CO", name: "Spanish (Colombia)", flag: "🇨🇴", nativeName: "Español" },
  { code: "es-CR", name: "Spanish (Costa Rica)", flag: "🇨🇷", nativeName: "Español" },
  { code: "es-CU", name: "Spanish (Cuba)", flag: "🇨🇺", nativeName: "Español" },
  { code: "es-DO", name: "Spanish (Dominican Republic)", flag: "🇩🇴", nativeName: "Español" },
  { code: "es-EC", name: "Spanish (Ecuador)", flag: "🇪🇨", nativeName: "Español" },
  { code: "es-SV", name: "Spanish (El Salvador)", flag: "🇸🇻", nativeName: "Español" },
  { code: "es-GQ", name: "Spanish (Equatorial Guinea)", flag: "🇬🇶", nativeName: "Español" },
  { code: "es-GT", name: "Spanish (Guatemala)", flag: "🇬🇹", nativeName: "Español" },
  { code: "es-HN", name: "Spanish (Honduras)", flag: "🇭🇳", nativeName: "Español" },
  { code: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽", nativeName: "Español" },
  { code: "es-NI", name: "Spanish (Nicaragua)", flag: "🇳🇮", nativeName: "Español" },
  { code: "es-PA", name: "Spanish (Panama)", flag: "🇵🇦", nativeName: "Español" },
  { code: "es-PY", name: "Spanish (Paraguay)", flag: "🇵🇾", nativeName: "Español" },
  { code: "es-PE", name: "Spanish (Peru)", flag: "🇵🇪", nativeName: "Español" },
  { code: "es-PR", name: "Spanish (Puerto Rico)", flag: "🇵🇷", nativeName: "Español" },
  { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸", nativeName: "Español" },
  { code: "es-US", name: "Spanish (United States)", flag: "🇺🇸", nativeName: "Español" },
  { code: "es-UY", name: "Spanish (Uruguay)", flag: "🇺🇾", nativeName: "Español" },
  { code: "es-VE", name: "Spanish (Venezuela)", flag: "🇻🇪", nativeName: "Español" },

  // Regional Variants - Sundanese
  { code: "su-ID", name: "Sundanese (Indonesia)", flag: "🇮🇩", nativeName: "Basa Sunda" },

  // Regional Variants - Swahili
  { code: "sw-KE", name: "Swahili (Kenya)", flag: "🇰🇪", nativeName: "Kiswahili" },
  { code: "sw-TZ", name: "Swahili (Tanzania)", flag: "🇹🇿", nativeName: "Kiswahili" },

  // Regional Variants - Swedish
  { code: "sv-SE", name: "Swedish (Sweden)", flag: "🇸🇪", nativeName: "Svenska" },

  // Regional Variants - Tamil
  { code: "ta-IN", name: "Tamil (India)", flag: "🇮🇳", nativeName: "தமிழ்" },
  { code: "ta-MY", name: "Tamil (Malaysia)", flag: "🇲🇾", nativeName: "தமிழ்" },
  { code: "ta-SG", name: "Tamil (Singapore)", flag: "🇸🇬", nativeName: "தமிழ்" },
  { code: "ta-LK", name: "Tamil (Sri Lanka)", flag: "🇱🇰", nativeName: "தமிழ்" },

  // Regional Variants - Telugu
  { code: "te-IN", name: "Telugu (India)", flag: "🇮🇳", nativeName: "తెలుగు" },

  // Regional Variants - Thai
  { code: "th-TH", name: "Thai (Thailand)", flag: "🇹🇭", nativeName: "ไทย" },

  // Regional Variants - Turkish
  { code: "tr-TR", name: "Turkish (Türkiye)", flag: "🇹🇷", nativeName: "Türkçe" },

  // Regional Variants - Ukrainian
  { code: "uk-UA", name: "Ukrainian (Ukraine)", flag: "🇺🇦", nativeName: "Українська" },

  // Regional Variants - Urdu
  { code: "ur-IN", name: "Urdu (India)", flag: "🇮🇳", nativeName: "اردو" },
  { code: "ur-PK", name: "Urdu (Pakistan)", flag: "🇵🇰", nativeName: "اردو" },

  // Regional Variants - Uzbek
  { code: "uz-UZ", name: "Uzbek (Latin, Uzbekistan)", flag: "🇺🇿", nativeName: "O'zbek" },

  // Regional Variants - Vietnamese
  { code: "vi-VN", name: "Vietnamese (Vietnam)", flag: "🇻🇳", nativeName: "Tiếng Việt" },

  // Regional Variants - Welsh
  { code: "cy-GB", name: "Welsh (United Kingdom)", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", nativeName: "Cymraeg" },

  // Regional Variants - Zulu
  { code: "zu-ZA", name: "Zulu (South Africa)", flag: "🇿🇦", nativeName: "isiZulu" },

  // Special Variants
  { code: "en-accent", name: "English - Your Accent", flag: "🌍", nativeName: "English" },
  { code: "en-US-accent", name: "English - American Accent", flag: "🇺🇸", nativeName: "English" },
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
  // Standard MIME types plus aliases for web browser compatibility
  supportedFormats: [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/3gpp",
    // MIME type aliases that browsers may return
    "video/mov",
    "video/x-m4v",
  ],
  supportedExtensions: [".mp4", ".mov", ".avi", ".webm", ".m4v", ".3gp"],
  maxDurationMinutes: 60,
} as const;

// Credit Plans (in seconds for short-form content creators)
export const CREDIT_PLANS = [
  { id: "starter", name: "Starter", seconds: 160, price: 9, popular: false },
  { id: "creator", name: "Creator", seconds: 520, price: 29, popular: true },
  { id: "pro", name: "Pro", seconds: 1100, price: 59, popular: false },
  { id: "enterprise", name: "Enterprise", seconds: 3000, price: 149, popular: false },
] as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: "https://api.miraichat.app",
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
