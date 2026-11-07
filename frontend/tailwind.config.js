/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0e110f',
          surface: '#141815',
          raised: '#1c221e',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        parchment: {
          DEFAULT: '#f5f2ea',
          dim: '#dfdad0',
          muted: '#a8a497',
        },
        ochre: {
          DEFAULT: '#d49a50',
          light: '#e6b373',
          dark: '#a87532',
        },
        terracotta: {
          DEFAULT: '#d97251',
          light: '#e38b6e',
          dark: '#ab4f32',
        },
        sage: {
          DEFAULT: '#8faf9a',
          light: '#abc7b4',
          dark: '#6a8c76',
        },
        carmine: {
          DEFAULT: '#c24848',
          light: '#d66363',
          dark: '#9c2f2f',
        },
        mist: '#8ea4b0',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-serif)', 'Playfair Display', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight: '-0.02em',
        widest: '0.15em',
        archival: '0.2em',
      },
      lineHeight: {
        editorial: '1.7',
      },
    },
  },
  plugins: [],
}
