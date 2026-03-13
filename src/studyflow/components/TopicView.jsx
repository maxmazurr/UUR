import { useState, useMemo, useCallback } from 'react';
import { Paper, Box, Stack, Typography, Button, IconButton, Chip, LinearProgress, Tabs, Tab } from '@mui/material';
import { ChevronLeft, FileText, Layers, CheckSquare, Plus, Eye, Pencil, Copy, Trash2, Network } from 'lucide-react';
import { DIFF_COLORS, DIFF_LABELS } from '../constants';
import { CardWizard, TestWizard } from './CardComponents';
import { NoteEditor } from './NoteEditor';
import { CardDetailModal } from './CardDetailModal';
import { useStudyFlow } from '../StudyFlowContext';

const adaptCardForDetail = (card) => ({
    front: card.front || card.question || '',
    back: card.back || (card.options?.find(o => o.correct)?.text) || '',
    course: card.courseName || '',
    difficulty: card.difficulty || 'medium',
    color: card.courseColor || '#7C6FF7',
    successRate: card.successRate || 0,
    totalReviews: card.totalReviews || 0,
    avgTime: '—',
    streak: 0,
    nextReview: card.nextReview || '—',
    created: card.createdAt || '—',
    lastReview: card.lastReviewed || '—',
    bestTime: '—',
    history: [],
});

export const TopicView = ({ course, topic, onBack, onOpenTopic }) => {
    const { courses, cards, setCards, getBacklinks } = useStudyFlow();
    const [tab, setTab] = useState(0); // 0=Poznámky, 1=Kartičky, 2=Testy
    const [showCardWizard, setShowCardWizard] = useState(false);
    const [showTestWizard, setShowTestWizard] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [detailCard, setDetailCard] = useState(null);

    const topicCards = cards.filter(c => c.topicId === topic.id && c.type === 'flashcard');
    const topicTests = cards.filter(c => c.topicId === topic.id && c.type === 'test');
    const today = new Date().toISOString().slice(0, 10);
    const c = topic.color || course.color;

    const backlinks = useMemo(() => getBacklinks(topic.id), [topic.id, getBacklinks]);

    // Build flat list of all topics for cross-linking
    const allTopics = useMemo(() => {
        if (!courses) return [];
        return courses.flatMap(cr =>
            (cr.topics || []).map(t => ({ id: t.id, name: t.name, courseId: cr.id, courseName: cr.name, courseColor: cr.color }))
        );
    }, [courses]);

    const handleNavigateToTopic = useCallback((tid) => {
        if (!onOpenTopic || !courses) return;
        for (const cr of courses) {
            const t = cr.topics?.find(tp => tp.id === tid);
            if (t) { onOpenTopic(cr, t); return; }
        }
    }, [courses, onOpenTopic]);

    const handleSaveCards = (cardOrCards) => {
        const arr = Array.isArray(cardOrCards) ? cardOrCards : [cardOrCards];
        setCards(prev => [...prev, ...arr]);
        setShowCardWizard(false);
    };

    const handleSaveTests = (testOrTests) => {
        const arr = Array.isArray(testOrTests) ? testOrTests : [testOrTests];
        setCards(prev => [...prev, ...arr]);
        setShowTestWizard(false);
    };

    const handleDeleteCard = (id) => {
        setCards(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateCard = (updatedCard) => {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
        setEditingCard(null);
    };

    const handleDuplicateCard = (card) => {
        setCards(prev => {
            const copy = { ...card, id: `${Date.now()}-${prev.length}`, successRate: 0, totalReviews: 0, lastReviewed: null, nextReview: today, createdAt: today };
            return [...prev, copy];
        });
    };

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Breadcrumb */}
            <Stack direction="row" alignItems="center" gap={1} mb={3} flexWrap="wrap">
                <Button onClick={onBack} size="small" startIcon={<ChevronLeft size={16} />}
                    sx={{ borderRadius: 2, textTransform: 'none', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', '&:hover': { background: 'rgba(255,255,255,0.04)' } }}>
                    Zpět
                </Button>
                <Typography color="text.secondary" fontSize={13}>/</Typography>
                <Typography fontSize={13} color="text.secondary">{course.name}</Typography>
                <Typography color="text.secondary" fontSize={13}>/</Typography>
                <Typography fontSize={13} fontWeight={700}>{topic.name}</Typography>
            </Stack>

            {/* Topic header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="caption" sx={{ color: c, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Téma</Typography>
                        <Typography variant="h5" fontWeight={800}>{topic.name}</Typography>
                    </Box>
                    <Stack direction="row" gap={3}>
                        {[
                            { val: topic.notes || 0, label: 'poznámek', col: '#4F9CF9' },
                            { val: topicCards.length, label: 'kartiček', col: '#4ade80' },
                            { val: topicTests.length, label: 'testů', col: '#c084fc' },
                        ].map((s, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Typography fontSize={20} fontWeight={800} sx={{ color: s.val > 0 ? 'white' : 'rgba(255,255,255,0.25)' }}>{s.val}</Typography>
                                <Typography fontSize={11} sx={{ color: s.val > 0 ? s.col : 'rgba(255,255,255,0.2)' }}>{s.label}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Paper>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 14 }, '& .MuiTabs-indicator': { background: c, height: 3, borderRadius: 2 } }}>
                <Tab icon={<FileText size={16} />} iconPosition="start" label="Poznámky" />
                <Tab icon={<Layers size={16} />} iconPosition="start" label={`Kartičky (${topicCards.length})`} />
                <Tab icon={<CheckSquare size={16} />} iconPosition="start" label={`Testy (${topicTests.length})`} />
            </Tabs>

            {/* Tab: Poznámky */}
            {tab === 0 && (
                <NoteEditor key={topic.id} topicId={topic.id} allTopics={allTopics} onNavigateToTopic={handleNavigateToTopic} />
            )}

            {/* Tab: Kartičky */}
            {tab === 1 && (
                <Stack gap={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">{topicCards.length} flashcard kartiček</Typography>
                        <Button onClick={() => setShowCardWizard(true)} variant="outlined" size="small" startIcon={<Plus size={14} />}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(74,222,128,0.3)', color: '#4ade80', '&:hover': { borderColor: '#4ade80', background: 'rgba(74,222,128,0.08)' } }}>
                            Nová kartička
                        </Button>
                    </Stack>
                    {topicCards.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            <Layers size={36} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                            <Typography fontWeight={700} mb={0.5}>Žádné kartičky</Typography>
                            <Typography variant="body2" color="text.secondary">Vytvořte první flashcard kartičku pro toto téma.</Typography>
                        </Paper>
                    ) : (
                        topicCards.map(card => {
                            const isDue = card.nextReview <= today;
                            return (
                                <Paper key={card.id} elevation={0} sx={{ p: 2.5, borderRadius: 2.5, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s', '&:hover': { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' } }}>
                                    <Stack direction="row" alignItems="flex-start" gap={2}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" gap={1} mb={1}>
                                                <Chip label="Flashcard" size="small" sx={{ borderRadius: 1.5, height: 22, fontSize: 11, fontWeight: 700, background: 'rgba(79,156,249,0.15)', color: '#4F9CF9' }} />
                                                <Chip label={DIFF_LABELS[card.difficulty]} size="small" sx={{ borderRadius: 1.5, height: 22, fontSize: 11, fontWeight: 600, background: `${DIFF_COLORS[card.difficulty]}15`, color: DIFF_COLORS[card.difficulty] }} />
                                                {isDue && <Chip label="K opakování" size="small" sx={{ borderRadius: 1.5, height: 22, fontSize: 11, fontWeight: 700, background: 'rgba(248,113,113,0.12)', color: '#f87171' }} />}
                                            </Stack>
                                            <Typography fontWeight={600} mb={0.5}>{card.front}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.back}</Typography>
                                            <Stack direction="row" alignItems="center" gap={1.5} mt={1.5}>
                                                <LinearProgress variant="determinate" value={card.successRate || 0} sx={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { borderRadius: 3, background: (card.successRate || 0) >= 70 ? '#4ade80' : (card.successRate || 0) >= 40 ? '#fb923c' : '#f87171' } }} />
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{card.successRate || 0}%</Typography>
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" gap={0.25}>
                                            <IconButton onClick={() => setDetailCard(card)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#4F9CF9', background: 'rgba(79,156,249,0.08)' } }}>
                                                <Eye size={14} />
                                            </IconButton>
                                            <IconButton onClick={() => setEditingCard(card)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#9055FF', background: 'rgba(144,85,255,0.08)' } }}>
                                                <Pencil size={14} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDuplicateCard(card)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)' } }}>
                                                <Copy size={14} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteCard(card.id)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' } }}>
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })
                    )}
                </Stack>
            )}

            {/* Tab: Testy */}
            {tab === 2 && (
                <Stack gap={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">{topicTests.length} testů ABCD</Typography>
                        <Button onClick={() => setShowTestWizard(true)} variant="outlined" size="small" startIcon={<Plus size={14} />}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(192,132,252,0.3)', color: '#c084fc', '&:hover': { borderColor: '#c084fc', background: 'rgba(192,132,252,0.08)' } }}>
                            Nový test
                        </Button>
                    </Stack>
                    {topicTests.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            <CheckSquare size={36} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                            <Typography fontWeight={700} mb={0.5}>Žádné testy</Typography>
                            <Typography variant="body2" color="text.secondary">Vytvořte první ABCD test pro toto téma.</Typography>
                        </Paper>
                    ) : (
                        topicTests.map(card => {
                            const isDue = card.nextReview <= today;
                            return (
                                <Paper key={card.id} elevation={0} sx={{ p: 2.5, borderRadius: 2.5, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s', '&:hover': { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' } }}>
                                    <Stack direction="row" alignItems="flex-start" gap={2}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" gap={1} mb={1}>
                                                <Chip label="Test ABCD" size="small" sx={{ borderRadius: 1.5, height: 22, fontSize: 11, fontWeight: 700, background: 'rgba(192,132,252,0.15)', color: '#c084fc' }} />
                                                <Chip label={DIFF_LABELS[card.difficulty]} size="small" sx={{ borderRadius: 1.5, height: 22, fontSize: 11, fontWeight: 600, background: `${DIFF_COLORS[card.difficulty]}15`, color: DIFF_COLORS[card.difficulty] }} />
                                                {isDue && <Chip label="K opakování" size="small" sx={{ borderRadius: 1.5, height: 22, fontSize: 11, fontWeight: 700, background: 'rgba(248,113,113,0.12)', color: '#f87171' }} />}
                                            </Stack>
                                            <Typography fontWeight={600} mb={1}>{card.question}</Typography>
                                            <Stack gap={0.5}>
                                                {card.options?.map((opt, i) => (
                                                    <Stack key={i} direction="row" alignItems="center" gap={1}>
                                                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: opt.correct ? '#4ade80' : 'rgba(255,255,255,0.1)', background: opt.correct ? '#4ade8020' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            {opt.correct && <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />}
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: opt.correct ? '#4ade80' : 'rgba(255,255,255,0.5)', fontWeight: opt.correct ? 600 : 400 }}>{opt.text}</Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                            <Stack direction="row" alignItems="center" gap={1.5} mt={1.5}>
                                                <LinearProgress variant="determinate" value={card.successRate || 0} sx={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { borderRadius: 3, background: (card.successRate || 0) >= 70 ? '#4ade80' : (card.successRate || 0) >= 40 ? '#fb923c' : '#f87171' } }} />
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{card.successRate || 0}%</Typography>
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" gap={0.25}>
                                            <IconButton onClick={() => setDetailCard(card)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#4F9CF9', background: 'rgba(79,156,249,0.08)' } }}>
                                                <Eye size={14} />
                                            </IconButton>
                                            <IconButton onClick={() => setEditingCard(card)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#9055FF', background: 'rgba(144,85,255,0.08)' } }}>
                                                <Pencil size={14} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDuplicateCard(card)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)' } }}>
                                                <Copy size={14} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteCard(card.id)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' } }}>
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })
                    )}
                </Stack>
            )}

            {showCardWizard && <CardWizard courses={[{ ...course, topics: [topic] }]} onSave={handleSaveCards} onClose={() => setShowCardWizard(false)} />}
            {showTestWizard && <TestWizard courseId={course.id} courseName={course.name} courseColor={course.color} topicId={topic.id} topicName={topic.name} onSave={handleSaveTests} onClose={() => setShowTestWizard(false)} />}
            {editingCard?.type === 'flashcard' && <CardWizard courses={[{ ...course, topics: [topic] }]} onSave={handleUpdateCard} onClose={() => setEditingCard(null)} editCard={editingCard} />}
            {editingCard?.type === 'test' && <TestWizard courseId={course.id} courseName={course.name} courseColor={course.color} topicId={topic.id} topicName={topic.name} onSave={handleUpdateCard} onClose={() => setEditingCard(null)} editCard={editingCard} />}
            {detailCard && <CardDetailModal card={adaptCardForDetail(detailCard)} onClose={() => setDetailCard(null)} />}

            {/* Backlinks section */}
            {backlinks.length > 0 && (
                <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={2.5}>
                        <Box sx={{ width: 28, height: 28, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(144,85,255,0.1)' }}>
                            <Network size={14} style={{ color: '#9055FF' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Odkazy sem ({backlinks.length})</Typography>
                    </Stack>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                        {backlinks.map(({ topic: bt, snippet }, i) => (
                            <Paper key={i} onClick={() => handleNavigateToTopic(bt.id)} elevation={0} 
                                sx={{ 
                                    p: 1.5, borderRadius: 2, cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                    transition: 'all 0.2s', '&:hover': { background: 'rgba(144,85,255,0.04)', borderColor: 'rgba(144,85,255,0.2)' }
                                }}>
                                <Typography fontSize={13} fontWeight={700} noWrap sx={{ mb: 0.5 }}>{bt.name}</Typography>
                                <Typography fontSize={10} color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, opacity: 0.6, fontStyle: 'italic' }}>
                                    "{snippet}"
                                </Typography>
                                <Typography fontSize={10} color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', background: bt.courseColor }} />
                                    {bt.courseName}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};