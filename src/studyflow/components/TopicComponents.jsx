import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Typography, Stack,
    Paper,
} from '@mui/material';
import {
    ChevronLeft, Plus, ArrowRight, FileText, Layers, CheckSquare,
    Folder, X,
} from 'lucide-react';
import { COLORS, TOP_STRIPE_SX, CARD_HOVER_GLOW, SOFT_HOVER, modalSlideInAnim } from '../../styles';
import { ColorSwatch, CourseCard, AddCourseModal, EditCourseModal, DeleteConfirmModal } from './CourseComponents';

export const TopicCard = ({ topic, courseColor, stats = {}, onOpen }) => {
    const [hStyle, setHStyle] = useState({});
    const move = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        setHStyle({
            background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.04) 0%, transparent 60%)`,
            transform: `perspective(600px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg) translateY(-3px)`,
        });
    };
    const c = topic.color || courseColor;
    const flashCount = stats.flashcard || 0;
    const testCount = stats.test || 0;
    const statItems = [
        { Icon: FileText, val: topic.notes || 0, label: 'poznámek', col: COLORS.blue },
        { Icon: Layers, val: flashCount, label: 'kartiček', col: COLORS.green },
        { Icon: CheckSquare, val: testCount, label: 'testů', col: COLORS.purple },
    ];
    return (
        <Paper onMouseMove={move} onMouseLeave={() => setHStyle({})} elevation={0}
            sx={{
                position: 'relative', borderRadius: 3, p: 2, cursor: 'pointer', overflow: 'hidden',
                background: COLORS.glassBgLight, border: `1px solid ${COLORS.border}`,
                transition: 'transform 0.25s cubic-bezier(0.23,1,0.32,1), background 0.2s', ...hStyle,
                '&:hover .topic-hover-overlay': { opacity: 1 },
                '&:hover .topic-hover-overlay .topic-open-btn': { transform: 'translateY(0)' },
            }}>
            <Box sx={TOP_STRIPE_SX(c)} />
            <Box sx={{ pt: 0.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'white', mb: 1.25 }}>{topic.name}</Typography>
                <Stack direction="row" gap={1.5} flexWrap="wrap">
                    {statItems.map((item, i) => (
                        <Stack key={i} direction="row" alignItems="center" gap={0.75}>
                            <item.Icon size={12} sx={{ color: item.val > 0 ? item.col : COLORS.textDimmer }} />
                            <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                                <Box component="strong" sx={{ color: item.val > 0 ? 'white' : COLORS.textDim }}>{item.val}</Box> {item.label}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Box>
            <Stack className="topic-hover-overlay" alignItems="center" justifyContent="center"
                sx={{ 
                    position: 'absolute', inset: 0, opacity: 0, borderRadius: 3, zIndex: 10, 
                    background: COLORS.overlayDark, backdropFilter: 'blur(4px)', 
                    transition: 'opacity 0.2s',
                    ...CARD_HOVER_GLOW(c)
                }}>
                <Button className="topic-open-btn" variant="contained" onClick={() => onOpen(topic)} endIcon={<ArrowRight size={14} />}
                    sx={{ borderRadius: 99, px: 2.5, py: 1, fontWeight: 600, fontSize: 13, textTransform: 'none', background: c, color: '#0F1117', transform: 'translateY(8px)', transition: 'all 0.25s', '&:hover': { background: c, filter: 'brightness(1.1)' }, zIndex: 2 }}>
                    Otevřít
                </Button>
            </Stack>
        </Paper>
    );
};

export const AddTopicModal = ({ courseColor, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState(courseColor);
    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ id: `${Date.now()}`, name: name.trim(), color, notes: 0, cards: 0, createdAt: new Date().toISOString().slice(0, 10) });
    };
    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { background: COLORS.bgDialog, border: `1px solid ${COLORS.border}`, borderRadius: 3, animation: `${modalSlideInAnim} 0.22s ease-out both` } } }}>
            <DialogTitle sx={{ pb: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} fontFamily="'Clash Display', sans-serif">Nové téma</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: COLORS.textDim }}><X size={16} /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack gap={2} sx={{ pt: 1 }}>
                    <TextField autoFocus label="Název tématu *" fullWidth size="small" value={name}
                        onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
                        placeholder="např. Lineární rovnice"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'block' }}>Barva</Typography>
                        <ColorSwatch value={color} onChange={setColor} />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', borderColor: COLORS.border, color: COLORS.textSecondary }}>Zrušit</Button>
                <Button onClick={handleSave} disabled={!name.trim()} variant="contained"
                    sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: name.trim() ? color : COLORS.bgTertiary, color: '#0F1117', '&:hover': { filter: 'brightness(0.88)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                    Vytvořit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

import { useStudyFlow } from '../StudyFlowContext';

export const CourseDetailView = ({ course, onBack, onOpenTopic }) => {
    const { courses, setCourses, cards } = useStudyFlow();
    const [showAddTopic, setShowAddTopic] = useState(false);

    const topicStats = useMemo(() => {
        const map = {};
        cards.forEach(c => {
            if (!map[c.topicId]) map[c.topicId] = { flashcard: 0, test: 0 };
            if (c.type === 'flashcard') map[c.topicId].flashcard++;
            else if (c.type === 'test') map[c.topicId].test++;
        });
        return map;
    }, [cards]);
    const topBg = course.useGradient && course.color2
        ? `linear-gradient(135deg, ${course.color}, ${course.color2})`
        : course.color;

    const handleAddTopic = (topic) => {
        const updated = {
            ...course,
            topics: [...(course.topics || []), topic],
            notes: (course.notes || 0) + topic.notes,
        };
        setCourses(courses.map(c => c.id === course.id ? updated : c));
        setShowAddTopic(false);
    };

    // handleUpdateCourse is defined but not used.  Since handleUpdateCourse is used in PoznamkyView, it's possible it was copied here accidentally, or is meant for future use. For now, comment it out.
    // const handleUpdateCourse = (updated) => {
    //     setCourses(courses.map(c => c.id === updated.id ? updated : c));
    // };

    const topics = course.topics || [];

    const tids = (course.topics || []).map(t => t.id);
    const totalNotes = (course.topics || []).reduce((s, t) => s + (t.notes || 0), 0);
    const totalFlash = tids.reduce((s, id) => s + (topicStats[id]?.flashcard || 0), 0);
    const totalTests = tids.reduce((s, id) => s + (topicStats[id]?.test || 0), 0);
    const heroStats = [{ val: totalNotes, label: 'poznámek' }, { val: totalFlash, label: 'kartiček' }, { val: totalTests, label: 'testů' }];

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Breadcrumb */}
            <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
                <Button onClick={onBack} startIcon={<ChevronLeft size={16} />} variant="outlined"
                    sx={{ borderRadius: 3, textTransform: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    Zpět
                </Button>
                <Typography sx={{ color: 'rgba(255,255,255,0.2)' }}>/</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Poznámky</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.2)' }}>/</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{course.name}</Typography>
            </Stack>

            {/* Course hero */}
            <Paper elevation={0} sx={{ position: 'relative', borderRadius: 4, p: 3, mb: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: topBg, borderRadius: '16px 16px 0 0' }} />
                <Box sx={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: course.color, opacity: 0.07, filter: 'blur(60px)', pointerEvents: 'none' }} />
                <Stack direction="row" alignItems="flex-start" gap={2.5} flexWrap="wrap">
                    <Box sx={{ width: 60, height: 60, borderRadius: 4, background: `${course.color}18`, border: `1px solid ${course.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, mt: 0.5 }}>
                        {course.icon || '📚'}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 11, color: course.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>Kurz</Typography>
                        <Typography variant="h4" sx={{ fontSize: 24, fontWeight: 800, color: 'white', mb: course.description ? 0.75 : 0 }}>{course.name}</Typography>
                        {course.description && <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{course.description}</Typography>}
                    </Box>
                    <Stack direction="row" gap={2.5} flexShrink={0}>
                        {heroStats.map(({ val, label }, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{val}</Typography>
                                <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Paper>

            {/* Topics section header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Layers size={16} style={{ color: course.color }} />
                    <Typography sx={{ fontSize: 16, fontFamily: '"Clash Display", sans-serif', fontWeight: 700, color: 'white' }}>Témata</Typography>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 22, px: 1, borderRadius: 99, fontSize: 11, fontFamily: 'monospace', bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{topics.length}</Box>
                </Stack>
                <Button onClick={() => setShowAddTopic(true)} startIcon={<Plus size={15} />}
                    sx={{ borderRadius: 3, textTransform: 'none', fontSize: 13, fontWeight: 600, background: `${course.color}15`, color: course.color, border: `1px solid ${course.color}25`, '&:hover': { background: `${course.color}25`, transform: 'scale(1.02)' } }}>
                    Nové téma
                </Button>
            </Stack>

            {topics.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 10, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, background: `${course.color}10` }}>
                        <Layers size={24} style={{ color: course.color }} />
                    </Box>
                    <Typography sx={{ fontSize: 16, fontFamily: '"Clash Display", sans-serif', fontWeight: 700, color: 'white', mb: 1 }}>Zatím žádná témata</Typography>
                    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', maxWidth: 260, mb: 2.5 }}>Přidejte první téma a začněte organizovat poznámky.</Typography>
                    <Button onClick={() => setShowAddTopic(true)} variant="contained"
                        sx={{ borderRadius: 3, textTransform: 'none', fontSize: 13, fontWeight: 600, background: course.color, color: '#0F1117', px: 2.5, '&:hover': { background: course.color, filter: 'brightness(0.9)' } }}>
                        Přidat téma
                    </Button>
                </Stack>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                    {topics.map(topic => (
                        <TopicCard key={topic.id} topic={topic} courseColor={course.color} stats={topicStats[topic.id]} onOpen={() => onOpenTopic?.(course, topic)} />
                    ))}
                    <Button onClick={() => setShowAddTopic(true)} variant="outlined"
                        sx={{ borderRadius: 3, p: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, minHeight: 80, textTransform: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.25)', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.2)' } }}>
                        <Plus size={16} /> Přidat téma
                    </Button>
                </Box>
            )}

            {showAddTopic && <AddTopicModal courseColor={course.color} onSave={handleAddTopic} onClose={() => setShowAddTopic(false)} />}
        </Box>
    );
};

export const PoznamkyView = ({ onOpenTopic }) => {
    const { courses, setCourses, cards } = useStudyFlow();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [openCourse, setOpenCourse] = useState(null);

    const topicStats = useMemo(() => {
        const map = {};
        cards.forEach(c => {
            if (!map[c.topicId]) map[c.topicId] = { flashcard: 0, test: 0 };
            if (c.type === 'flashcard') map[c.topicId].flashcard++;
            else if (c.type === 'test') map[c.topicId].test++;
        });
        return map;
    }, [cards]);

    const handleAdd = (course) => { setCourses(prev => [...prev, course]); setShowAddModal(false); };
    const handleEdit = (updated) => { setCourses(prev => prev.map(c => c.id === updated.id ? updated : c)); setEditingCourse(null); };
    const handleDelete = () => { setCourses(prev => prev.filter(c => c.id !== deletingId)); setDeletingId(null); };
    const handleUpdateCourse = (updated) => { setCourses(prev => prev.map(c => c.id === updated.id ? updated : c)); setOpenCourse(updated); };

    const totalNotes = courses.reduce((s, c) => s + c.notes, 0);
    const coursesLabel = courses.length === 1 ? 'kurz' : courses.length <= 4 ? 'kurzy' : 'kurzů';

    // Course detail view
    if (openCourse) {
        const liveCourse = courses.find(c => c.id === openCourse.id) || openCourse;
        return <CourseDetailView course={liveCourse} onBack={() => setOpenCourse(null)} onUpdateCourse={handleUpdateCourse} topicStats={topicStats} onOpenTopic={onOpenTopic} />;
    }

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3.5} gap={2}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                        <FileText size={22} style={{ color: '#4F9CF9' }} />
                        <Typography variant="h5" sx={{ fontFamily: '"Clash Display", sans-serif', fontWeight: 700, color: 'white' }}>Poznámky</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                        {courses.length} {coursesLabel} · {totalNotes} poznámek celkem
                    </Typography>
                </Box>
                <Button onClick={() => setShowAddModal(true)} startIcon={<Plus size={16} />}
                    sx={{ borderRadius: 3, textTransform: 'none', fontSize: 13, fontWeight: 600, flexShrink: 0, px: 2, py: 1.25, background: 'rgba(79,156,249,0.12)', color: '#4F9CF9', border: '1px solid rgba(79,156,249,0.22)', '&:hover': { background: 'rgba(79,156,249,0.2)', transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.98)' } }}>
                    Nový kurz
                </Button>
            </Stack>

            {/* Empty state */}
            {courses.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 14, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, background: 'rgba(79,156,249,0.08)' }}>
                        <Folder size={28} style={{ color: '#4F9CF9' }} />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontFamily: '"Clash Display", sans-serif', fontWeight: 700, color: 'white', mb: 1 }}>Zatím žádné kurzy</Typography>
                    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', maxWidth: 280, mb: 3 }}>Vytvořte první kurz a začněte organizovat poznámky a kartičky.</Typography>
                    <Button onClick={() => setShowAddModal(true)} variant="contained"
                        sx={{ borderRadius: 3, textTransform: 'none', fontSize: 13, fontWeight: 600, px: 3, background: '#4F9CF9', color: '#0F1117', '&:hover': { background: '#4F9CF9', filter: 'brightness(0.9)' } }}>
                        Vytvořit první kurz
                    </Button>
                </Stack>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} topicStats={topicStats}
                            onOpen={(c) => setOpenCourse(c)} onEdit={(c) => setEditingCourse(c)} onDelete={(id) => setDeletingId(id)} />
                    ))}
                    <Button onClick={() => setShowAddModal(true)} variant="outlined"
                        sx={{ borderRadius: 4, p: 2.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, minHeight: 220, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.2)' } }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
                            <Plus size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.25)' }}>Přidat kurz</Typography>
                    </Button>
                </Box>
            )}

            {showAddModal && <AddCourseModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
            {editingCourse && <EditCourseModal course={editingCourse} onSave={handleEdit} onClose={() => setEditingCourse(null)} />}
            {deletingId && <DeleteConfirmModal name={courses.find(c => c.id === deletingId)?.name || ''} onConfirm={handleDelete} onClose={() => setDeletingId(null)} />}
        </Box>
    );
};
