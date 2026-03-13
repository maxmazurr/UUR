import { Dialog, Stack, Box, Typography, Paper, Button, IconButton, Chip } from '@mui/material';
import { X, Brain, Activity, Target, RotateCcw, Timer, Flame, Calendar, Clock, Play } from 'lucide-react';
import { modalSlideInAnim } from '../constants';

const StatBox = ({ icon, label, value, color }) => (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 1.5, textAlign: 'center', background: 'rgba(15,17,23,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <Stack alignItems="center" mb={0.75} sx={{ color }}>{icon}</Stack>
        <Typography sx={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</Typography>
        <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', mt: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</Typography>
    </Paper>
);

const InfoRow = ({ icon, label, value }) => (
    <Stack direction="row" alignItems="center" gap={1}>
        <Box sx={{ color: 'rgba(255,255,255,0.35)', display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}:</Typography>
        <Typography sx={{ fontSize: 11, color: 'white', fontWeight: 500 }}>{value}</Typography>
    </Stack>
);

export const CardDetailModal = ({ card, onClose }) => {
    const recentHistory = card.history.slice(-12);
    const maxH = recentHistory.length > 0 ? Math.max(...recentHistory, 1) : 1;
    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{
                backdrop: { sx: { backdropFilter: 'blur(8px)' } },
                paper: { sx: { background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, p: 0, maxHeight: '85vh', animation: `${modalSlideInAnim} 0.3s cubic-bezier(0.16,1,0.3,1)` } }
            }}>
            {/* Header gradient strip */}
            <Box sx={{ height: 6, borderRadius: '16px 16px 0 0', background: `linear-gradient(90deg, ${card.color}, ${card.color}60, transparent)` }} />

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, mb: 0.5, color: card.color }}>{card.course} · {card.difficulty}</Typography>
                    <Typography variant="h6" sx={{ fontFamily: '"Clash Display", sans-serif', fontWeight: 600, color: 'white' }}>{card.front}</Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.35)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}><X size={16} /></IconButton>
            </Stack>

            {/* Card preview */}
            <Paper elevation={0} sx={{ mx: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 2.5 }, borderRadius: 3, p: { xs: 1.5, sm: 2 }, background: 'rgba(15,17,23,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Stack direction="row" alignItems="center" gap={0.5} mb={1}>
                    <Brain size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>Odpověď</Typography>
                </Stack>
                <Typography sx={{ fontSize: 13, lineHeight: 1.7, color: '#C8CDD8' }}>{card.back}</Typography>
            </Paper>

            {/* Stats grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 }, mb: 2.5 }}>
                <StatBox icon={<Target size={14} />} label="Úspěšnost" value={`${card.successRate}%`} color={card.successRate > 60 ? '#4ADE80' : card.successRate > 40 ? '#FB923C' : '#F87171'} />
                <StatBox icon={<RotateCcw size={14} />} label="Opakování" value={card.totalReviews} color="#4F9CF9" />
                <StatBox icon={<Timer size={14} />} label="Ø čas" value={card.avgTime} color="#7C6FF7" />
                <StatBox icon={<Flame size={14} />} label="Série" value={card.streak} color="#FB923C" />
            </Box>

            {/* History bar chart */}
            <Box sx={{ px: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" alignItems="center" gap={0.5} mb={1.5}>
                    <Activity size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>Historie odpovědí (posledních {recentHistory.length})</Typography>
                </Stack>
                {recentHistory.length > 0 ? (
                    <Stack direction="row" alignItems="flex-end" gap={0.5} sx={{ height: 48 }}>
                        {recentHistory.map((v, i) => (
                            <Box key={i} title={v === 1 ? 'Správně' : 'Špatně'}
                                sx={{
                                    flex: 1, borderRadius: '2px 2px 0 0',
                                    transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)',
                                    height: `${(v / maxH) * 100}%`, minHeight: 4,
                                    background: v === 1
                                        ? 'linear-gradient(to top, rgba(74,222,128,0.6), rgba(74,222,128,0.9))'
                                        : 'linear-gradient(to top, rgba(248,113,113,0.4), rgba(248,113,113,0.7))',
                                }} />
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>Zatím žádná historie opakování</Typography>
                )}
                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                    <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Starší</Typography>
                    <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Novější</Typography>
                </Stack>
            </Box>

            {/* Info rows */}
            <Box sx={{ px: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 2.5 }, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <InfoRow icon={<Calendar size={12} />} label="Vytvořeno" value={card.created} />
                <InfoRow icon={<Clock size={12} />} label="Poslední" value={card.lastReview} />
                <InfoRow icon={<Timer size={12} />} label="Nejlepší čas" value={card.bestTime} />
                <InfoRow icon={<RotateCcw size={12} />} label="Další opak." value={card.nextReview} />
            </Box>

            {/* Footer actions */}
            <Stack direction="row" gap={1.5} sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
                <Button fullWidth startIcon={<Play size={14} />}
                    sx={{ py: 1.25, borderRadius: 3, fontSize: 13, fontWeight: 500, textTransform: 'none', background: `${card.color}12`, color: card.color, border: `1px solid ${card.color}20`, '&:hover': { background: `${card.color}20` } }}>
                    Zopakovat
                </Button>
                <Button fullWidth onClick={onClose} variant="outlined"
                    sx={{ py: 1.25, borderRadius: 3, fontSize: 13, fontWeight: 500, textTransform: 'none', bgcolor: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', borderColor: 'rgba(255,255,255,0.06)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                    Zavřít
                </Button>
            </Stack>
        </Dialog>
    );
};
