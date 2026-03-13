import { useState, useRef, useCallback } from 'react';
import { Box, Stack, Typography, Chip, Paper, Button, LinearProgress, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { ChevronRight, FileText, ArrowRight, PenTool, Layers, Eye, CheckSquare, Plus, Pencil, Trash2, X, GripVertical, FolderPlus } from 'lucide-react';
import { useOnScreen } from '../hooks';
import { COURSE_COLORS, modalSlideInAnim } from '../constants';
import { COLORS, DIALOG_PAPER_SX } from '../../styles';
import { FadeUp, CardRow, WeakCard, FastAction } from './SharedUI';



export const HoloCard = ({ item }) => {
    const ref = useRef(null);
    const [hStyle, setHStyle] = useState({});

    const move = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        setHStyle({
            background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
            transform: `perspective(800px) rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg) translateY(-6px) scale(1.02)`,
        });
    };

    const statItems = [
        { Icon: FileText, val: item.notes, label: 'poznámek' },
        { Icon: PenTool, val: item.tests, label: 'testů' },
        { Icon: Layers, val: item.cards, label: 'kartiček' },
    ];

    return (
        <Paper ref={ref} onMouseMove={move} onMouseLeave={() => setHStyle({})} elevation={0}
            sx={{
                width: '100%', height: '100%', flexShrink: 0,
                p: 'clamp(14px, 3vw, 24px)', borderRadius: 5, cursor: 'pointer',
                background: COLORS.white02, border: `1px solid ${COLORS.border}`,
                backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s',
                boxShadow: hStyle.transform ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
                ...hStyle,
                '&:hover .holo-overlay': { opacity: 1 },
                '&:hover .holo-overlay .holo-open-btn': { transform: 'translateY(0)' },
            }}
        >
            <Box sx={{ width: 44, height: 44, borderRadius: 3, background: COLORS.white05, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {item.icon}
            </Box>
            <Typography sx={{ fontSize: 13, color: item.clr, fontWeight: 500, mb: 0.5 }}>Složka</Typography>
            <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 600, mb: 2.5, fontFamily: 'Cabinet Grotesk, sans-serif', color: 'white' }}>{item.title}</Typography>

            <Stack gap={1.25} mb={3}>
                {statItems.map((
                    { Icon: ItemIcon, val, label }, i
                ) => (
                    <Stack key={i} direction="row" alignItems="center" gap={1.25}>
                        <ItemIcon size={16} sx={{ color: COLORS.white30 }} />
                        <Typography sx={{ fontSize: 14, color: COLORS.white60 }}>
                            <Box component="strong" sx={{ color: 'white' }}>{val}</Box> {label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto', borderTop: `1px solid ${COLORS.white10}`, pt: 2 }}>
                <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>Naposledy otevřeno</Typography>
                <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>{item.date}</Typography>
            </Stack>

            <Stack className="holo-overlay" alignItems="center" justifyContent="center"
                sx={{ position: 'absolute', inset: 0, background: COLORS.overlay, backdropFilter: 'blur(4px)', opacity: 0, borderRadius: '24px', zIndex: 10, transition: 'opacity 0.3s' }}>
                <Button className="holo-open-btn" variant="contained" endIcon={<ArrowRight size={16} />}
                    sx={{ borderRadius: 99, px: 3, py: 1.25, fontWeight: 500, textTransform: 'none', background: 'white', color: 'black', transform: 'translateY(16px)', transition: 'all 0.3s', '&:hover': { background: 'white' } }}>
                    Otevřít
                </Button>
            </Stack>
        </Paper>
    );
};

export const NavItem = ({ icon, label, badge, active, open, onClick }) => (
    <Box onClick={onClick}
        sx={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.1,
            borderRadius: 2.5, cursor: 'pointer', transition: 'background 0.15s ease',
            background: active ? COLORS.primary12 : 'transparent',
            '&:hover': { background: active ? COLORS.primary12 : COLORS.actionHover },
            '&:hover .nav-icon': active ? {} : { color: COLORS.white80 },
            '&:hover .nav-label': { color: 'white' },
        }}>
        {active && <Box sx={{ position: 'absolute', left: 0, width: '3px', height: '55%', bgcolor: COLORS.primary, borderRadius: '0 3px 3px 0', boxShadow: `0 0 10px ${COLORS.primary}b3` }} />}
        <Box className="nav-icon" sx={{ p: 0.5, borderRadius: 1.5, transition: 'color 0.15s', color: active ? COLORS.primary : COLORS.white30 }}>{icon}</Box>
        {open && (
            <>
                <Typography className="nav-label truncate" sx={{ fontSize: 13, fontWeight: 500, transition: 'color 0.15s', color: active ? 'white' : COLORS.white50, flex: 1 }}>{label}</Typography>
                {badge && <Chip label={badge} size="small" sx={{ height: 17, fontSize: 9, fontWeight: 700, bgcolor: COLORS.red15, color: COLORS.red, border: `1px solid ${COLORS.red}40` }} />}
            </>
        )}
    </Box>
);

export const NotifItem = ({ color, title, sub, isLast }) => (
    <Stack direction="row" gap={1.5} alignItems="flex-start"
        sx={{ px: 2, py: 1.5, cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: COLORS.glassBgLight }, ...(!isLast && { borderBottom: `1px solid ${COLORS.actionHover}` }) }}>
        <Box sx={{ width: 8, height: 8, mt: 0.75, borderRadius: '50%', flexShrink: 0, bgcolor: color }} />
        <Box>
            <Typography sx={{ fontSize: 13, color: '#C8CDD8' }}>{title}</Typography>
            <Typography sx={{ fontSize: 10, color: COLORS.white35, mt: 0.25 }}>{sub}</Typography>
        </Box>
    </Stack>
);

// ─── Inline rename dialog for topics ───
const RenameDialog = ({ open, name, onSave, onClose }) => {
    const [value, setValue] = useState(name);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { ...DIALOG_PAPER_SX, animation: `${modalSlideInAnim} 0.2s ease-out both` } } }}>
            <DialogTitle sx={{ pb: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} fontFamily="'Clash Display', sans-serif">Přejmenovat</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: COLORS.white40 }}><X size={16} /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <TextField autoFocus fullWidth size="small" value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { onSave(value.trim()); } }}
                    sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', borderColor: COLORS.white07, color: COLORS.white45 }}>Zrušit</Button>
                <Button onClick={() => value.trim() && onSave(value.trim())} disabled={!value.trim()} variant="contained"
                    sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: COLORS.accent, color: '#fff', '&:hover': { background: '#6C5CE7' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                    Uložit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Delete confirmation for topics ───
const DeleteTopicDialog = ({ open, name, onConfirm, onClose }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { ...DIALOG_PAPER_SX, border: `1px solid ${COLORS.red}33`, animation: `${modalSlideInAnim} 0.2s ease-out both`, textAlign: 'center', p: 3 } } }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, background: `${COLORS.red}1a` }}>
            <Trash2 size={22} color={COLORS.red} />
        </Box>
        <Typography variant="h6" fontWeight={700} fontFamily="'Clash Display', sans-serif" mb={1}>Smazat téma?</Typography>
        <Typography variant="body2" sx={{ color: COLORS.white40, mb: 3 }}>
            Téma <Box component="strong" sx={{ color: 'white' }}>„{name}"</Box> bude trvale smazáno.
        </Typography>
        <Stack direction="row" gap={1}>
            <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', borderColor: COLORS.white07, color: COLORS.white50 }}>Zrušit</Button>
            <Button onClick={onConfirm} variant="contained" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: COLORS.red, color: '#0F1117', '&:hover': { background: '#ef4444' } }}>Smazat</Button>
        </Stack>
    </Dialog>
);

export const TreeItem = ({
    title, color, courseId, topics = [], topicStats = {},
    onClick, onTopicClick,
    onRenameCourse, onDeleteCourse, onAddTopic,
    onRenameTopic, onDeleteTopic, onMoveTopic,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const totalFlash = Object.values(topicStats).reduce((s, v) => s + (v.flashcard || 0), 0);
    const totalTests = Object.values(topicStats).reduce((s, v) => s + (v.test || 0), 0);
    const totalNotes = topics.reduce((s, t) => s + (t.notes || 0), 0);
    const total = totalFlash + totalTests + totalNotes;

    // Context menu state — course level
    const [courseMenu, setCourseMenu] = useState(null);
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // Context menu state — topic level
    const [topicMenu, setTopicMenu] = useState(null);
    const [activeTopicCtx, setActiveTopicCtx] = useState(null);
    const [topicRenameOpen, setTopicRenameOpen] = useState(false);
    const [topicDeleteOpen, setTopicDeleteOpen] = useState(false);

    // Drag-and-drop state for topics
    const [dragOverIdx, setDragOverIdx] = useState(null);

    // --- Course-level context menu ---
    const handleCourseContext = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setCourseMenu({ mouseX: e.clientX, mouseY: e.clientY });
    }, []);

    const closeCourseMenu = useCallback(() => setCourseMenu(null), []);

    // --- Topic-level context menu ---
    const handleTopicContext = useCallback((e, topic) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveTopicCtx(topic);
        setTopicMenu({ mouseX: e.clientX, mouseY: e.clientY });
    }, []);

    const closeTopicMenu = useCallback(() => {
        setTopicMenu(null);
    }, []);

    // --- DnD handlers for topic reordering / cross-course move ---
    const handleDragStart = useCallback((e, topic) => {
        e.dataTransfer.setData('application/uur-topic', JSON.stringify({ topicId: topic.id, sourceCourseId: courseId }));
        e.dataTransfer.effectAllowed = 'move';
    }, [courseId]);

    const handleDragOver = useCallback((e, idx) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIdx(idx);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverIdx(null);
    }, []);

    const handleDrop = useCallback((e, targetIdx) => {
        e.preventDefault();
        setDragOverIdx(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/uur-topic'));
            if (data.topicId && data.sourceCourseId) {
                onMoveTopic?.(data.sourceCourseId, courseId, data.topicId, targetIdx);
            }
        } catch { /* ignore bad data */ }
    }, [courseId, onMoveTopic]);

    // Allow dropping on the course header (to move into this course)
    const handleCourseHeaderDrop = useCallback((e) => {
        e.preventDefault();
        setDragOverIdx(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/uur-topic'));
            if (data.topicId && data.sourceCourseId && data.sourceCourseId !== courseId) {
                onMoveTopic?.(data.sourceCourseId, courseId, data.topicId, topics.length);
            }
        } catch { /* ignore bad data */ }
    }, [courseId, onMoveTopic, topics.length]);

    const handleCourseHeaderDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <Stack>
            {/* Course header row */}
            <Stack direction="row" alignItems="center" gap={1}
                onContextMenu={handleCourseContext}
                onDrop={handleCourseHeaderDrop}
                onDragOver={handleCourseHeaderDragOver}
                onClick={() => { setIsOpen(o => !o); onClick?.(); }}
                sx={{
                    px: 1, py: 0.75, borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s',
                    '&:hover': { bgcolor: COLORS.actionHover },
                    '&:hover .tree-title': { color: 'white' },
                }}>
                <ChevronRight size={12} sx={{ color: COLORS.white30, flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', flexShrink: 0, bgcolor: color, boxShadow: `0 0 6px ${color}80` }} />
                <Typography className="tree-title truncate" sx={{ fontSize: 13, fontWeight: 500, color: COLORS.white50, transition: 'color 0.15s', flex: 1 }}>{title}</Typography>
                {total > 0 && (
                    <Stack direction="row" gap={0.5} flexShrink={0}>
                        {totalNotes > 0 && <Chip label={totalNotes} size="small" sx={{ height: 16, fontSize: 8, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(79,156,249,0.12)', color: COLORS.blue, '& .MuiChip-label': { px: 0.5 } }} />}
                        {totalFlash > 0 && <Chip label={totalFlash} size="small" sx={{ height: 16, fontSize: 8, fontFamily: 'monospace', fontWeight: 700, bgcolor: `${color}15`, color, '& .MuiChip-label': { px: 0.5 } }} />}
                        {totalTests > 0 && <Chip label={totalTests} size="small" sx={{ height: 16, fontSize: 8, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(192,132,252,0.12)', color: COLORS.purple, '& .MuiChip-label': { px: 0.5 } }} />}
                    </Stack>
                )}
            </Stack>

            {/* Course-level context menu */}
            <Menu
                open={Boolean(courseMenu)}
                onClose={closeCourseMenu}
                anchorReference="anchorPosition"
                anchorPosition={courseMenu ? { top: courseMenu.mouseY, left: courseMenu.mouseX } : undefined}
                slotProps={{ paper: { sx: { ...DIALOG_PAPER_SX, minWidth: 170 } } }}
            >
                <MenuItem onClick={() => { closeCourseMenu(); onAddTopic?.(); }} sx={{ fontSize: 13, color: COLORS.white75 || 'rgba(255,255,255,0.75)', gap: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.green }}><FolderPlus size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Nové téma</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { closeCourseMenu(); setRenameOpen(true); }} sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', gap: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.accent }}><Pencil size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Přejmenovat</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { closeCourseMenu(); setDeleteOpen(true); }} sx={{ fontSize: 13, color: COLORS.red, gap: 1.25, '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.red }}><Trash2 size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Smazat kurz</ListItemText>
                </MenuItem>
            </Menu>

            {/* Topic rows with drag-and-drop */}
            {isOpen && topics.length > 0 && (
                <Stack sx={{ ml: 2.5, pl: 1.5, borderLeft: `2px solid ${color}25`, gap: 0.25, mt: 0.25 }}>
                    {topics.map((t, idx) => {
                        const s = topicStats[t.id] || {};
                        return (
                            <Stack key={t.id} direction="row" alignItems="center" gap={0.5}
                                draggable
                                onDragStart={e => handleDragStart(e, t)}
                                onDragOver={e => handleDragOver(e, idx)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, idx)}
                                onContextMenu={e => handleTopicContext(e, t)}
                                onClick={() => onTopicClick?.(t)}
                                sx={{
                                    px: 0.5, py: 0.6, color: COLORS.white35, cursor: 'grab',
                                    borderRadius: 1.5, transition: 'all 0.15s',
                                    borderTop: dragOverIdx === idx ? `2px solid ${color}` : '2px solid transparent',
                                    '&:hover': { color: COLORS.white80, bgcolor: COLORS.glassBgLight },
                                    '&:hover .drag-handle': { opacity: 1 },
                                    '&:active': { cursor: 'grabbing' },
                                }}>
                                <Box className="drag-handle" sx={{ opacity: 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', flexShrink: 0, color: COLORS.white20 }}>
                                    <GripVertical size={10} />
                                </Box>
                                <FileText size={11} style={{ flexShrink: 0 }} />
                                <Typography className="truncate" sx={{ fontSize: 12, flex: 1, color: 'inherit', ml: 0.5 }}>{t.name}</Typography>
                                <Stack direction="row" gap={0.25} flexShrink={0}>
                                    {(t.notes || 0) > 0 && <Chip label={t.notes} size="small" sx={{ height: 14, fontSize: 8, fontFamily: 'monospace', bgcolor: 'rgba(79,156,249,0.1)', color: COLORS.blue, '& .MuiChip-label': { px: 0.5 } }} />}
                                    {(s.flashcard || 0) > 0 && <Chip label={s.flashcard} size="small" sx={{ height: 14, fontSize: 8, fontFamily: 'monospace', bgcolor: 'rgba(74,222,128,0.1)', color: COLORS.green, '& .MuiChip-label': { px: 0.5 } }} />}
                                    {(s.test || 0) > 0 && <Chip label={s.test} size="small" sx={{ height: 14, fontSize: 8, fontFamily: 'monospace', bgcolor: 'rgba(192,132,252,0.1)', color: COLORS.purple, '& .MuiChip-label': { px: 0.5 } }} />}
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>
            )}

            {/* Topic-level context menu */}
            <Menu
                open={Boolean(topicMenu)}
                onClose={closeTopicMenu}
                anchorReference="anchorPosition"
                anchorPosition={topicMenu ? { top: topicMenu.mouseY, left: topicMenu.mouseX } : undefined}
                slotProps={{ paper: { sx: { ...DIALOG_PAPER_SX, minWidth: 160 } } }}
            >
                <MenuItem onClick={() => { closeTopicMenu(); setTopicRenameOpen(true); }} sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', gap: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.accent }}><Pencil size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Přejmenovat</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { closeTopicMenu(); setTopicDeleteOpen(true); }} sx={{ fontSize: 13, color: COLORS.red, gap: 1.25, '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.red }}><Trash2 size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Smazat téma</ListItemText>
                </MenuItem>
            </Menu>

            {/* Rename dialogs */}
            {renameOpen && (
                <RenameDialog open name={title} onClose={() => setRenameOpen(false)}
                    onSave={(newName) => { onRenameCourse?.(courseId, newName); setRenameOpen(false); }} />
            )}
            {deleteOpen && (
                <DeleteTopicDialog open name={title} onClose={() => setDeleteOpen(false)}
                    onConfirm={() => { onDeleteCourse?.(courseId); setDeleteOpen(false); }} />
            )}
            {topicRenameOpen && activeTopicCtx && (
                <RenameDialog open name={activeTopicCtx.name} onClose={() => { setTopicRenameOpen(false); setActiveTopicCtx(null); }}
                    onSave={(newName) => { onRenameTopic?.(courseId, activeTopicCtx.id, newName); setTopicRenameOpen(false); setActiveTopicCtx(null); }} />
            )}
            {topicDeleteOpen && activeTopicCtx && (
                <DeleteTopicDialog open name={activeTopicCtx.name} onClose={() => { setTopicDeleteOpen(false); setActiveTopicCtx(null); }}
                    onConfirm={() => { onDeleteTopic?.(courseId, activeTopicCtx.id); setTopicDeleteOpen(false); setActiveTopicCtx(null); }} />
            )}
        </Stack>
    );
};

export const ContinueCard = ({ color, course, topic, progress, cards, tests, time }) => (
    <Paper elevation={0}
        sx={{
            minWidth: { xs: 210, sm: 250 }, flexShrink: 0, borderRadius: 4, p: { xs: 2, sm: 2.5 },
            display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative', overflow: 'hidden',
            background: COLORS.bgSecondary, border: `1px solid ${COLORS.borderSubtle}`,
            transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', borderColor: `${color}30` },
            '&:hover .continue-footer': { opacity: 1, bottom: 0 },
        }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, borderRadius: '16px 16px 0 0', background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
        <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 0.25, mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', color }}>{course}</Typography>
        <Typography sx={{ fontSize: 16, fontFamily: '"Clash Display", sans-serif', fontWeight: 600, color: 'white', mb: 1.5 }}>{topic}</Typography>

        <Typography sx={{ fontSize: 11, color: COLORS.white35, mb: 1 }}>{time}</Typography>
        <Stack direction="row" gap={1} mb={2}>
            <Chip label={`${cards} kartiček`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 500, bgcolor: COLORS.white03 || 'rgba(255,255,255,0.03)', color: COLORS.white35 }} />
            {tests > 0 && <Chip label={`${tests} test`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 500, bgcolor: COLORS.white03 || 'rgba(255,255,255,0.03)', color: COLORS.white35 }} />}
        </Stack>

        <Box sx={{ mt: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
                <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Průchod</Typography>
                <Typography sx={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 600, color }}>{progress}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progress}
                sx={{ height: 6, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { borderRadius: 99, background: `linear-gradient(90deg, ${color}90, ${color})`, boxShadow: `0 0 8px ${color}30` } }} />
        </Box>

        <Stack className="continue-footer" alignItems="center" justifyContent="center"
            sx={{ position: 'absolute', bottom: -40, left: 0, width: '100%', p: 1.5, opacity: 0, transition: 'all 0.3s', background: `linear-gradient(to top, ${COLORS.bgSecondary} 40%, transparent)` }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color, display: 'flex', alignItems: 'center', gap: 0.5 }}>Otevřít <ArrowRight size={11} /></Typography>
        </Stack>
    </Paper>
);


