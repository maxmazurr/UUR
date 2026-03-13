import { keyframes } from '@emotion/react';

// ─── COLORS ──────────────────────────────────────────────────────────────────
// Single source of truth for all colors used across the app.
// Use these constants instead of hardcoding hex values.
export const COLORS = {
    // Brand
    primary: '#9055FF',
    accent: '#7C6FF7',
    secondary: '#13E2DA',

    // Semantic
    blue: '#4F9CF9',
    purple: '#c084fc',
    green: '#4ade80',
    red: '#f87171',
    orange: '#fb923c',
    yellow: '#facc15',

    // Backgrounds
    bgPrimary: '#0F1117',
    bgSecondary: '#161B27',
    bgTertiary: '#1E2536',
    bgElevated: '#1A2030',
    bgDialog: 'rgba(15, 18, 30, 0.98)',

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#8891AA',
    textMuted: '#4A5270',
    textDim: 'rgba(255, 255, 255, 0.3)',
    textDimmer: 'rgba(255, 255, 255, 0.15)',

    // Borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderAccent: 'rgba(124, 111, 247, 0.12)',

    // Glass backgrounds
    glassBg: 'rgba(30, 37, 54, 0.6)',
    glassBgLight: 'rgba(255, 255, 255, 0.03)',

    // Overlay
    overlay: 'rgba(15, 17, 23, 0.8)',
    overlayDark: 'rgba(10, 12, 20, 0.85)',
    overlayLight: 'rgba(15, 17, 23, 0.6)',

    // Actions
    actionHover: 'rgba(255, 255, 255, 0.04)',
    actionSelected: 'rgba(255, 255, 255, 0.08)',

    // Alpha shades
    white10: 'rgba(255, 255, 255, 0.1)',
    white12: 'rgba(255, 255, 255, 0.12)',
    white15: 'rgba(255, 255, 255, 0.15)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white25: 'rgba(255, 255, 255, 0.25)',
    white28: 'rgba(255, 255, 255, 0.28)',
    white30: 'rgba(255, 255, 255, 0.3)',
    white35: 'rgba(255, 255, 255, 0.35)',
    white40: 'rgba(255, 255, 255, 0.4)',
    white45: 'rgba(255, 255, 255, 0.45)',
    white50: 'rgba(255, 255, 255, 0.5)',
    white55: 'rgba(255, 255, 255, 0.55)',
    white60: 'rgba(255, 255, 255, 0.6)',
    white70: 'rgba(255, 255, 255, 0.7)',
    white75: 'rgba(255, 255, 255, 0.75)',
    white80: 'rgba(255, 255, 255, 0.8)',
    white08: 'rgba(255, 255, 255, 0.08)',
    white09: 'rgba(255, 255, 255, 0.09)',
    white07: 'rgba(255, 255, 255, 0.07)',
    white06: 'rgba(255, 255, 255, 0.06)',
    white05: 'rgba(255, 255, 255, 0.05)',
    white04: 'rgba(255, 255, 255, 0.04)',
    white03: 'rgba(255, 255, 255, 0.03)',
    white02: 'rgba(255, 255, 255, 0.02)',

    // Brand Alphas
    primary12: 'rgba(144, 85, 255, 0.12)',
    primary08: 'rgba(144, 85, 255, 0.08)',
    primary05: 'rgba(144, 85, 255, 0.05)',
    accent1a: 'rgba(124, 111, 247, 0.1)',
    accent08: 'rgba(124, 111, 247, 0.08)',
    accent15: 'rgba(124, 111, 247, 0.15)',
    blue08: 'rgba(79, 156, 249, 0.08)',
    blue12: 'rgba(79, 156, 249, 0.12)',
    blue1a: 'rgba(79, 156, 249, 0.1)',
    blue20: 'rgba(79, 156, 249, 0.2)',
    blue22: 'rgba(79, 156, 249, 0.22)',
    green12: 'rgba(74, 222, 128, 0.12)',
    green10: 'rgba(74, 222, 128, 0.1)',
    green08: 'rgba(74, 222, 128, 0.08)',
    green05: 'rgba(74, 222, 128, 0.05)',
    green03: 'rgba(74, 222, 128, 0.03)',
    red10: 'rgba(248, 113, 113, 0.1)',
    red08: 'rgba(248, 113, 113, 0.08)',
    red15: 'rgba(248, 113, 113, 0.15)',
    red20: 'rgba(248, 113, 113, 0.2)',
    purple12: 'rgba(192, 132, 252, 0.12)',
};

// ─── GLASS STYLES ────────────────────────────────────────────────────────────
// Light glassmorphism — for cards, buttons, subtle containers
export const GLASS = {
    background: COLORS.glassBgLight,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
};

// Panel glassmorphism — for sidebars, panels, heavier containers
export const GLASS_PANEL = {
    background: COLORS.glassBg,
    border: `1px solid ${COLORS.borderAccent}`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
};

// Dialog paper — for all MUI Dialog PaperProps
export const DIALOG_PAPER_SX = {
    background: COLORS.bgDialog,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: 3,
    backdropFilter: 'blur(24px)',
};

// ─── COMMON SX MIXINS ───────────────────────────────────────────────────────
export const HIDE_SCROLLBAR = {
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
};

export const SOFT_HOVER = {
    transition: 'all 0.2s',
    '&:hover': { background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.12)' },
};

export const TOP_STRIPE_SX = (color) => ({
    position: 'absolute', top: 0, left: 0, right: 0, height: 4, 
    background: color, 
    zIndex: 15,
    boxShadow: `0 2px 12px ${color}60` 
});

export const GLASS_CARD_SX = {
    ...GLASS,
    borderRadius: 3,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        borderColor: COLORS.borderLight,
        background: 'rgba(255, 255, 255, 0.05)',
        transform: 'translateY(-2px)'
    }
};

export const GHOST_BUTTON_SX = {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 700,
    color: COLORS.textSecondary,
    '&:hover': {
        background: COLORS.white04,
        color: COLORS.textPrimary
    }
};

export const CARD_HOVER_GLOW = (color) => ({
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '60%',
        background: `radial-gradient(circle at 50% 0%, ${color}35, transparent 70%)`,
        opacity: 0.8,
        pointerEvents: 'none',
    }
});

export const GRADIENT_TEXT = (color1, color2) => ({
    background: `linear-gradient(to right, ${color1}, ${color2})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
});

export const FLEX_CENTER = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

// ─── SHARED KEYFRAMES ────────────────────────────────────────────────────────
export const fadeInUpAnim = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const modalSlideInAnim = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const deadlineShimmerAnim = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
`;

export const bounceAnim = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;