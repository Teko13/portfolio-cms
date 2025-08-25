/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Thème sombre personnalisé
        dark: {
          50: '#f8fafc',   // Gris très clair (proche du blanc)
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',  // Bleu très foncé (proche du noir)
        },
        // Couleurs d'accent
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Couleurs pour les actions sensibles
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Couleurs de succès
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Couleurs d'avertissement
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Couleurs futuristes
        neon: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
          cyan: '#06b6d4',
          green: '#10b981',
        }
      },
      backgroundColor: {
        'dark-bg': '#0a0f1c',      // Arrière-plan principal (bleu très foncé)
        'dark-card': '#1a1f2e',    // Arrière-plan des cartes
        'dark-sidebar': '#0f1424', // Arrière-plan de la sidebar
        'dark-input': '#1e2332',   // Arrière-plan des inputs (gris foncé)
        'dark-elevated': '#252a3a', // Arrière-plan surélevé
      },
      textColor: {
        'dark-text': '#f8fafc',    // Texte principal (gris très clair)
        'dark-text-secondary': '#cbd5e1', // Texte secondaire
        'dark-text-muted': '#94a3b8',     // Texte atténué
      },
      borderColor: {
        'dark-border': '#2d3748',  // Bordures
        'dark-border-light': '#4a5568', // Bordures plus claires
        'dark-input-border': '#374151', // Bordures des inputs (gris foncé)
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 50px rgba(59, 130, 246, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
} 