import { useState, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Stack, Box, Button, Typography, Chip, LinearProgress, Paper, IconButton,
} from '@mui/material';
import { X } from 'lucide-react';
import { useStudyFlow } from '../StudyFlowContext';
import { DIALOG_PAPER_SX, COLORS } from '../../styles';

export const ZenMode = ({ onClose, specificCards = null }) => {
    const { cards, setCards } = useStudyFlow();
    const today = new Date().toISOString().slice(0, 10);
    const dueCards = useMemo(() => {
        if (specificCards) return specificCards;
        return cards.filter(c => c.nextReview <= today);
    }, [cards, today, specificCards]);
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [results, setResults] = useState([]); // { id, correct }
    const [finished, setFinished] = useState(false);

    const current = dueCards[idx];

    const handleAnswer = (correct) => {
        setResults(prev => [...prev, { id: current.id, correct }]);
        // SM-2 simplified: adjust next review
        setCards(prev => prev.map(c => {
            if (c.id !== current.id) return c;
            const newSuccess = Math.min(100, Math.max(0, (c.successRate || 0) + (correct ? 12 : -15)));
            const daysUntilNext = correct ? Math.max(1, Math.round((c.successRate || 50) / 15)) : 1;
            const next = new Date();
            next.setDate(next.getDate() + daysUntilNext);
            return { ...c, successRate: newSuccess, totalReviews: (c.totalReviews || 0) + 1, lastReviewed: today, nextReview: next.toISOString().slice(0, 10) };
        }));
        if (idx + 1 >= dueCards.length) {
            setFinished(true);
        } else {
            setFlipped(false);
            setIdx(prev => prev + 1);
        }
    };

    if (dueCards.length === 0) {
        return (
            <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { ...DIALOG_PAPER_SX, textAlign: 'center', p: 4 } }}>
                <Typography fontSize={48} mb={2}>🎉</Typography>
                <Typography variant="h6" fontWeight={700} mb={1}>Vše hotovo!</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Žádné kartičky k opakování. Vrať se zítra.</Typography>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: '#7C6FF7' }}>Zavřít</Button>
            </Dialog>
        );
    }

    if (finished) {
        const correct = results.filter(r => r.correct).length;
        const total = results.length;
        const pct = Math.round((correct / total) * 100);
        return (
            <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { ...DIALOG_PAPER_SX, textAlign: 'center', p: 4 } }}>
                <Typography fontSize={48} mb={2}>{pct >= 70 ? '🎉' : pct >= 40 ? '💪' : '📚'}</Typography>
                <Typography variant="h5" fontWeight={800} mb={1}>Výsledky</Typography>
                <Stack direction="row" justifyContent="center" gap={4} my={3}>
                    <Box><Typography fontSize={28} fontWeight={800} color="#4ade80">{correct}</Typography><Typography variant="caption" color="text.secondary">správně</Typography></Box>
                    <Box><Typography fontSize={28} fontWeight={800} color="#f87171">{total - correct}</Typography><Typography variant="caption" color="text.secondary">špatně</Typography></Box>
                    <Box><Typography fontSize={28} fontWeight={800} sx={{ color: pct >= 70 ? '#4ade80' : pct >= 40 ? '#fb923c' : '#f87171' }}>{pct}%</Typography><Typography variant="caption" color="text.secondary">úspěšnost</Typography></Box>
                </Stack>
                <Button onClick={onClose} variant="contained" fullWidth sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: '#7C6FF7', mt: 1 }}>Hotovo</Button>
            </Dialog>
        );
    }

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{idx + 1} / {dueCards.length}</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></IconButton>
                </Stack>
                <LinearProgress variant="determinate" value={((idx + 1) / dueCards.length) * 100} sx={{ mt: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { borderRadius: 2, background: 'linear-gradient(90deg, #7C6FF7, #4F9CF9)' } }} />
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {current.type === 'flashcard' ? (
                    <Box sx={{ perspective: '1200px', width: '100%', py: 2 }}>
                        <Box
                            onClick={() => setFlipped(f => !f)}
                            sx={{
                                position: 'relative',
                                width: '100%',
                                minHeight: 200,
                                cursor: 'pointer',
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            }}
                        >
                            {/* Front face */}
                            <Box sx={{
                                position: 'absolute', inset: 0,
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center', p: 3, borderRadius: 3,
                                background: 'rgba(79,156,249,0.04)',
                                border: '1px solid rgba(79,156,249,0.15)',
                            }}>
                                <Chip label="Otázka" size="small" sx={{ mb: 2, borderRadius: 2, background: 'rgba(79,156,249,0.12)', color: '#4F9CF9', fontWeight: 700 }} />
                                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.5 }}>{current.front}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>Klikni pro otočení</Typography>
                            </Box>

                            {/* Back face */}
                            <Box sx={{
                                position: 'absolute', inset: 0,
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center', p: 3, borderRadius: 3,
                                background: 'rgba(74,222,128,0.04)',
                                border: '1px solid rgba(74,222,128,0.15)',
                            }}>
                                <Chip label="Odpověď" size="small" sx={{ mb: 2, borderRadius: 2, background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontWeight: 700 }} />
                                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.5 }}>{current.back}</Typography>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <Typography fontWeight={700} mb={2}>{current.question}</Typography>
                        <Stack gap={1}>
                            {current.options?.map((opt, i) => (
                                <Paper key={i} elevation={0} onClick={() => handleAnswer(opt.correct)}
                                    sx={{ p: 2, borderRadius: 2, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', '&:hover': { borderColor: '#7C6FF7', background: 'rgba(124,111,247,0.08)' } }}>
                                    <Typography fontSize={14}><strong style={{ marginRight: 8, color: 'rgba(255,255,255,0.3)' }}>{String.fromCharCode(65 + i)}</strong> {opt.text}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}
            </DialogContent>
            {current.type === 'flashcard' && flipped && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => handleAnswer(false)} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: 'rgba(248,113,113,0.3)', color: '#f87171', '&:hover': { borderColor: '#f87171', background: 'rgba(248,113,113,0.08)' } }}>
                        Nevěděl/a jsem
                    </Button>
                    <Button onClick={() => handleAnswer(true)} variant="contained" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: '#4ade80', color: '#0F1117', '&:hover': { filter: 'brightness(0.88)' } }}>
                        Věděl/a jsem
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};
