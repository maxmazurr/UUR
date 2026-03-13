import { createTheme } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';

// eslint-disable-next-line react-refresh/only-export-components
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#9055FF', // orb-color-1
        },
        secondary: {
            main: '#13E2DA', // orb-color-2
        },
        background: {
            default: '#0F1117',
            paper: 'rgba(255, 255, 255, 0.03)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#8891AA',
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
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                },
            },
        },
    },
});

export const GlobalStyleConfig = (
    <GlobalStyles
        styles={{
            ':root': {
                '--bg-primary': '#0F1117',
                '--bg-secondary': '#161B27',
                '--bg-tertiary': '#1E2536',
                '--bg-elevated': '#1A2030',
                '--accent': '#7C6FF7',
                '--text-secondary': '#8891AA',
                '--text-muted': '#4A5270',
                '--glass-bg': 'rgba(30, 37, 54, 0.6)',
                '--glass-border': 'rgba(124, 111, 247, 0.12)',
            },
            'html, body': {
                margin: 0,
                padding: 0,
                backgroundColor: '#0F1117',
                color: '#fff',
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
