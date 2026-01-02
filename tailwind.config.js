/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      /* ================================
       * Border Radius
       * ================================ */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* ================================
       * Colors
       * ================================ */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
      },

      /* ================================
       * Animations
       * ================================ */
      animation: {
        "meteor-effect": "meteor 5s linear infinite",

        // 🔥 BARU — FRAGILE rusak
        "fragile-broken": "fragileBroken 6s infinite",
      },

      keyframes: {
        meteor: {
          "0%": {
            transform: "rotate(215deg) translateX(0)",
            opacity: "1",
          },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },

        // 🔥 BARU — FRAGILE rusak
        fragileBroken: {
          "0%": { opacity: "1" },
          "6%": { opacity: "0.85" },
          "9%": { opacity: "0.35" }, // mati sebentar
          "12%": { opacity: "1" },
          "26%": { opacity: "0.9" },
          "29%": { opacity: "0.2" }, // blink rusak
          "32%": { opacity: "1" },
          "54%": { opacity: "0.95" },
          "57%": { opacity: "0.55" },
          "60%": { opacity: "1" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
