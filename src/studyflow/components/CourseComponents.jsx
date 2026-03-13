import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Typography, Stack,
    Chip, Paper, LinearProgress, Menu, MenuItem,
} from '@mui/material';
import {
    MoreHorizontal, Trash2, Pencil, ArrowRight, FileText, Layers, CheckSquare,
    Folder, Plus, X,
} from 'lucide-react';
import { COLORS, TOP_STRIPE_SX, CARD_HOVER_GLOW, SOFT_HOVER, DIALOG_PAPER_SX, modalSlideInAnim } from '../../styles';
import { COURSE_COLORS, COURSE_ICONS } from '../constants';

function formatRelative(isoString) {
    const d = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Dnes';
    if (diff === 1) return 'Včera';
    if (diff < 7) return `Před ${diff} dny`;
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

export const ColorSwatch = ({ value, onChange }) => (
    <Stack direction="row" gap={0.75} flexWrap="wrap">
        {COURSE_COLORS.map(c => (
            <Box key={c} component="button" onClick={() => onChange(c)}
                sx={{ width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: value === c ? '2px solid white' : '2px solid transparent', outlineOffset: 2, transition: 'all 0.15s', flexShrink: 0, '&:hover': { transform: 'scale(1.1)' } }} />
        ))}
        <Box component="label" sx={{ width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: COLORS.glassBgLight, border: `1.5px dashed ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', '&:hover': { transform: 'scale(1.1)' } }} title="Vlastní barva">
            <Typography sx={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1 }}>+</Typography>
            <Box component="input" type="color" value={value} onChange={e => onChange(e.target.value)}
                sx={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </Box>
    </Stack>
);

export const CourseModalPreview = ({ topBg, color, icon, name, desc }) => (
    <Box sx={{ position: 'relative', borderRadius: 3, p: 2, overflow: 'hidden', background: COLORS.glassBgLight, border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: topBg, borderRadius: '14px 14px 0 0' }} />
        <Box sx={{ position: 'absolute', top: -30, left: -10, width: 100, height: 100, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(25px)', pointerEvents: 'none' }} />
        <Stack direction="row" alignItems="center" gap={1.5} mt={0.5}>
            <Box sx={{ width: 42, height: 42, borderRadius: '11px', background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 11, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.25 }}>Kurz</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: name ? 'white' : COLORS.textDim }}>{name || 'Název kurzu'}</Typography>
            </Box>
        </Stack>
        {desc && <Typography sx={{ fontSize: 12, color: COLORS.textDim, mt: 1, lineHeight: 1.5 }}>{desc}</Typography>}
    </Box>
);

export const IconGrid = ({ icons, selectedIcon, color, onSelect }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.75 }}>
        {icons.map(ic => (
            <Box key={ic} component="button" onClick={() => onSelect(ic)}
                sx={{ aspectRatio: '1', borderRadius: 2, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: selectedIcon === ic ? `${color}22` : COLORS.glassBgLight, outline: selectedIcon === ic ? `1.5px solid ${color}50` : '1.5px solid transparent', '&:hover': { transform: 'scale(1.1)' } }}>
                {ic}
            </Box>
        ))}
    </Box>
);

export const GradientToggle = ({ useGradient, setUseGradient, color }) => (
    <Stack direction="row" gap={0.5} sx={{ p: 0.25, borderRadius: 2, background: COLORS.glassBgLight }}>
        {[{ val: false, label: 'Jednobarevná' }, { val: true, label: 'Gradient' }].map(opt => (
            <Button key={String(opt.val)} size="small" onClick={() => setUseGradient(opt.val)}
                sx={{ px: 1.5, py: 0.25, borderRadius: 1.5, fontSize: 11, fontWeight: 600, textTransform: 'none', minWidth: 'auto', background: useGradient === opt.val ? `${color}25` : 'transparent', color: useGradient === opt.val ? color : COLORS.textDim, '&:hover': { background: `${color}15` } }}>
                {opt.label}
            </Button>
        ))}
    </Stack>
);

export const CourseCard = ({ course, onOpen, onEdit, onDelete, topicStats = {} }) => {
    const ref = useRef(null);
    const [hStyle, setHStyle] = useState({});
    const [menuAnchor, setMenuAnchor] = useState(null);
    const topBg = course.useGradient && course.color2
        ? `linear-gradient(90deg, ${course.color}, ${course.color2})`
        : course.color;
    const move = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        setHStyle({
            background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.05) 0%, transparent 60%)`,
            transform: `perspective(800px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-4px) scale(1.015)`,
        });
    };

    const tids = (course.topics || []).map(t => t.id);
    const totalNotes = (course.topics || []).reduce((s, t) => s + (t.notes || 0), 0);
    const totalFlash = tids.reduce((s, id) => s + (topicStats[id]?.flashcard || 0), 0);
    const totalTests = tids.reduce((s, id) => s + (topicStats[id]?.test || 0), 0);
    const stats = [
        { Icon: FileText, val: totalNotes, label: 'poznámek', col: COLORS.blue },
        { Icon: Layers, val: totalFlash, label: 'kartiček', col: COLORS.green },
        { Icon: CheckSquare, val: totalTests, label: 'testů', col: COLORS.purple },
    ];

    return (
        <Paper
            ref={ref}
            onMouseMove={move}
            onMouseLeave={() => setHStyle({})}
            elevation={0}
            sx={{
                position: 'relative', borderRadius: 4, p: 2.5, cursor: 'pointer', overflow: 'hidden',
                background: COLORS.glassBgLight, border: `1px solid ${COLORS.border}`,
                backdropFilter: 'blur(16px)',
                transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s, background 0.3s',
                boxShadow: hStyle.transform ? '0 16px 48px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.2)',
                ...hStyle,
                '&:hover .course-menu-btn': { opacity: 1 },
                '&:hover .course-hover-overlay': { opacity: 1 },
                '&:hover .course-hover-overlay .course-open-btn': { transform: 'translateY(0)' },
            }}
        >
            <Box sx={TOP_STRIPE_SX(course.color)} />
            {/* Subtle glow */}
            <Box sx={{ position: 'absolute', top: -30, left: -20, width: 140, height: 140, borderRadius: '50%', background: course.color, opacity: 0.08, filter: 'blur(35px)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Options menu */}
            <Box className="course-menu-btn" sx={{ position: 'absolute', top: 12, right: 12, zIndex: 20, opacity: 0, transition: 'opacity 0.15s' }}>
                <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
                    sx={{ width: 28, height: 28, borderRadius: 2, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)', '&:hover': { background: 'rgba(0,0,0,0.65)' } }}
                >
                    <MoreHorizontal size={14} />
                </IconButton>
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={e => { e?.stopPropagation?.(); setMenuAnchor(null); }}
                    onClick={e => e.stopPropagation()}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{ paper: { sx: { background: 'rgba(18,22,36,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 144 } } }}
                >
                    <MenuItem onClick={e => { e.stopPropagation(); setMenuAnchor(null); onEdit(course); }} sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', gap: 1.25 }}>
                        <Pencil size={13} /> Upravit
                    </MenuItem>
                    <MenuItem onClick={e => { e.stopPropagation(); setMenuAnchor(null); onDelete(course.id); }} sx={{ fontSize: 13, color: '#f87171', gap: 1.25, '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                        <Trash2 size={13} /> Smazat
                    </MenuItem>
                </Menu>
            </Box>

            {/* Icon */}
            <Box sx={{ width: 46, height: 46, borderRadius: '13px', background: `${course.color}18`, border: `1px solid ${course.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, mt: 1, fontSize: 22 }}>
                {course.icon || <Folder size={20} style={{ color: course.color }} />}
            </Box>

            <Typography sx={{ fontSize: 11, color: course.color, fontWeight: 700, mb: 0.375, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Kurz</Typography>
            <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 700, mb: course.description ? 0.75 : 1.75, color: 'white', lineHeight: 1.25 }}>{course.name}</Typography>

            {course.description && (
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', mb: 1.75, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                </Typography>
            )}

            <Stack gap={0.875} mb={2}>
                {stats.map((item, i) => (
                    <Stack key={i} direction="row" alignItems="center" gap={1.25}>
                        <item.Icon size={14} style={{ color: item.val > 0 ? item.col : 'rgba(255,255,255,0.15)' }} />
                        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                            <Box component="strong" sx={{ color: item.val > 0 ? 'white' : 'rgba(255,255,255,0.25)' }}>{item.val}</Box> {item.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid rgba(255,255,255,0.07)', pt: 1.5 }}>
                <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>Naposledy otevřeno</Typography>
                <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{formatRelative(course.lastOpened)}</Typography>
            </Stack>

            {/* Hover overlay */}
            <Stack
                className="course-hover-overlay"
                alignItems="center"
                justifyContent="center"
                sx={{
                    position: 'absolute', inset: 0, opacity: 0, borderRadius: 4, zIndex: 10,
                    background: 'rgba(10,12,20,0.88)', backdropFilter: 'blur(4px)',
                    transition: 'opacity 0.2s',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: '60%',
                        background: `radial-gradient(circle at 50% 0%, ${course.color}35, transparent 70%)`,
                        opacity: 0.8,
                        pointerEvents: 'none',
                    }
                }}
            >
                <Button
                    className="course-open-btn"
                    variant="contained"
                    onClick={() => onOpen(course)}
                    endIcon={<ArrowRight size={15} />}
                    sx={{
                        borderRadius: 99, px: 3, py: 1, fontWeight: 600, fontSize: 13, textTransform: 'none',
                        background: topBg, color: '#0F1117',
                        transform: 'translateY(12px)', transition: 'all 0.3s',
                        '&:hover': { background: topBg, filter: 'brightness(1.1)' },
                        zIndex: 2
                    }}
                >
                    Otevřít
                </Button>
            </Stack>
        </Paper>
    );
};

export const AddCourseModal = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [icon, setIcon] = useState(COURSE_ICONS[0]);
    const [color, setColor] = useState(COURSE_COLORS[0]);
    const [color2, setColor2] = useState(COURSE_COLORS[8]);
    const [useGradient, setUseGradient] = useState(false);

    const topBg = useGradient ? `linear-gradient(135deg, ${color}, ${color2})` : color;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            id: `${Date.now()}`,
            name: name.trim(),
            description: desc.trim(),
            icon,
            color,
            color2: useGradient ? color2 : null,
            useGradient,
            createdAt: new Date().toISOString().slice(0, 10),
            lastOpened: new Date().toISOString(),
            notes: 0, cards: 0, tests: 0,
        });
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { background: 'rgba(15,18,30,0.99)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, animation: `${modalSlideInAnim} 0.25s ease-out both`, maxHeight: '92vh' } } }}>
            <DialogTitle sx={{ pb: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} fontFamily="'Clash Display', sans-serif">Nový kurz</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack gap={2.5} sx={{ pt: 1 }}>
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1, display: 'block' }}>Náhled</Typography>
                        <CourseModalPreview topBg={topBg} color={color} icon={icon} name={name} desc={desc} />
                    </Box>
                    <TextField autoFocus label="Název kurzu *" fullWidth size="small" value={name}
                        onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
                        placeholder="např. Lineární algebra" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField label="Popis (volitelné)" fullWidth size="small" value={desc}
                        onChange={e => setDesc(e.target.value)} placeholder="Krátký popis obsahu kurzu..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'block' }}>Ikona</Typography>
                        <IconGrid icons={COURSE_ICONS} selectedIcon={icon} color={color} onSelect={setIcon} />
                    </Box>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Barva</Typography>
                            <GradientToggle useGradient={useGradient} setUseGradient={setUseGradient} color={color} />
                        </Stack>
                        {!useGradient ? (
                            <ColorSwatch value={color} onChange={setColor} />
                        ) : (
                            <Stack gap={1.5}>
                                <Box><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mb: 1, display: 'block' }}>Barva 1</Typography><ColorSwatch value={color} onChange={setColor} /></Box>
                                <Box><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mb: 1, display: 'block' }}>Barva 2</Typography><ColorSwatch value={color2} onChange={setColor2} /></Box>
                                <Box sx={{ height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${color}, ${color2})` }} />
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>Zrušit</Button>
                <Button onClick={handleSave} disabled={!name.trim()} variant="contained"
                    sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: topBg, color: '#0F1117', '&:hover': { filter: 'brightness(0.88)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                    Vytvořit kurz
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const EditCourseModal = ({ course, onSave, onClose }) => {
    const [name, setName] = useState(course.name);
    const [desc, setDesc] = useState(course.description || '');
    const [icon, setIcon] = useState(course.icon || COURSE_ICONS[0]);
    const [color, setColor] = useState(course.color);
    const [color2, setColor2] = useState(course.color2 || COURSE_COLORS[8]);
    const [useGradient, setUseGradient] = useState(course.useGradient || false);

    const topBg = useGradient ? `linear-gradient(135deg, ${color}, ${color2})` : color;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ ...course, name: name.trim(), description: desc.trim(), icon, color, color2: useGradient ? color2 : null, useGradient });
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { background: 'rgba(15,18,30,0.99)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, animation: `${modalSlideInAnim} 0.25s ease-out both`, maxHeight: '92vh' } } }}>
            <DialogTitle sx={{ pb: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} fontFamily="'Clash Display', sans-serif">Upravit kurz</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack gap={2.5} sx={{ pt: 1 }}>
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1, display: 'block' }}>Náhled</Typography>
                        <CourseModalPreview topBg={topBg} color={color} icon={icon} name={name} desc={desc} />
                    </Box>
                    <TextField autoFocus label="Název kurzu *" fullWidth size="small" value={name}
                        onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField label="Popis (volitelné)" fullWidth size="small" value={desc}
                        onChange={e => setDesc(e.target.value)} placeholder="Krátký popis obsahu kurzu..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'block' }}>Ikona</Typography>
                        <IconGrid icons={COURSE_ICONS} selectedIcon={icon} color={color} onSelect={setIcon} />
                    </Box>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Barva</Typography>
                            <GradientToggle useGradient={useGradient} setUseGradient={setUseGradient} color={color} />
                        </Stack>
                        {!useGradient ? (
                            <ColorSwatch value={color} onChange={setColor} />
                        ) : (
                            <Stack gap={1.5}>
                                <Box><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mb: 1, display: 'block' }}>Barva 1</Typography><ColorSwatch value={color} onChange={setColor} /></Box>
                                <Box><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mb: 1, display: 'block' }}>Barva 2</Typography><ColorSwatch value={color2} onChange={setColor2} /></Box>
                                <Box sx={{ height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${color}, ${color2})` }} />
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>Zrušit</Button>
                <Button onClick={handleSave} disabled={!name.trim()} variant="contained"
                    sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: topBg, color: '#0F1117', '&:hover': { filter: 'brightness(0.88)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                    Uložit změny
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const DeleteConfirmModal = ({ name, onConfirm, onClose }) => (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { background: 'rgba(15,18,30,0.99)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 3, animation: `${modalSlideInAnim} 0.2s ease-out both`, textAlign: 'center', p: 3 } } }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, background: 'rgba(248,113,113,0.1)' }}>
            <Trash2 size={22} color="#f87171" />
        </Box>
        <Typography variant="h6" fontWeight={700} fontFamily="'Clash Display', sans-serif" mb={1}>Smazat kurz?</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
            Kurz <Box component="strong" sx={{ color: 'white' }}>„{name}"</Box> a všechny jeho témy budou trvale smazány.
        </Typography>
        <Stack direction="row" gap={1}>
            <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>Zrušit</Button>
            <Button onClick={onConfirm} variant="contained" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, background: '#f87171', color: '#0F1117', '&:hover': { background: '#ef4444' } }}>Smazat</Button>
        </Stack>
    </Dialog>
);
