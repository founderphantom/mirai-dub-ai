/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ===================
      // COLOR SYSTEM
      // ===================
      colors: {
        // Primary - Mirai Blue
        primary: {
          50: "#eff6ff",   // Subtle backgrounds, hover states
          100: "#dbeafe",  // Light backgrounds, badges
          200: "#bfdbfe",  // Borders, dividers
          300: "#93c5fd",  // Disabled states, placeholders
          400: "#60a5fa",  // Hover states
          500: "#3b82f6",  // Primary buttons, links, focus states
          600: "#2563eb",  // Primary button hover, active states
          700: "#1d4ed8",  // Pressed states
          800: "#1e40af",  // Dark text on light backgrounds
          900: "#1e3a8a",  // Headings, emphasis
        },

        // Neutral - Slate
        neutral: {
          50: "#f8fafc",   // Page backgrounds
          100: "#f1f5f9",  // Card backgrounds
          200: "#e2e8f0",  // Borders, dividers
          300: "#cbd5e1",  // Disabled text
          400: "#94a3b8",  // Placeholder text
          500: "#64748b",  // Secondary text
          600: "#475569",  // Body text
          700: "#334155",  // Primary text
          800: "#1e293b",  // Headings
          900: "#0f172a",  // Maximum contrast
        },

        // Semantic - Success (Emerald)
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",  // Light indicators
          500: "#10b981",  // Primary success
          600: "#059669",  // Hover state
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },

        // Semantic - Warning (Amber)
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",  // Light indicators
          500: "#f59e0b",  // Primary warning
          600: "#d97706",  // Hover state
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        // Semantic - Error (Rose)
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",  // Light indicators
          500: "#ef4444",  // Primary error
          600: "#dc2626",  // Hover state
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },

        // Semantic - Info (Sky)
        info: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",  // Light indicators
          500: "#0ea5e9",  // Primary info
          600: "#0284c7",  // Hover state
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },

        // Dark Mode Backgrounds
        dark: {
          50: "#0f1729",   // Deep backgrounds
          100: "#1a2332",  // Card backgrounds
          200: "#2d3748",  // Elevated surfaces
          300: "#4a5568",  // Borders, dividers
        },
      },

      // ===================
      // TYPOGRAPHY
      // ===================
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["SF Mono", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        sm: ["14px", { lineHeight: "20px", letterSpacing: "0" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "0" }],
        lg: ["18px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "3xl": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "5xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.03em" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      // ===================
      // SPACING (8px base)
      // ===================
      spacing: {
        0: "0px",
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",       // Base unit
        3: "12px",
        4: "16px",      // Standard component padding
        5: "20px",
        6: "24px",      // Large component padding
        7: "28px",
        8: "32px",      // Section spacing
        9: "36px",
        10: "40px",
        11: "44px",     // iOS minimum touch target
        12: "48px",     // Android recommended touch target
        14: "56px",     // Large CTAs
        16: "64px",
        20: "80px",
        24: "96px",
      },

      // ===================
      // BORDER RADIUS
      // ===================
      borderRadius: {
        none: "0px",
        sm: "4px",      // Small elements, badges, chips
        DEFAULT: "6px", // Standard radius, buttons, inputs
        md: "8px",      // Cards, containers
        lg: "12px",     // Large cards, modals, sheets
        xl: "16px",     // Hero cards, feature sections
        "2xl": "24px",  // Extra large containers
        "3xl": "32px",  // Maximum radius for large elements
        full: "9999px", // Pills, circular avatars
      },

      // ===================
      // SHADOWS / ELEVATION
      // ===================
      boxShadow: {
        // Light mode shadows
        flat: "none",
        raised: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        floating: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        overlay: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        modal: "0 25px 50px -12px rgb(0 0 0 / 0.25)",

        // Dark mode shadows (more pronounced)
        "dark-raised": "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        "dark-floating": "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
        "dark-overlay": "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
        "dark-modal": "0 25px 50px -12px rgb(0 0 0 / 0.5)",
      },

      // ===================
      // ANIMATION
      // ===================
      animation: {
        // Standard animations
        "fade-in": "fadeIn 200ms ease-out",
        "fade-out": "fadeOut 150ms ease-in",
        "slide-up": "slideUp 300ms ease-out",
        "slide-down": "slideDown 300ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
        "scale-out": "scaleOut 150ms ease-in",
        spin: "spin 1000ms linear infinite",
        pulse: "pulse 2000ms ease-in-out infinite",
        "button-press": "buttonPress 150ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        buttonPress: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      transitionDuration: {
        instant: "0ms",
        fast: "150ms",
        base: "200ms",
        moderate: "300ms",
        slow: "500ms",
        slower: "700ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        linear: "linear",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      // ===================
      // SIZING
      // ===================
      minWidth: {
        touch: "44px",  // iOS minimum
        "touch-lg": "48px", // Android recommended
      },
      minHeight: {
        touch: "44px",  // iOS minimum
        "touch-lg": "48px", // Android recommended
      },
      maxWidth: {
        "content-sm": "640px",
        content: "768px",
        "content-lg": "1024px",
        "content-xl": "1280px",
      },
    },
  },
  plugins: [],
};
