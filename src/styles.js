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