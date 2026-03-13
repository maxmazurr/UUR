/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { Box, Stack, Typography, Paper, Button, Chip, IconButton } from '@mui/material';
import { Layers, CheckSquare, Play, FileText } from 'lucide-react';
import { useStudyFlow } from '../StudyFlowContext';
import { COLORS } from '../../styles';

export const TestyView = ({ onOpenTopic, onStartZen }) => {
    const { cards } = useStudyFlow();
    const [selectedTopics, setSelectedTopics] = useState([]); // Array of topicIds
    const today = new Date().toISOString().slice(0, 10);
    const tests = cards.filter(c => c.type === 'test');
    const dueTodayCount = tests.filter(c => c.nextReview <= today).length;
    const avgSuccessOverall = tests.length > 0 ? Math.round(tests.reduce((s, c) => s + (c.successRate || 0), 0) / tests.length) : 0;

    // Group by course → topic
    const grouped = {};
    tests.forEach(t => {
        const key = `${t.courseId}__${t.topicId}`;
        if (!grouped[key]) grouped[key] = { 
            courseId: t.courseId, courseName: t.courseName, courseColor: t.courseColor, 
            topicId: t.topicId, topicName: t.topicName, count: 0, totalSuccess: 0, 
            due: 0, cards: [], lastReviewed: null 
        };
        grouped[key].count++;
        grouped[key].totalSuccess += (t.successRate || 0);
        grouped[key].cards.push(t);
        if (t.nextReview <= today) grouped[key].due++;
        if (t.lastReviewed && (!grouped[key].lastReviewed || t.lastReviewed > grouped[key].lastReviewed)) {
            grouped[key].lastReviewed = t.lastReviewed;
        }
    });
    const rows = Object.values(grouped).map(r => ({ ...r, avgSuccess: Math.round(r.totalSuccess / r.count) }));

    const handleToggleSelect = (topicId) => {
        setSelectedTopics(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
    };

    const startSelected = (shuffle = false) => {
        let combined = rows.filter(r => selectedTopics.includes(r.topicId)).flatMap(r => r.cards);
        if (combined.length === 0) return;
        if (shuffle) combined = [...combined].sort(() => Math.random() - 0.5);
        onStartZen?.(combined);
    };

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Header / Stats */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} gap={2} flexWrap="wrap">
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                        <CheckSquare size={22} color="#c084fc" />
                        <Typography variant="h5" fontWeight={800}>Testy</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {tests.length} testů celkem · Průměrná úspěšnost: <Box component="span" sx={{ color: avgSuccessOverall >= 70 ? COLORS.green : avgSuccessOverall >= 40 ? COLORS.orange : COLORS.red, fontWeight: 600 }}>{avgSuccessOverall}%</Box>
                        {dueTodayCount > 0 && <> · <Box component="span" sx={{ color: COLORS.red, fontWeight: 600 }}>{dueTodayCount} k opakování</Box></>}
                    </Typography>
                </Box>
                {dueTodayCount > 0 && (
                    <Button onClick={() => onStartZen?.(tests.filter(c => c.nextReview <= today))} variant="contained" startIcon={<Play size={15} />}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.primary})`, '&:hover': { filter: 'brightness(0.88)' } }}>
                        Spustit testy na dnes ({dueTodayCount})
                    </Button>
                )}
            </Stack>

            {/* Multi-selection Bar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap"
                sx={{ p: 2, borderRadius: 3, background: COLORS.accent08, border: `1px solid ${COLORS.accent1a}` }}>
                <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: COLORS.purple }}>Hromadné akce</Typography>
                    <Typography variant="caption" color="text.secondary">Vybráno témat: {selectedTopics.length}</Typography>
                </Box>
                <Stack direction="row" gap={1}>
                    <Button 
                        disabled={selectedTopics.length === 0} 
                        onClick={() => startSelected(false)}
                        variant="contained" 
                        size="small"
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontSize: 13, background: COLORS.white05, color: 'white', '&:hover': { background: COLORS.white10 } }}
                    >
                        Spustit vybrané
                    </Button>
                    <Button 
                        disabled={selectedTopics.length === 0} 
                        onClick={() => startSelected(true)}
                        variant="contained" 
                        size="small"
                        startIcon={<Play size={14} />}
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontSize: 13, background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.primary})`, fontWeight: 700 }}
                    >
                        Zamíchat a začít
                    </Button>
                </Stack>
            </Stack>

            {rows.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: `1px dashed ${COLORS.white08}`, textAlign: 'center' }}>
                    <CheckSquare size={40} color={COLORS.white10} style={{ margin: '0 auto 16px' }} />
                    <Typography variant="h6" fontWeight={700} mb={1}>Žádné testy</Typography>
                    <Typography variant="body2" color="text.secondary">Testy vytvoříte přes Moje kurzy — vyberte kurz, téma, a přidejte test.</Typography>
                </Paper>
            ) : (
                <Stack gap={1.5}>
                    {rows.map((r, i) => (
                        <Paper key={i} elevation={0} 
                            onClick={() => handleToggleSelect(r.topicId)}
                            sx={{ 
                                p: 2.5, borderRadius: 2.5, 
                                background: selectedTopics.includes(r.topicId) ? COLORS.primary08 : COLORS.white02, 
                                border: '1px solid',
                                borderColor: selectedTopics.includes(r.topicId) ? `${COLORS.primary}66` : COLORS.white07, 
                                '&:hover': { background: COLORS.white04, transform: 'translateY(-2px)' }, 
                                transition: 'all 0.2s', cursor: 'pointer',
                                position: 'relative', overflow: 'hidden'
                            }}>
                            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
                                <Box sx={{ width: 6, height: 36, borderRadius: 1, background: r.courseColor, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 120 }}>
                                    <Typography fontWeight={700} fontSize={14}>{r.topicName}</Typography>
                                    <Stack direction="row" gap={1} alignItems="center">
                                        <Typography variant="caption" color="text.secondary">{r.courseName}</Typography>
                                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: COLORS.white20 }} />
                                        <Typography variant="caption" color={COLORS.white30}>
                                            Naposledy: {r.lastReviewed ? new Date(r.lastReviewed).toLocaleDateString() : 'Nikdy'}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Stack direction="row" gap={3} alignItems="center">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography fontWeight={800} fontSize={18}>{r.count}</Typography>
                                        <Typography variant="caption" color="text.secondary">testů</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography fontWeight={800} fontSize={18} sx={{ color: r.avgSuccess >= 70 ? COLORS.green : r.avgSuccess >= 40 ? COLORS.orange : COLORS.red }}>{r.avgSuccess}%</Typography>
                                        <Typography variant="caption" color="text.secondary">úspěšnost</Typography>
                                    </Box>
                                    {r.due > 0 && (
                                        <Chip label={`${r.due} k opak.`} size="small" sx={{ borderRadius: 2, height: 24, fontWeight: 700, background: COLORS.red10, color: COLORS.red }} />
                                    )}
                                    <Stack direction="row" gap={0.5}>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); onOpenTopic?.(r.courseId, r.topicId); }}
                                            sx={{ color: COLORS.white30, '&:hover': { color: 'white', background: COLORS.white05 } }}
                                        >
                                            <FileText size={16} />
                                        </IconButton>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); onStartZen?.(r.cards); }}
                                            sx={{ color: COLORS.purple, background: COLORS.purple12, '&:hover': { background: COLORS.purple, color: 'white' } }}
                                        >
                                            <Play size={16} fill="currentColor" />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Stack>
                            {selectedTopics.includes(r.topicId) && (
                                <Box sx={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 30px 30px 0', borderColor: 'transparent #9055FF transparent transparent', opacity: 0.8 }} />
                            )}
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export const KartičkyView = ({ onOpenTopic, onStartZen }) => {
    const { cards, courses } = useStudyFlow();
    const [filterCourse, setFilterCourse] = useState('all');
    const today = new Date().toISOString().slice(0, 10);
    const flashcards = cards.filter(c => c.type === 'flashcard');
    const dueToday = flashcards.filter(c => c.nextReview <= today).length;
    const avgSuccess = flashcards.length > 0 ? Math.round(flashcards.reduce((s, c) => s + (c.successRate || 0), 0) / flashcards.length) : 0;

    // Group by course → topic
    const grouped = {};
    flashcards.forEach(c => {
        if (filterCourse !== 'all' && c.courseId !== filterCourse) return;
        const key = `${c.courseId}__${c.topicId}`;
        if (!grouped[key]) grouped[key] = { courseId: c.courseId, courseName: c.courseName, courseColor: c.courseColor, topicId: c.topicId, topicName: c.topicName, count: 0, totalSuccess: 0, due: 0, cards: [] };
        grouped[key].count++;
        grouped[key].totalSuccess += (c.successRate || 0);
        grouped[key].cards.push(c);
        if (c.nextReview <= today) grouped[key].due++;
    });
    const rows = Object.values(grouped).map(r => ({ ...r, avgSuccess: Math.round(r.totalSuccess / r.count) })).sort((a, b) => b.due - a.due || b.count - a.count);

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1} gap={2} flexWrap="wrap">
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                        <Layers size={22} color="#4ade80" />
                        <Typography variant="h5" fontWeight={800}>Kartičky</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {flashcards.length} kartiček celkem · Průměrná úspěšnost: <Box component="span" sx={{ color: avgSuccess >= 70 ? COLORS.green : avgSuccess >= 40 ? COLORS.orange : COLORS.red, fontWeight: 600 }}>{avgSuccess}%</Box>
                        {dueToday > 0 && <> · <Box component="span" sx={{ color: COLORS.red, fontWeight: 600 }}>{dueToday} k opakování</Box></>}
                    </Typography>
                </Box>
                {dueToday > 0 && (
                    <Button onClick={() => onStartZen?.(flashcards.filter(c => c.nextReview <= today))} variant="contained" startIcon={<Play size={15} />}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, '&:hover': { filter: 'brightness(0.88)' } }}>
                        Začít opakování ({dueToday})
                    </Button>
                )}
            </Stack>

            {/* Summary stats */}
            <Stack direction="row" gap={2} mb={3} mt={2} flexWrap="wrap">
                {[
                    { label: 'Celkem', val: flashcards.length, col: COLORS.blue },
                    { label: 'K opakování', val: dueToday, col: COLORS.red },
                    { label: 'Úspěšnost', val: `${avgSuccess}%`, col: avgSuccess >= 70 ? COLORS.green : COLORS.orange },
                    { label: 'Témat', val: rows.length, col: COLORS.purple },
                ].map((s, i) => (
                    <Paper key={i} elevation={0} sx={{ flex: 1, minWidth: 100, p: 2, borderRadius: 2.5, background: COLORS.white02, border: `1px solid ${COLORS.white07}`, textAlign: 'center' }}>
                        <Typography fontSize={22} fontWeight={800} sx={{ color: s.col }}>{s.val}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    </Paper>
                ))}
            </Stack>

            {/* Course filter */}
            {courses.length > 1 && (
                <Stack direction="row" gap={1} mb={3} flexWrap="wrap">
                    <Chip label="Vše" size="small" onClick={() => setFilterCourse('all')}
                        sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer', background: filterCourse === 'all' ? COLORS.white12 : COLORS.white04, color: filterCourse === 'all' ? 'white' : COLORS.white40 }} />
                    {courses.map(c => (
                        <Chip key={c.id} label={c.name} size="small" onClick={() => setFilterCourse(c.id)}
                            sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer', background: filterCourse === c.id ? `${c.color}25` : COLORS.white04, color: filterCourse === c.id ? c.color : COLORS.white40 }} />
                    ))}
                </Stack>
            )}

            {/* Table by topic */}
            {rows.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: `1px dashed ${COLORS.white08}`, textAlign: 'center' }}>
                    <Layers size={40} color={COLORS.white10} style={{ margin: '0 auto 16px' }} />
                    <Typography variant="h6" fontWeight={700} mb={1}>Žádné kartičky</Typography>
                    <Typography variant="body2" color="text.secondary">Kartičky vytvoříte přes Moje kurzy — vyberte kurz, téma, a přidejte kartičku.</Typography>
                </Paper>
            ) : (
                <Stack gap={1.5}>
                    {rows.map((r, i) => (
                        <Paper key={i} elevation={0} onClick={() => onStartZen?.(r.cards)}
                            sx={{ p: 2.5, borderRadius: 2.5, background: COLORS.white02, border: `1px solid ${COLORS.white07}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { background: COLORS.white04, borderColor: `${COLORS.green}50`, transform: 'translateY(-2px)' } }}>
                            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
                                <Box sx={{ width: 6, height: 36, borderRadius: 1, background: r.courseColor, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 120 }}>
                                    <Typography fontWeight={700} fontSize={14}>{r.topicName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{r.courseName}</Typography>
                                </Box>
                                <Stack direction="row" gap={3} alignItems="center">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography fontWeight={800} fontSize={18}>{r.count}</Typography>
                                        <Typography variant="caption" color="text.secondary">kartiček</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                                        <Typography fontWeight={800} fontSize={18} sx={{ color: r.avgSuccess >= 70 ? COLORS.green : r.avgSuccess >= 40 ? COLORS.orange : COLORS.red }}>{r.avgSuccess}%</Typography>
                                        <Typography variant="caption" color="text.secondary">úspěšnost</Typography>
                                    </Box>
                                    {r.due > 0 && (
                                        <Chip label={`${r.due} k opak.`} size="small" sx={{ borderRadius: 2, height: 24, fontWeight: 700, background: COLORS.red10, color: COLORS.red }} />
                                    )}
                                    <Button 
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); onOpenTopic?.(r.courseId, r.topicId); }}
                                        sx={{ textTransform: 'none', color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'white' } }}
                                    >
                                        Poznámky
                                    </Button>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.green10, color: COLORS.green, border: `1px solid ${COLORS.green}4d` }}>
                                        <Play size={16} fill="currentColor" />
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};
