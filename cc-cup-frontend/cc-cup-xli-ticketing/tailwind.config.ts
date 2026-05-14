import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Custom Project Colors */
        "secondary-container": "#fe9400",
        "on-secondary-fixed-variant": "#6a3b00",
        "error-container": "#93000a",
        "error": "#ffb4ab",
        "primary-container": "#558dff",
        "on-surface": "#e5e2e3",
        "on-primary-fixed-variant": "#00429b",
        "on-primary": "#002d6e",
        "on-secondary-container": "#633700",
        "tertiary-fixed": "#62ff96",
        "secondary-fixed-dim": "#ffb874",
        "on-secondary": "#4b2800",
        "on-background": "#e5e2e3",
        "inverse-primary": "#0058ca",
        "on-tertiary-container": "#003114",
        "on-error-container": "#ffdad6",
        "on-tertiary-fixed-variant": "#005226",
        "tertiary-fixed-dim": "#00e475",
        "surface-dim": "#131314",
        "on-primary-fixed": "#001945",
        "on-error": "#690005",
        "surface-tint": "#b0c6ff",
        "surface-container-highest": "#353436",
        "on-tertiary-fixed": "#00210b",
        "primary-fixed": "#d9e2ff",
        "tertiary-container": "#00a754",
        "outline": "#8c90a0",
        "surface-variant": "#353436",
        "primary-fixed-dim": "#b0c6ff",
        "inverse-surface": "#e5e2e3",
        "surface-container-high": "#2a2a2b",
        "tertiary": "hsl(var(--tertiary))",
        "surface-container-low": "#1c1b1c",
        "on-secondary-fixed": "#2d1600",
        "surface-bright": "#3a393a",
        "on-primary-container": "#002661",
        "surface-container": "hsl(var(--surface-container))",
        "secondary-fixed": "#ffdcbf",
        "surface": "#131314",
        "on-surface-variant": "#c2c6d7",
        "surface-container-lowest": "#0e0e0f",
        "outline-variant": "hsl(var(--outline-variant))",
        "on-tertiary": "#003918",
        "inverse-on-surface": "#313031",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        "label-bold": ["JetBrains Mono"],
        "display-xl": ["Space Grotesk"],
        "body-md": ["Hanken Grotesk"],
        "headline-lg": ["Space Grotesk"],
        "status-indicator": ["JetBrains Mono"],
        "data-point": ["JetBrains Mono"],
        "headline-lg-mobile": ["Space Grotesk"]
      },
      fontSize: {
        "label-bold": ["14px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "display-xl": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "status-indicator": ["12px", {"lineHeight": "1.0", "fontWeight": "700"}],
        "data-point": ["16px", {"lineHeight": "1.4", "fontWeight": "500"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "fontWeight": "700"}]
      }
    },
  },
  plugins: [tailwindAnimate],
}

