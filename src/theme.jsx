import { createTheme } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';
import { COLORS } from './styles';

// eslint-disable-next-line react-refresh/only-export-components
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: COLORS.primary,
        },
        secondary: {
            main: COLORS.secondary,
        },
        background: {
            default: COLORS.bgPrimary,
            paper: COLORS.glassBgLight,
        },
        text: {
            primary: COLORS.textPrimary,
            secondary: COLORS.textSecondary,
        },
        // Custom palette entries for easy access via theme.palette.*
        accent: {
            main: COLORS.accent,
        },
        success: {
            main: COLORS.green,
        },
        warning: {
            main: COLORS.orange,
        },
        error: {
            main: COLORS.red,
        },
        info: {
            main: COLORS.blue,
        },
    },
    typography: {
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        h1: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif" },
        h2: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif" },
        h3: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif" },
        h4: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif" },
        h5: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif" },
        h6: { fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif" },
        button: { textTransform: 'none' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: `1px solid ${COLORS.border}`,
                },
            },
        },
    },
});

export const GlobalStyleConfig = (
    <GlobalStyles
        styles={{
            ':root': {
                '--bg-primary': COLORS.bgPrimary,
                '--bg-secondary': COLORS.bgSecondary,
                '--bg-tertiary': COLORS.bgTertiary,
                '--bg-elevated': COLORS.bgElevated,
                '--accent': COLORS.accent,
                '--text-secondary': COLORS.textSecondary,
                '--text-muted': COLORS.textMuted,
                '--glass-bg': COLORS.glassBg,
                '--glass-border': COLORS.borderAccent,
            },
            'html, body': {
                margin: 0,
                padding: 0,
                backgroundColor: COLORS.bgPrimary,
                color: COLORS.textPrimary,
                overflowX: 'hidden',
            },
            '#root': {
                width: '100vw',
                minHeight: '100vh',
            },
            '.no-scrollbar': {
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            },
            '@keyframes shimmer': {
                '100%': { backgroundPosition: '-200% center' },
            },
            '.bg-noise': {
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                pointerEvents: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                opacity: 0.04,
                mixBlendMode: 'overlay',
            },
            '.spotlight-btn': {
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    padding: '2px',
                    background: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glow-color, var(--orb-color-1)), transparent 40%)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                },
                '&:hover::after': {
                    opacity: 1,
                },
            },
        }}
    />
);