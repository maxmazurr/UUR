import { useState, useRef, useCallback } from 'react';
import { Box, Stack, Typography, Chip, Paper, Button, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { ChevronRight, FileText, PenTool, Layers, CheckSquare, Plus, Pencil, Trash2, X, GripVertical, FolderPlus } from 'lucide-react';
import { modalSlideInAnim } from '../constants';
import { COLORS, DIALOG_PAPER_SX } from '../../styles';



export const HoloCard = ({ item, onOpenCards, onOpenTests }) => {
    const ref = useRef(null);
    const [hStyle, setHStyle] = useState({});

    const move = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        setHStyle({
            background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
            transform: `perspective(1000px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-8px)`,
        });
    };

    const statItems = [
        { Icon: Layers, val: item.cards, label: 'kartiček', dotColor: COLORS.accent },
        { Icon: PenTool, val: item.tests, label: 'testů', dotColor: COLORS.green },
        { Icon: FileText, val: item.notes, label: 'poznámek', dotColor: COLORS.orange },
    ];

    return (
        <Paper ref={ref} onMouseMove={move} onMouseLeave={() => setHStyle({})} elevation={0}
            sx={{
                width: '100%', height: '100%', flexShrink: 0,
                p: 2.25, borderRadius: 5, cursor: 'pointer',
                background: COLORS.white02, border: `1px solid ${COLORS.border}`,
                backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s',
                boxShadow: hStyle.transform ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column',
                ...hStyle,
                '&:hover .holo-overlay': { opacity: 1 },
                '&:hover .holo-overlay .holo-open-btn': { transform: 'translateY(0)' },
            }}
        >
            <Box sx={{ 
                width: 42, height: 42, borderRadius: 3, 
                background: COLORS.white05, border: `1px solid ${COLORS.white10}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
                fontSize: '22px'
            }}>
                {item.icon}
            </Box>
            <Typography sx={{ fontSize: 11, color: item.clr, fontWeight: 800, mb: 0.5, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kurz</Typography>
            <Typography variant="h6" sx={{ fontSize: 19, fontWeight: 700, mb: 2, fontFamily: 'Cabinet Grotesk, sans-serif', color: 'white', lineHeight: 1.2 }}>{item.title}</Typography>

            <Stack gap={1} mb={2}>
                {statItems.map((
                    { Icon: ItemIcon, val, label, dotColor }, i
                ) => (
                    <Stack key={i} direction="row" alignItems="center" gap={1.25}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.white60, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Box component="span" sx={{ color: 'white' }}>{val}</Box> {label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 'auto', borderTop: `1px solid ${COLORS.white05}`, pt: 2 }}>
                <Typography sx={{ fontSize: 11, color: COLORS.white40, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Naposledy otevřeno</Typography>
                <Typography sx={{ fontSize: 13, color: COLORS.white80, fontWeight: 700 }}>{item.date}</Typography>
            </Stack>

            <Stack className="holo-overlay" alignItems="center" justifyContent="center" gap={1.5}
                sx={{ position: 'absolute', inset: 0, background: COLORS.overlay, backdropFilter: 'blur(8px)', opacity: 0, borderRadius: '24px', zIndex: 10, transition: 'opacity 0.3s', p: 2 }}>
                <Button className="holo-open-btn" variant="contained" endIcon={<Layers size={14} />}
                    onClick={(e) => { e.stopPropagation(); onOpenCards?.(); }}
                    sx={{ borderRadius: 99, width: '90%', py: 1.1, fontWeight: 700, textTransform: 'none', background: 'white', color: 'black', transform: 'translateY(16px)', transition: 'all 0.3s', fontSize: '12px', '&:hover': { background: COLORS.white90 } }}>
                    Kartičky
                </Button>
                <Button className="holo-open-btn" variant="contained" endIcon={<CheckSquare size={14} />}
                    onClick={(e) => { e.stopPropagation(); onOpenTests?.(); }}
                    sx={{ borderRadius: 99, width: '90%', py: 1.1, fontWeight: 700, textTransform: 'none', background: COLORS.white10, color: 'white', border: '1px solid rgba(255,255,255,0.4)', transform: 'translateY(16px)', transition: 'all 0.35s', fontSize: '12px', '&:hover': { background: COLORS.white20 } }}>
                    Testy
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
                <MenuItem onClick={() => { closeTopicMenu(); onTopicClick?.(activeTopicCtx, 'card'); }} sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', gap: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.blue }}><Plus size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Nová kartička</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { closeTopicMenu(); onTopicClick?.(activeTopicCtx, 'test'); }} sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', gap: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 'auto!important', color: COLORS.purple }}><Plus size={14} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Nový test</ListItemText>
                </MenuItem>
                <Box sx={{ my: 0.5, borderTop: `1px solid ${COLORS.white05}` }} />
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



