import { useRef } from 'react';
import { Box, Stack, Typography, Paper, LinearProgress, Chip, IconButton } from '@mui/material';
import { useOnScreen } from '../hooks';
import { COLORS, GLASS_CARD_SX, GHOST_BUTTON_SX } from '../../styles';
import { CheckSquare, Layers, Eye } from 'lucide-react';

/** Fade-in on scroll animation wrapper */
export const FadeUp = ({ children, delay = 0, sx = {} }) => {
    const ref = useRef(null);
    const isVisible = useOnScreen(ref);
    return (
        <Box ref={ref} sx={{
            transition: 'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: `${delay}ms`,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
            ...sx,
        }}>
            {children}
        </Box>
    );
};

/** Standard header for sections with icon and optional actions */
export const SectionHeader = ({ icon: Icon, title, color, subtitle, action, mb = 3 }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={mb}>
        <Box>
            <Stack direction="row" alignItems="center" gap={1.25} mb={0.5}>
                {Icon && (
                    <Box sx={{ 
                        width: 32, height: 32, borderRadius: 2, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${color || COLORS.primary}15`,
                        border: `1px solid ${color || COLORS.primary}25`
                    }}>
                        <Icon size={18} color={color || COLORS.primary} />
                    </Box>
                )}
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>{title}</Typography>
            </Stack>
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {action}
    </Stack>
);

/** Consistent card item for flashcards or tests in lists */
export const CardRow = ({ title, color, delay, completed, onToggle, onDetail, type = 'flashcard' }) => (
    <FadeUp delay={delay}>
        <Paper elevation={0} onClick={() => onDetail?.()}
            sx={{
                ...GLASS_CARD_SX,
                p: 1.75, borderLeft: `3px solid ${completed ? COLORS.green : color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: completed ? COLORS.green03 : COLORS.glassBgLight,
                '&:hover .card-actions': { opacity: 1 },
            }}>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                <Box sx={{ 
                    width: 24, height: 24, borderRadius: 1.5, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: completed ? COLORS.green10 : `${color}15`,
                    color: completed ? COLORS.green : color
                }}>
                    {type === 'test' ? <CheckSquare size={13} /> : <Layers size={13} />}
                </Box>
                <Typography noWrap sx={{ 
                    fontSize: 14, fontWeight: 500,
                    color: completed ? COLORS.textDim : COLORS.textPrimary,
                    textDecoration: completed ? 'line-through' : 'none',
                    transition: 'color 0.2s'
                }}>
                    {title}
                </Typography>
            </Stack>
            
            <Stack direction="row" gap={1} className="card-actions" sx={{ 
                opacity: completed ? 1 : 0, 
                transition: 'opacity 0.2s',
                pointerEvents: 'auto'
            }}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                    sx={{ 
                        bgcolor: completed ? COLORS.green10 : COLORS.white05,
                        color: completed ? COLORS.green : COLORS.textSecondary,
                        '&:hover': { bgcolor: completed ? COLORS.green20 : COLORS.white10 }
                    }}>
                    <CheckSquare size={14} />
                </IconButton>
            </Stack>
        </Paper>
    </FadeUp>
);

/** Generic progress bar with label and value */
export const ProgressItem = ({ label, value, color, icon: Icon, subValue }) => (
    <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Stack direction="row" alignItems="center" gap={1}>
                {Icon && <Icon size={14} color={color} />}
                <Typography variant="body2" fontWeight={600}>{label}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
                {subValue && <Typography variant="caption" color="text.secondary">{subValue}</Typography>}
                <Typography variant="body2" fontWeight={800} color={color}>{value}%</Typography>
            </Stack>
        </Stack>
        <LinearProgress variant="determinate" value={value} sx={{ 
            height: 6, borderRadius: 3, 
            bgcolor: COLORS.white05,
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color }
        }} />
    </Box>
);

export const WeakCard = ({ title, value, course, topic }) => (
    <Stack gap={1} sx={{ 
        p: 1.5, borderRadius: 3, transition: 'all 0.2s', cursor: 'pointer', 
        '&:hover': { bgcolor: COLORS.white02 },
        '&:hover .weak-title': { color: COLORS.textPrimary }
    }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography className="weak-title" noWrap sx={{ fontSize: 13, fontWeight: 500, color: COLORS.white80, flex: 1 }}>{title}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, ml: 1, color: value <= 30 ? COLORS.red : COLORS.orange }}>{value}%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={value} sx={{ 
            height: 4, borderRadius: 2, bgcolor: COLORS.white05,
            '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: value <= 30 ? COLORS.red : COLORS.orange }
        }} />
        {(course || topic) && (
            <Typography variant="caption" color="text.secondary" noWrap>
                {course} {topic && `· ${topic}`}
            </Typography>
        )}
    </Stack>
);

export const FastAction = ({ icon: Icon, text, onClick, color = COLORS.primary }) => (
    <Box component="button" onClick={onClick} sx={{
        border: `1px solid ${COLORS.white05}`, borderRadius: 3, p: 2.5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5,
        cursor: 'pointer', width: '100%', background: COLORS.bgSecondary,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
            transform: 'translateY(-4px)', 
            background: COLORS.bgTertiary,
            borderColor: `${color}40`,
            boxShadow: `0 8px 24px ${color}15`
        },
        '&:hover .icon-box': { transform: 'scale(1.1)', color: color },
        '&:hover .action-text': { color: COLORS.textPrimary },
    }}>
        <Box className="icon-box" sx={{ transition: 'all 0.2s', color: COLORS.white30 }}>
            {Icon && <Icon size={24} />}
        </Box>
        <Typography className="action-text" sx={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {text}
        </Typography>
    </Box>
);

