/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'Noto Sans KR', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              lineHeight: '1.2',
              color: '#111827',
            },
            h2: {
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              color: '#1F2937',
            },
            h3: {
              fontSize: '1.125rem',
              fontWeight: '600',
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
              lineHeight: '1.4',
              color: '#374151',
            },
            h4: {
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              lineHeight: '1.4',
              color: '#4B5563',
            },
            p: {
              fontSize: '1rem',
              lineHeight: '1.75',
              marginBottom: '1rem',
              color: '#374151',
            },
            'ul, ol': {
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              paddingLeft: '1.25rem',
            },
            li: {
              marginTop: '0.375rem',
              marginBottom: '0.375rem',
              fontSize: '1rem',
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeftWidth: '4px',
              borderLeftColor: '#3B82F6',
              backgroundColor: '#F3F4F6',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              marginTop: '1rem',
              marginBottom: '1rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            },
            code: {
              color: '#1F2937',
              backgroundColor: '#F3F4F6',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontFamily: 'ui-monospace, monospace',
            },
            pre: {
              backgroundColor: '#1F2937',
              color: '#F9FAFB',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              marginBottom: '1rem',
              overflow: 'auto',
              code: {
                backgroundColor: 'transparent',
                padding: '0',
                color: 'inherit',
                fontSize: '0.875em',
                fontFamily: 'ui-monospace, monospace',
              },
            },
            a: {
              color: '#2563EB',
              textDecoration: 'underline',
              textDecorationColor: '#93C5FD',
              textUnderlineOffset: '2px',
              '&:hover': {
                color: '#1D4ED8',
                textDecorationColor: '#2563EB',
              },
            },
            img: {
              borderRadius: '0.5rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            hr: {
              borderColor: '#E5E7EB',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} 