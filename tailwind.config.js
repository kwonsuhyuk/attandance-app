/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#202020",
        "dark-text": "#FFFFFF",
        "dark-border": "#FFFFFF80",
        "dark-border-sub": "#FFFFFF33",
        "dark-nav-text": "#909090",
        "dark-nav-selected": "#FFFFFF",
        "white-bg": "#EEEEEE",
        "white-text": "#000000",
        "white-border": "#00000080",
        "white-border-sub": "#00000033",
        "white-nav-text": "#6F6F6F",
        "white-nav-selected": "#000000",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        baseFont: ["Montserrat", "sans-serif"],
      },
      keyframes: {
        underline: {
          from: {
            width: "0%",
          },
          to: {
            width: "100%",
          },
        },
      },
      animation: {
        underline: "underline 0.5s ease-in-out forwards",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  darkMode: ["class", "class"],
  plugins: [require("tailwindcss-animate")],
  important: true,
  mode: "jit",
};

{
  /* <div class="bg-white-bg dark:bg-black text-black dark:text-white">
   기본 모드에서는 흰색 배경에 검은색 텍스트이고 다크 모드에서는 검은색 배경에 흰색 텍스트
</div> */
}

// sm: 640px 이상 – 일반적으로 작은 모바일 기기를 대상으로 합니다.
// md: 768px 이상 – 보통 태블릿이나 가로 모드의 모바일 기기를 대상으로 합니다.
// lg: 1024px 이상 – 작은 데스크탑이나 대형 태블릿을 대상으로 합니다.
// xl: 1280px 이상 – 대형 데스크탑 화면을 대상으로 합니다.

{
  /* <div class="text-black dark:text-white sm:text-lg md:text-xl">
  이 텍스트는 화면 크기와 다크 모드 설정에 따라 다른 스타일을 가집니다.
</div> */
}
