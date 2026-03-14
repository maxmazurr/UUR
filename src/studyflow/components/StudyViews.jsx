/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { Box, Stack, Typography, Paper, Button, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Layers, CheckSquare, Play, FileText, MoreVertical, Trash2, Edit2, Plus, ExternalLink } from 'lucide-react';
import { useStudyFlow } from '../StudyFlowContext';
import { COLORS } from '../../styles';
import { today as getToday } from '../utils/date';
import { SectionHeader } from './SharedUI';
import { CardWizard, TestWizard } from './CardComponents';

export const TestyView = ({ onOpenTopic, onStartZen }) => {
    const { cards, setCards, courses } = useStudyFlow();
    const [filterCourse, setFilterCourse] = useState('all');
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    
    // Management state
    const [wizardOpen, setWizardOpen] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [presetTopic, setPresetTopic] = useState(null);
    
    // Menu state
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuTopic, setMenuTopic] = useState(null);
    const today = getToday();
    const tests = cards.filter(c => c.type === 'test');
    const filteredTests = tests.filter(t => filterCourse === 'all' || t.courseId === filterCourse);
    const dueTodayCount = filteredTests.filter(c => c.nextReview <= today).length;
    const avgSuccessOverall = filteredTests.length > 0 ? Math.round(filteredTests.reduce((s, c) => s + (c.successRate || 0), 0) / filteredTests.length) : 0;

    // Group by course → topic
    const grouped = {};
    filteredTests.forEach(t => {
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
    
    const rows = Object.values(grouped)
        .map(r => ({ ...r, avgSuccess: Math.round(r.totalSuccess / r.count) }))
        .sort((a, b) => b.due - a.due || b.count - a.count);

    const handleToggleSelect = (topicId) => {
        setSelectedTopics(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
    };

    const startSelected = (shuffle = false) => {
        let combined = rows.filter(r => selectedTopics.includes(r.topicId)).flatMap(r => r.cards);
        if (combined.length === 0) return;
        if (shuffle) combined = [...combined].sort(() => Math.random() - 0.5);
        onStartZen?.(combined);
    };

    const handleOpenMenu = (e, topic) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
        setMenuTopic(topic);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setMenuTopic(null);
    };

    const handleAddTest = (e, topic = null) => {
        if (e) e.stopPropagation();
        setEditingTest(null);
        setPresetTopic(topic);
        setWizardOpen(true);
        handleCloseMenu();
    };

    const handleEditTest = (e, test) => {
        e.stopPropagation();
        setEditingTest(test);
        setWizardOpen(true);
    };

    const handleDeleteTest = (e, testId) => {
        e.stopPropagation();
        if (window.confirm('Opravdu chcete tento test smazat?')) {
            setCards(prev => prev.filter(c => c.id !== testId));
        }
    };

    const onSaveTest = (newTestOrTests) => {
        const testsToAdd = Array.isArray(newTestOrTests) ? newTestOrTests : [newTestOrTests];
        if (editingTest) {
            setCards(prev => prev.map(c => c.id === editingTest.id ? testsToAdd[0] : c));
        } else {
            setCards(prev => [...prev, ...testsToAdd]);
        }
        setWizardOpen(false);
    };

    const handleClearTopic = () => {
        if (!menuTopic) return;
        if (window.confirm(`Opravdu chcete smazat VŠECHNY testy v tématu "${menuTopic.topicName}"?`)) {
            setCards(prev => prev.filter(c => c.topicId !== menuTopic.topicId || c.type !== 'test'));
        }
        handleCloseMenu();
    };

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            <SectionHeader 
                title="Testy (ABCD)" 
                subtitle={`Prověř své znalosti (${tests.length} testů celkem, průměrná úspěšnost ${avgSuccessOverall}%)`}
                icon={CheckSquare}
                color={COLORS.purple}
                action={
                    <Stack direction="row" gap={1.5}>
                        <Button 
                            onClick={(e) => handleAddTest(e)}
                            variant="outlined" 
                            startIcon={<Plus size={16} />}
                            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: `${COLORS.purple}40`, color: COLORS.purple, '&:hover': { borderColor: COLORS.purple, bgcolor: `${COLORS.purple}08` } }}
                        >
                            Přidat
                        </Button>
                        {dueTodayCount > 0 && (
                            <Button onClick={() => onStartZen(tests.filter(t => t.nextReview <= today))} variant="contained" startIcon={<Play size={16} />}
                                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: COLORS.purple, '&:hover': { bgcolor: '#9B64E6' } }}>
                                Zopakovat dnes ({dueTodayCount})
                            </Button>
                        )}
                    </Stack>
                }
            />

            {/* Summary stats */}
            <Stack direction="row" gap={2} mb={3} mt={2} flexWrap="wrap">
                {[
                    { label: 'Testy k zopakování', val: filteredTests.filter(t => t.nextReview <= today).length, col: COLORS.red },
                    { label: 'Průměrná úspěšnost', val: `${avgSuccessOverall}%`, col: avgSuccessOverall >= 70 ? COLORS.green : COLORS.orange },
                    { label: 'Počet témat v testech', val: rows.length, col: COLORS.purple },
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

            {/* Multi-selection Bar (Optional feature retained) */}
            {selectedTopics.length > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap"
                    sx={{ p: 2, borderRadius: 3, background: COLORS.white02, border: `1px solid ${COLORS.white08}` }}>
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
            )}

            {rows.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: `1px dashed ${COLORS.white08}`, textAlign: 'center' }}>
                    <CheckSquare size={40} color={COLORS.white10} style={{ margin: '0 auto 16px' }} />
                    <Typography variant="h6" fontWeight={700} mb={1}>Žádné testy</Typography>
                    <Typography variant="body2" color="text.secondary">Testy vytvoříte přes Moje kurzy — vyberte kurz, téma, a přidejte test.</Typography>
                </Paper>
            ) : (
                <Stack gap={1.5}>
                    {rows.map((r, i) => {
                        const isExpanded = expandedTopic === r.topicId;
                        const topicTop = [...r.cards].filter(c => c.totalReviews > 0).sort((a, b) => b.successRate - a.successRate).slice(0, 3);
                        const topicWorst = [...r.cards].filter(c => c.totalReviews > 0).sort((a, b) => a.successRate - b.successRate).slice(0, 3);

                        return (
                            <Paper key={i} elevation={0} 
                                onClick={() => setExpandedTopic(isExpanded ? null : r.topicId)}
                                sx={{ 
                                    p: 2.5, borderRadius: 3, 
                                    background: isExpanded ? 'rgba(255,255,255,0.03)' : COLORS.white02, 
                                    border: '1px solid',
                                    borderColor: isExpanded ? COLORS.purple : COLORS.white07, 
                                    '&:hover': { background: isExpanded ? 'rgba(255,255,255,0.04)' : COLORS.white04, transform: 'translateY(-2px)' }, 
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
                                        <Stack direction="row" gap={0.5} alignItems="center">
                                            <IconButton 
                                                size="small"
                                                onClick={(e) => handleOpenMenu(e, r)}
                                                sx={{ color: COLORS.white20, '&:hover': { color: 'white', bgcolor: COLORS.white10 } }}
                                            >
                                                <MoreVertical size={18} />
                                            </IconButton>
                                            <IconButton 
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); onStartZen?.(r.cards); }}
                                                sx={{ width: 40, height: 40, background: `${COLORS.purple}12`, color: COLORS.purple, border: `1px solid ${COLORS.purple}4d`, '&:hover': { background: COLORS.purple, color: 'white' } }}
                                            >
                                                <Play size={16} fill="currentColor" />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </Stack>

                                {isExpanded && (
                                    <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                            <Box>
                                                <Typography fontSize={11} fontWeight={800} color={COLORS.green} sx={{ textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
                                                    Top v tomto balíčku
                                                </Typography>
                                                <Stack gap={1.25}>
                                                    {topicTop.length > 0 ? topicTop.map((c, idx) => (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover .card-mini-actions': { opacity: 1 } }}>
                                                            <Typography fontSize={13} noWrap sx={{ maxWidth: '65%', color: 'rgba(255,255,255,0.8)' }}>{c.question}</Typography>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Typography fontSize={12} fontWeight={700} color={COLORS.green}>{c.successRate}%</Typography>
                                                                <Stack direction="row" className="card-mini-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                                                    <IconButton size="small" onClick={(e) => handleEditTest(e, c)} sx={{ p: 0.5, color: COLORS.white30, '&:hover': { color: 'white' } }}>
                                                                        <Edit2 size={12} />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={(e) => handleDeleteTest(e, c.id)} sx={{ p: 0.5, color: COLORS.red, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                                                        <Trash2 size={12} />
                                                                    </IconButton>
                                                                </Stack>
                                                            </Stack>
                                                        </Box>
                                                    )) : <Typography fontSize={12} color="text.secondary">Zatím neprocvičeno</Typography>}
                                                </Stack>
                                            </Box>
                                            <Box>
                                                <Typography fontSize={11} fontWeight={800} color={COLORS.orange} sx={{ textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
                                                    Potřebují procvičit
                                                </Typography>
                                                <Stack gap={1.25}>
                                                    {topicWorst.length > 0 ? topicWorst.map((c, idx) => (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover .card-mini-actions': { opacity: 1 } }}>
                                                            <Typography fontSize={13} noWrap sx={{ maxWidth: '65%', color: 'rgba(255,255,255,0.8)' }}>{c.question}</Typography>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Typography fontSize={12} fontWeight={700} color={COLORS.orange}>{c.successRate}%</Typography>
                                                                <Stack direction="row" className="card-mini-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                                                    <IconButton size="small" onClick={(e) => handleEditTest(e, c)} sx={{ p: 0.5, color: COLORS.white30, '&:hover': { color: 'white' } }}>
                                                                        <Edit2 size={12} />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={(e) => handleDeleteTest(e, c.id)} sx={{ p: 0.5, color: COLORS.red, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                                                        <Trash2 size={12} />
                                                                    </IconButton>
                                                                </Stack>
                                                            </Stack>
                                                        </Box>
                                                    )) : <Typography fontSize={12} color="text.secondary">Zatím neprocvičeno</Typography>}
                                                </Stack>
                                            </Box>
                                        </Box>
                                        
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={(e) => { e.stopPropagation(); handleToggleSelect(r.topicId); }}
                                                sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11, borderColor: `${COLORS.purple}33`, color: COLORS.white40 }}
                                            >
                                                {selectedTopics.includes(r.topicId) ? 'Zrušit výběr' : 'Vybrat pro hromadnou akci'}
                                            </Button>
                                            <Button 
                                                size="small" 
                                                onClick={(e) => { e.stopPropagation(); onOpenTopic?.(r.courseId, r.topicId); }}
                                                sx={{ textTransform: 'none', color: COLORS.white40, fontSize: 12, '&:hover': { color: 'white' } }}
                                            >
                                                Otevřít poznámky a detaily tématu
                                            </Button>
                                        </Stack>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            {/* Row Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                PaperProps={{ 
                    sx: { 
                        bgcolor: COLORS.bgTertiary, border: `1px solid ${COLORS.white10}`, 
                        borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        mt: 1, minWidth: 200
                    } 
                }}
            >
                <MenuItem onClick={() => handleAddTest(null, menuTopic)} sx={{ py: 1.25 }}>
                    <ListItemIcon><Plus size={18} color={COLORS.purple} /></ListItemIcon>
                    <ListItemText primary="Nový test" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={() => { onOpenTopic?.(menuTopic.courseId, menuTopic.topicId); handleCloseMenu(); }} sx={{ py: 1.25 }}>
                    <ListItemIcon><ExternalLink size={18} color={COLORS.white40} /></ListItemIcon>
                    <ListItemText primary="Otevřít téma" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={handleClearTopic} sx={{ py: 1.25, '&:hover': { bgcolor: `${COLORS.red}10` } }}>
                    <ListItemIcon><Trash2 size={18} color={COLORS.red} /></ListItemIcon>
                    <ListItemText primary="Smazat vše z tématu" primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: COLORS.red }} />
                </MenuItem>
            </Menu>

            <TestWizard 
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onSave={onSaveTest}
                editCard={editingTest}
                courseId={presetTopic?.courseId}
                courseName={presetTopic?.courseName}
                courseColor={presetTopic?.courseColor}
                topicId={presetTopic?.topicId}
                topicName={presetTopic?.topicName}
                courses={courses}
            />
        </Box>
    );
};



export const KartičkyView = ({ onOpenTopic, onStartZen }) => {
    const { cards, setCards, courses } = useStudyFlow();
    const [filterCourse, setFilterCourse] = useState('all');
    const [expandedTopic, setExpandedTopic] = useState(null);
    
    // Management state
    const [wizardOpen, setWizardOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [presetTopic, setPresetTopic] = useState(null);
    
    // Menu state
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuTopic, setMenuTopic] = useState(null);
    const today = getToday();
    const flashcards = cards.filter(c => c.type === 'flashcard');
    const dueToday = flashcards.filter(c => c.nextReview <= today).length;
    const avgSuccess = flashcards.length > 0 ? Math.round(flashcards.reduce((s, c) => s + (c.successRate || 0), 0) / flashcards.length) : 0;

    // Group by course → topic
    const grouped = {};
    flashcards.forEach(c => {
        if (filterCourse !== 'all' && c.courseId !== filterCourse) return;
        const key = `${c.courseId}__${c.topicId}`;
        if (!grouped[key]) grouped[key] = { 
            courseId: c.courseId, courseName: c.courseName, courseColor: c.courseColor, 
            topicId: c.topicId, topicName: c.topicName, count: 0, totalSuccess: 0, 
            due: 0, cards: [] 
        };
        grouped[key].count++;
        grouped[key].totalSuccess += (c.successRate || 0);
        grouped[key].cards.push(c);
        if (c.nextReview <= today) grouped[key].due++;
    });

    const rows = Object.values(grouped)
        .map(r => ({ ...r, avgSuccess: Math.round(r.totalSuccess / r.count) }))
        .sort((a, b) => b.due - a.due || b.count - a.count);

    const handleOpenMenu = (e, topic) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
        setMenuTopic(topic);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setMenuTopic(null);
    };

    const handleAddCard = (e, topic = null) => {
        if (e) e.stopPropagation();
        setEditingCard(null);
        setPresetTopic(topic);
        setWizardOpen(true);
        handleCloseMenu();
    };

    const handleEditCard = (e, card) => {
        e.stopPropagation();
        setEditingCard(card);
        setWizardOpen(true);
    };

    const handleDeleteCard = (e, cardId) => {
        e.stopPropagation();
        if (window.confirm('Opravdu chcete tuto kartičku smazat?')) {
            setCards(prev => prev.filter(c => c.id !== cardId));
        }
    };

    const handleClearTopic = () => {
        if (!menuTopic) return;
        if (window.confirm(`Opravdu chcete smazat VŠECHNY kartičky v tématu "${menuTopic.topicName}"?`)) {
            setCards(prev => prev.filter(c => c.topicId !== menuTopic.topicId));
        }
        handleCloseMenu();
    };

    const onSaveCard = (newCard) => {
        if (editingCard) {
            setCards(prev => prev.map(c => c.id === editingCard.id ? newCard : c));
        } else if (Array.isArray(newCard)) {
            setCards(prev => [...prev, ...newCard]);
        } else {
            setCards(prev => [...prev, newCard]);
        }
        setWizardOpen(false);
    };

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            <SectionHeader 
                title="Kartičky" 
                subtitle={`Zopakuj si to nejdůležitější (${flashcards.length} celkem, průměrná úspěšnost ${avgSuccess}%)`}
                icon={Layers}
                color={COLORS.blue}
                action={
                    <Stack direction="row" gap={1.5}>
                        <Button 
                            onClick={(e) => handleAddCard(e)}
                            variant="outlined" 
                            startIcon={<Plus size={16} />}
                            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: `${COLORS.blue}40`, color: COLORS.blue, '&:hover': { borderColor: COLORS.blue, bgcolor: `${COLORS.blue}08` } }}
                        >
                            Přidat
                        </Button>
                        {dueToday > 0 && (
                            <Button onClick={() => onStartZen(flashcards.filter(c => c.nextReview <= today))} variant="contained" startIcon={<Play size={16} />}
                                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: COLORS.blue, '&:hover': { bgcolor: '#4385D9' } }}>
                                Zopakovat dnes ({dueToday})
                            </Button>
                        )}
                    </Stack>
                }
            />

            {/* Summary stats - Global Overview */}
            <Stack direction="row" gap={2} mb={3} mt={2} flexWrap="wrap">
                {[
                    { label: 'K opakování dnes', val: dueToday, col: COLORS.red },
                    { label: 'Průměrná úspěšnost', val: `${avgSuccess}%`, col: avgSuccess >= 70 ? COLORS.green : COLORS.orange },
                    { label: 'Počet témat', val: rows.length, col: COLORS.purple },
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
                    {rows.map((r, i) => {
                        const isExpanded = expandedTopic === r.topicId;
                        const topicTop = [...r.cards].filter(c => c.totalReviews > 0).sort((a, b) => b.successRate - a.successRate).slice(0, 3);
                        const topicWorst = [...r.cards].filter(c => c.totalReviews > 0).sort((a, b) => a.successRate - b.successRate).slice(0, 3);

                        return (
                            <Paper key={i} elevation={0} 
                                onClick={() => setExpandedTopic(isExpanded ? null : r.topicId)}
                                sx={{ 
                                    p: 2.5, borderRadius: 3, 
                                    background: isExpanded ? 'rgba(255,255,255,0.03)' : COLORS.white02, 
                                    border: '1px solid',
                                    borderColor: isExpanded ? COLORS.primary : COLORS.white07, 
                                    cursor: 'pointer', transition: 'all 0.2s', 
                                    '&:hover': { background: isExpanded ? 'rgba(255,255,255,0.04)' : COLORS.white04, transform: 'translateY(-2px)' } 
                                }}>
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
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => handleOpenMenu(e, r)}
                                            sx={{ color: COLORS.white20, '&:hover': { color: 'white', bgcolor: COLORS.white10 } }}
                                        >
                                            <MoreVertical size={18} />
                                        </IconButton>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); onStartZen?.(r.cards); }}
                                            sx={{ width: 40, height: 40, background: COLORS.green10, color: COLORS.green, border: `1px solid ${COLORS.green}4d`, '&:hover': { background: COLORS.green, color: 'white' } }}
                                        >
                                            <Play size={16} fill="currentColor" />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                {isExpanded && (
                                    <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                            <Box>
                                                <Typography fontSize={11} fontWeight={800} color={COLORS.green} sx={{ textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
                                                    Nejlepší v tomto balíčku
                                                </Typography>
                                                <Stack gap={1.25}>
                                                    {topicTop.length > 0 ? topicTop.map((c, idx) => (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover .card-mini-actions': { opacity: 1 } }}>
                                                            <Typography fontSize={13} noWrap sx={{ maxWidth: '65%', color: 'rgba(255,255,255,0.8)' }}>{c.front}</Typography>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Typography fontSize={12} fontWeight={700} color={COLORS.green}>{c.successRate}%</Typography>
                                                                <Stack direction="row" className="card-mini-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                                                    <IconButton size="small" onClick={(e) => handleEditCard(e, c)} sx={{ p: 0.5, color: COLORS.white30, '&:hover': { color: 'white' } }}>
                                                                        <Edit2 size={12} />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={(e) => handleDeleteCard(e, c.id)} sx={{ p: 0.5, color: COLORS.red, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                                                        <Trash2 size={12} />
                                                                    </IconButton>
                                                                </Stack>
                                                            </Stack>
                                                        </Box>
                                                    )) : <Typography fontSize={12} color="text.secondary">Zatím neprocvičeno</Typography>}
                                                </Stack>
                                            </Box>
                                            <Box>
                                                <Typography fontSize={11} fontWeight={800} color={COLORS.orange} sx={{ textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
                                                    Potřebují procvičit
                                                </Typography>
                                                <Stack gap={1.25}>
                                                    {topicWorst.length > 0 ? topicWorst.map((c, idx) => (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover .card-mini-actions': { opacity: 1 } }}>
                                                            <Typography fontSize={13} noWrap sx={{ maxWidth: '65%', color: 'rgba(255,255,255,0.8)' }}>{c.front}</Typography>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Typography fontSize={12} fontWeight={700} color={COLORS.orange}>{c.successRate}%</Typography>
                                                                <Stack direction="row" className="card-mini-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                                                    <IconButton size="small" onClick={(e) => handleEditCard(e, c)} sx={{ p: 0.5, color: COLORS.white30, '&:hover': { color: 'white' } }}>
                                                                        <Edit2 size={12} />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={(e) => handleDeleteCard(e, c.id)} sx={{ p: 0.5, color: COLORS.red, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                                                        <Trash2 size={12} />
                                                                    </IconButton>
                                                                </Stack>
                                                            </Stack>
                                                        </Box>
                                                    )) : <Typography fontSize={12} color="text.secondary">Zatím neprocvičeno</Typography>}
                                                </Stack>
                                            </Box>
                                        </Box>
                                        
                                        <Stack direction="row" justifyContent="flex-end" mt={2}>
                                            <Button 
                                                size="small" 
                                                onClick={(e) => { e.stopPropagation(); onOpenTopic?.(r.courseId, r.topicId); }}
                                                sx={{ textTransform: 'none', color: COLORS.white40, fontSize: 12, '&:hover': { color: 'white' } }}
                                            >
                                                Otevřít poznámky a detaily tématu
                                            </Button>
                                        </Stack>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            {/* Row Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                PaperProps={{ 
                    sx: { 
                        bgcolor: COLORS.bgTertiary, border: `1px solid ${COLORS.white10}`, 
                        borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        mt: 1, minWidth: 200
                    } 
                }}
            >
                <MenuItem onClick={() => handleAddCard(null, menuTopic)} sx={{ py: 1.25 }}>
                    <ListItemIcon><Plus size={18} color={COLORS.blue} /></ListItemIcon>
                    <ListItemText primary="Nová kartička" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={() => { onOpenTopic?.(menuTopic.courseId, menuTopic.topicId); handleCloseMenu(); }} sx={{ py: 1.25 }}>
                    <ListItemIcon><ExternalLink size={18} color={COLORS.white40} /></ListItemIcon>
                    <ListItemText primary="Otevřít téma" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={handleClearTopic} sx={{ py: 1.25, '&:hover': { bgcolor: `${COLORS.red}10` } }}>
                    <ListItemIcon><Trash2 size={18} color={COLORS.red} /></ListItemIcon>
                    <ListItemText primary="Smazat vše z tématu" primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: COLORS.red }} />
                </MenuItem>
            </Menu>

            {/* Wizard Modal */}
            <CardWizard 
                courses={courses}
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onSave={onSaveCard}
                editCard={editingCard}
                presetCourseId={presetTopic?.courseId}
                presetTopicId={presetTopic?.topicId}
            />
        </Box>
    );
};
