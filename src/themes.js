// Theme definitions for Midnight game
export const themes = {
    // FREE THEMES
    midnight: {
        name: 'Midnight',
        primary: '#0f172a',
        elevated: '#1e293b',
        accent: '#6366f1',
        accentLight: '#818cf8',
        accentGlow: 'rgba(99, 102, 241, 0.2)',
        error: '#ef4444',
        success: '#10b981',
        textPrimary: '#ffffff',
        textSecondary: '#e2e8f0',
        textMuted: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.1)',
        price: 0,
        animated: false
    },
    neonCity: {
        name: 'Neon City',
        primary: '#0a0e1a',
        elevated: '#151b2e',
        accent: '#06b6d4',
        accentLight: '#22d3ee',
        accentGlow: 'rgba(6, 182, 212, 0.2)',
        error: '#ec4899',
        success: '#10b981',
        textPrimary: '#ffffff',
        textSecondary: '#e0f2fe',
        textMuted: '#67e8f9',
        border: 'rgba(6, 182, 212, 0.2)',
        price: 0,
        animated: false
    },
    militaryBase: {
        name: 'Military Base',
        primary: '#1a1f1a',
        elevated: '#2d3a2d',
        accent: '#84cc16',
        accentLight: '#a3e635',
        accentGlow: 'rgba(132, 204, 22, 0.2)',
        error: '#dc2626',
        success: '#22c55e',
        textPrimary: '#f0fdf4',
        textSecondary: '#d9f99d',
        textMuted: '#86efac',
        border: 'rgba(132, 204, 22, 0.2)',
        price: 0,
        animated: false
    },
    casinoHeist: {
        name: 'Casino Heist',
        primary: '#18181b',
        elevated: '#27272a',
        accent: '#eab308',
        accentLight: '#fbbf24',
        accentGlow: 'rgba(234, 179, 8, 0.2)',
        error: '#dc2626',
        success: '#10b981',
        textPrimary: '#fef3c7',
        textSecondary: '#fde68a',
        textMuted: '#d4a574',
        border: 'rgba(234, 179, 8, 0.2)',
        price: 0,
        animated: false
    },

    // ANIMATED PREMIUM THEMES
    auroraPulse: {
        name: 'Aurora Pulse',
        primary: '#0c0c1e',
        elevated: '#13132e',
        accent: '#a855f7',
        accentLight: '#c084fc',
        accentGlow: 'rgba(168, 85, 247, 0.3)',
        error: '#f43f5e',
        success: '#34d399',
        textPrimary: '#f3e8ff',
        textSecondary: '#d8b4fe',
        textMuted: '#a78bfa',
        border: 'rgba(168, 85, 247, 0.3)',
        price: 1000,
        animated: true,
        animationType: 'aurora'
    },
    cyberNoir: {
        name: 'Cyber Noir',
        primary: '#050508',
        elevated: '#0d0d12',
        accent: '#f43f5e',
        accentLight: '#fb7185',
        accentGlow: 'rgba(244, 63, 94, 0.25)',
        error: '#ef4444',
        success: '#22c55e',
        textPrimary: '#fecdd3',
        textSecondary: '#fb7185',
        textMuted: '#9f1239',
        border: 'rgba(244, 63, 94, 0.2)',
        price: 1500,
        animated: true,
        animationType: 'pulse'
    },
    volcanic: {
        name: 'Volcanic',
        primary: '#1c0a05',
        elevated: '#2d1810',
        accent: '#f97316',
        accentLight: '#fb923c',
        accentGlow: 'rgba(249, 115, 22, 0.3)',
        error: '#ef4444',
        success: '#84cc16',
        textPrimary: '#fff7ed',
        textSecondary: '#fed7aa',
        textMuted: '#ea580c',
        border: 'rgba(249, 115, 22, 0.25)',
        price: 2000,
        animated: true,
        animationType: 'ember'
    }
};

export function applyTheme(themeName) {
    const theme = themes[themeName] || themes.midnight;

    document.documentElement.style.setProperty('--bg-primary', theme.primary);
    document.documentElement.style.setProperty('--bg-elevated', theme.elevated);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--accent-light', theme.accentLight);
    document.documentElement.style.setProperty('--accent-glow', theme.accentGlow);
    document.documentElement.style.setProperty('--error', theme.error);
    document.documentElement.style.setProperty('--success', theme.success);
    document.documentElement.style.setProperty('--text-primary', theme.textPrimary);
    document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);
    document.documentElement.style.setProperty('--text-muted', theme.textMuted);
    document.documentElement.style.setProperty('--border', theme.border);

    // Save theme preference
    try {
        localStorage.setItem('midnight_theme', themeName);
    } catch (e) {
        console.error('Failed to save theme:', e);
    }
}

export function loadSavedTheme() {
    try {
        const saved = localStorage.getItem('midnight_theme');
        if (saved && themes[saved]) {
            applyTheme(saved);
            return saved;
        }
    } catch (e) {
        console.error('Failed to load theme:', e);
    }
    return 'midnight';
}
