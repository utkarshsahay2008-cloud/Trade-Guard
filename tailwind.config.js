/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFBF9",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F7F4",
          muted: "#F0F0EC",
          hover: "#FAFAF7"
        },
        border: {
          subtle: "#EAEAE4",
          DEFAULT: "#E2E2DA",
          strong: "#CBD5E1",
        },
        fin: {
          charcoal: "#0F172A",
          body: "#334155",
          muted: "#64748B",
          light: "#94A3B8",
        },
        status: {
          healthy: {
            text: "#047857",
            bg: "#ECFDF5",
            border: "#A7F3D0",
            dot: "#10B981",
          },
          warning: {
            text: "#B45309",
            bg: "#FFFBEB",
            border: "#FDE68A",
            dot: "#F59E0B",
          },
          danger: {
            text: "#B91C1C",
            bg: "#FEF2F2",
            border: "#FCA5A5",
            dot: "#EF4444",
          },
          info: {
            text: "#1D4ED8",
            bg: "#EFF6FF",
            border: "#BFDBFE",
            dot: "#3B82F6",
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'fin-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'fin-card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'fin-md': '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        'fin-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
};
