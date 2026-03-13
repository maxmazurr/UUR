import { useState, useMemo } from 'react';
import {
    Box, Paper, Stack, Typography, Chip, Button, IconButton,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, LinearProgress,
} from '@mui/material';
import { Calendar, ChevronLeft, ChevronRight, Plus, CheckSquare, Trash2, Clock } from 'lucide-react';
import { EVENT_TYPE_CONFIG, DAY_LABELS } from '../constants';
import { SOFT_HOVER, COLORS, DIALOG_PAPER_SX, GLASS_PANEL } from '../../styles';
import { today as getToday } from '../utils/date';
import { SectionHeader } from './SharedUI';

const PANEL_SX = { ...GLASS_PANEL, borderRadius: 3 };

const toDate = (dateStr) => new Date(`${dateStr}T00:00:00`);
const formatDate = (dateStr, options) => toDate(dateStr).toLocaleDateString('cs', options);

export const AddEventDialog = ({
    open,
    onClose,
    onSave,
    courses,
    defaultDate,
    allowedTypes,
    defaultType = 'deadline',
    dialogTitle = 'Nová událost',
}) => {
    const typeOptions = (allowedTypes && allowedTypes.length > 0) ? allowedTypes : Object.keys(EVENT_TYPE_CONFIG);
    const initialType = typeOptions.includes(defaultType) ? defaultType : typeOptions[0];
    const [title, setTitle] = useState('');
    const [type, setType] = useState(initialType);
    const [date, setDate] = useState(defaultDate || getToday());
    const [courseId, setCourseId] = useState('');
    const isTodoOnly = typeOptions.length === 1 && typeOptions[0] === 'todo';

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            id: `evt-${Date.now()}`,
            type,
            title: title.trim(),
            date: isTodoOnly ? (defaultDate || getToday()) : date,
            courseId: courseId || null,
            done: false,
            createdAt: new Date().toISOString(),
        });
        setTitle('');
        setType(initialType);
        setCourseId('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: DIALOG_PAPER_SX } }}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Stack gap={2.5} sx={{ mt: 1 }}>
                    <TextField fullWidth label="Název" size="small" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                    {typeOptions.length > 1 && (
                        <Stack direction="row" gap={1.5}>
                            {typeOptions.map((key) => {
                                const cfg = EVENT_TYPE_CONFIG[key];
                                if (!cfg) return null;
                                return (
                                    <Chip key={key} label={cfg.label} onClick={() => setType(key)}
                                        sx={{
                                            flex: 1, fontWeight: 700, fontSize: 13, height: 36, borderRadius: 2,
                                            background: type === key ? `${cfg.color}25` : 'rgba(255,255,255,0.04)',
                                            color: type === key ? cfg.color : 'text.secondary',
                                            border: `1px solid ${type === key ? `${cfg.color}40` : 'transparent'}`,
                                            '&:hover': { background: `${cfg.color}15` },
                                        }} />
                                );
                            })}
                        </Stack>
                    )}
                    {!isTodoOnly ? (
                        <TextField fullWidth label="Datum" type="date" size="small" value={date}
                            onChange={e => setDate(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }} />
                    ) : (
                        <Box sx={{ px: 1.5, py: 1.25, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography fontSize={12} color="text.secondary">Dnes</Typography>
                            <Typography fontSize={14} fontWeight={700}>{formatDate(defaultDate || getToday(), { day: 'numeric', month: 'long' })}</Typography>
                        </Box>
                    )}
                    {!isTodoOnly && (
                        <FormControl fullWidth size="small">
                            <InputLabel>Kurz (volitelné)</InputLabel>
                            <Select value={courseId} onChange={e => setCourseId(e.target.value)} label="Kurz (volitelné)">
                                <MenuItem value="">Žádný</MenuItem>
                                {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Zrušit</Button>
                <Button onClick={handleSave} variant="contained" disabled={!title.trim()}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, background: '#9055FF', '&:hover': { background: '#7C3AED' } }}>
                    Přidat
                </Button>
            </DialogActions>
        </Dialog>
    );
};

import { useStudyFlow } from '../StudyFlowContext';

export const PlanovacView = () => {
    const { events, setEvents, courses } = useStudyFlow();
    const today = getToday();
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddTodo, setShowAddTodo] = useState(false);
    const [selectedDate, setSelectedDate] = useState(today);
    const [calMonth, setCalMonth] = useState(() => new Date());

    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDayWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel = calMonth.toLocaleDateString('cs', { month: 'long', year: 'numeric' });

    const calendarDays = [];
    for (let i = 0; i < firstDayWeekday; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const importantEventsForDate = (dateStr) => events.filter(e => e.date === dateStr && (e.type === 'exam' || e.type === 'deadline'));
    const todosForDate = (dateStr) => events.filter(e => e.date === dateStr && e.type === 'todo');

    const selectedImportant = importantEventsForDate(selectedDate).sort((a, b) => {
        const ord = { exam: 0, deadline: 1 };
        return (ord[a.type] ?? 3) - (ord[b.type] ?? 3);
    });

    const todayTodos = todosForDate(today);
    const doneTodos = todayTodos.filter(t => t.done).length;
    const todoProgress = todayTodos.length ? Math.round((doneTodos / todayTodos.length) * 100) : 0;

    const toggleEventDone = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e));
    const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));
    const prevMonth = () => setCalMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCalMonth(new Date(year, month + 1, 1));

    const upcoming = useMemo(() => {
        const end = new Date(); end.setDate(end.getDate() + 14);
        return events
            .filter(e => (e.type === 'exam' || e.type === 'deadline') && !e.done && e.date >= today && e.date <= end.toISOString().slice(0, 10))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [events, today]);

    const activeTodos = events.filter(e => e.type === 'todo' && !e.done).length;
    const activeExams = events.filter(e => e.type === 'exam' && !e.done && e.date >= today).length;
    const activeDeadlines = events.filter(e => e.type === 'deadline' && !e.done && e.date >= today).length;

    const summaryCards = [
        { label: 'Aktivní úkoly', value: activeTodos, color: '#4ade80', icon: CheckSquare },
        { label: 'Zkoušky', value: activeExams, color: '#f87171', icon: Calendar },
        { label: 'Deadliny', value: activeDeadlines, color: '#fb923c', icon: Clock },
    ];

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Header */}
            <SectionHeader 
                title="Plánovač" 
                subtitle="Přehled termínů a rychlé to‑do na dnes"
                icon={Calendar}
                color={COLORS.primary}
                action={
                    <Stack direction="row" gap={1.5} flexWrap="wrap">
                        <Button onClick={() => setShowAddEvent(true)} variant="outlined" startIcon={<Plus size={16} />}
                            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: 'rgba(144,85,255,0.35)', color: '#9055FF', '&:hover': { borderColor: '#9055FF', background: 'rgba(144,85,255,0.08)' } }}>
                            Nový termín
                        </Button>
                        <Button onClick={() => setShowAddTodo(true)} variant="outlined" startIcon={<Plus size={16} />}
                            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: 'rgba(74,222,128,0.35)', color: '#4ade80', '&:hover': { borderColor: '#4ade80', background: 'rgba(74,222,128,0.08)' } }}>
                            Nový úkol
                        </Button>
                    </Stack>
                }
            />

            {/* Summary */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                {summaryCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <Paper key={s.label} elevation={0} sx={{ ...PANEL_SX, ...SOFT_HOVER, p: 2.5 }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                                    <Icon size={18} color={s.color} />
                                </Box>
                                <Box>
                                    <Typography fontSize={11} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</Typography>
                                    <Typography fontSize={22} fontWeight={800}>{s.value}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    );
                })}
            </Box>

            {/* Calendar + Day details */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 2, mb: 3 }}>
                {/* Calendar */}
                <Paper elevation={0} sx={{ ...PANEL_SX, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                        <Typography fontSize={16} fontWeight={700} sx={{ textTransform: 'capitalize' }}>{monthLabel}</Typography>
                        <Stack direction="row" gap={0.5} alignItems="center">
                            <IconButton size="small" onClick={prevMonth} sx={{ color: 'rgba(255,255,255,0.6)' }}><ChevronLeft size={18} /></IconButton>
                            <Button size="small" onClick={() => { setCalMonth(new Date()); setSelectedDate(today); }}
                                sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700, color: '#9055FF', minWidth: 'auto', px: 1.5 }}>
                                Dnes
                            </Button>
                            <IconButton size="small" onClick={nextMonth} sx={{ color: 'rgba(255,255,255,0.6)' }}><ChevronRight size={18} /></IconButton>
                        </Stack>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.75 }}>
                        {DAY_LABELS.map(d => (
                            <Typography key={d} fontSize={11} fontWeight={700} color="text.secondary" textAlign="center" py={0.5}>{d}</Typography>
                        ))}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                        {calendarDays.map((day, i) => {
                            if (day === null) return <Box key={`e-${i}`} />;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = importantEventsForDate(dateStr);
                            const isToday = dateStr === today;
                            const isSelected = dateStr === selectedDate;
                            const hasImportant = dayEvents.length > 0;
                            return (
                                <Box key={dateStr} onClick={() => setSelectedDate(dateStr)}
                                    sx={{
                                        py: 1.1, textAlign: 'center', borderRadius: 2, cursor: 'pointer',
                                        position: 'relative', transition: 'all 0.15s',
                                        background: isSelected ? 'rgba(144,85,255,0.16)' : isToday ? 'rgba(144,85,255,0.08)' : hasImportant ? 'rgba(255,255,255,0.02)' : 'transparent',
                                        border: isSelected ? '1px solid rgba(144,85,255,0.4)' : isToday ? '1px solid rgba(144,85,255,0.25)' : '1px solid rgba(255,255,255,0.04)',
                                        '&:hover': { background: isSelected ? 'rgba(144,85,255,0.2)' : 'rgba(255,255,255,0.04)' },
                                    }}>
                                    <Typography fontSize={14} fontWeight={isToday || isSelected ? 700 : 500}
                                        sx={{ color: isSelected ? '#9055FF' : isToday ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                                        {day}
                                    </Typography>
                                    {dayEvents.length > 0 && (
                                        <Stack direction="row" justifyContent="center" gap={0.35} mt={0.35}>
                                            {dayEvents.slice(0, 3).map((e, j) => (
                                                <Box key={j} sx={{ width: 5, height: 5, borderRadius: '50%', background: EVENT_TYPE_CONFIG[e.type]?.color || '#9055FF' }} />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    <Stack direction="row" gap={1} mt={2} flexWrap="wrap">
                        {['exam', 'deadline'].map((type) => (
                            <Stack key={type} direction="row" alignItems="center" gap={0.75}
                                sx={{ px: 1, py: 0.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: EVENT_TYPE_CONFIG[type].color }} />
                                <Typography fontSize={11} color="text.secondary">{EVENT_TYPE_CONFIG[type].label}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>

                {/* Selected day */}
                <Paper elevation={0} sx={{ ...PANEL_SX, p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography fontSize={15} fontWeight={700}>{formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</Typography>
                            <Typography fontSize={11} color="text.secondary">
                                {selectedDate === today ? 'Dnes' : selectedImportant.length > 0 ? `${selectedImportant.length} termínů` : 'Žádné termíny'}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setShowAddEvent(true)}
                            sx={{ background: 'rgba(144,85,255,0.1)', '&:hover': { background: 'rgba(144,85,255,0.2)' } }}>
                            <Plus size={16} color="#9055FF" />
                        </IconButton>
                    </Stack>

                    <Stack gap={1} sx={{ maxHeight: 380, overflow: 'auto' }}>
                        {selectedImportant.length === 0 ? (
                            <Stack alignItems="center" justifyContent="center" py={5}>
                                <Calendar size={32} color="rgba(255,255,255,0.08)" style={{ marginBottom: 10 }} />
                                <Typography fontSize={13} color="text.secondary" mb={0.5}>Žádné termíny</Typography>
                                <Typography fontSize={11} color="text.secondary">Klikněte + pro přidání</Typography>
                            </Stack>
                        ) : (
                            selectedImportant.map(evt => {
                                const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.deadline;
                                const courseName = courses.find(c => c.id === evt.courseId)?.name;
                                const diff = Math.ceil((toDate(evt.date) - new Date()) / 86400000);
                                const dueLabel = diff > 0 ? `Za ${diff} dní` : diff === 0 ? 'Dnes' : 'Proběhlo';
                                return (
                                    <Paper key={evt.id} elevation={0}
                                        sx={{
                                            p: 1.5, borderRadius: 2, borderLeft: `3px solid ${cfg.color}`,
                                            background: evt.done ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                                            opacity: evt.done ? 0.5 : 1, transition: 'all 0.2s',
                                        }}>
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography fontSize={13} fontWeight={600} sx={{ textDecoration: evt.done ? 'line-through' : 'none' }}>{evt.title}</Typography>
                                                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                                                    <Chip label={cfg.label} size="small"
                                                        sx={{ height: 18, fontSize: 10, fontWeight: 700, background: `${cfg.color}15`, color: cfg.color, borderRadius: 1 }} />
                                                    {courseName && <Typography fontSize={10} color="text.secondary">{courseName}</Typography>}
                                                </Stack>
                                            </Box>
                                            <Chip label={dueLabel} size="small"
                                                sx={{ height: 20, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.04)', color: 'text.secondary', borderRadius: 1 }} />
                                        </Stack>
                                    </Paper>
                                );
                            })
                        )}
                    </Stack>
                </Paper>
            </Box>

            {/* Todo + Upcoming */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' }, gap: 2 }}>
                {/* Todo today */}
                <Paper elevation={0} sx={{ ...PANEL_SX, p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1.5}>
                        <Box>
                            <Typography fontSize={15} fontWeight={700}>To‑do na dnes</Typography>
                            <Typography fontSize={11} color="text.secondary">Rychlý seznam úkolů pro dnešní den</Typography>
                        </Box>
                        <Button size="small" onClick={() => setShowAddTodo(true)} startIcon={<Plus size={14} />}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)', '&:hover': { background: 'rgba(74,222,128,0.08)' } }}>
                            Přidat úkol
                        </Button>
                    </Stack>

                    <Stack gap={1.5} mb={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography fontSize={12} color="text.secondary">Splněno</Typography>
                            <Typography fontSize={12} fontWeight={700} color="text.secondary">{doneTodos}/{todayTodos.length || 0}</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={todoProgress}
                            sx={{ height: 6, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { borderRadius: 99, background: 'linear-gradient(90deg, #4ade80, #13E2DA)' } }} />
                    </Stack>

                    <Stack gap={1}>
                        {todayTodos.length === 0 ? (
                            <Stack alignItems="center" justifyContent="center" py={4}>
                                <CheckSquare size={28} color="rgba(255,255,255,0.08)" style={{ marginBottom: 8 }} />
                                <Typography fontSize={13} color="text.secondary" mb={0.5}>Žádné úkoly na dnes</Typography>
                                <Typography fontSize={11} color="text.secondary">Klikni na „Přidat úkol“</Typography>
                            </Stack>
                        ) : (
                            todayTodos.map(evt => {
                                const cfg = EVENT_TYPE_CONFIG.todo;
                                return (
                                    <Paper key={evt.id} elevation={0} sx={{ p: 1.5, borderRadius: 2, borderLeft: `3px solid ${cfg.color}`, background: evt.done ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)' }}>
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Box onClick={() => toggleEventDone(evt.id)} sx={{ cursor: 'pointer', display: 'flex' }}>
                                                {evt.done
                                                    ? <CheckSquare size={18} color={cfg.color} />
                                                    : <Box sx={{ width: 18, height: 18, borderRadius: 1, border: `2px solid ${cfg.color}40` }} />
                                                }
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography fontSize={13} fontWeight={600}
                                                    sx={{ textDecoration: evt.done ? 'line-through' : 'none' }}>{evt.title}</Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => deleteEvent(evt.id)}
                                                sx={{ opacity: 0.3, '&:hover': { opacity: 1, color: '#f87171' } }}>
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </Stack>
                                    </Paper>
                                );
                            })
                        )}
                    </Stack>
                </Paper>

                {/* Upcoming */}
                <Paper elevation={0} sx={{ ...PANEL_SX, p: 2.5 }}>
                    <Typography fontSize={15} fontWeight={700} mb={2}>Nadcházející (14 dní)</Typography>
                    <Stack gap={1}>
                        {upcoming.length === 0 ? (
                            <Stack alignItems="center" justifyContent="center" py={4}>
                                <Calendar size={28} color="rgba(255,255,255,0.08)" style={{ marginBottom: 8 }} />
                                <Typography fontSize={13} color="text.secondary" mb={0.5}>Žádné termíny</Typography>
                                <Typography fontSize={11} color="text.secondary">Vše je pod kontrolou</Typography>
                            </Stack>
                        ) : (
                            upcoming.map(evt => {
                                const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.deadline;
                                const courseName = courses.find(c => c.id === evt.courseId)?.name;
                                const daysLeft = Math.max(0, Math.ceil((toDate(evt.date) - new Date()) / 86400000));
                                const dateLabel = formatDate(evt.date, { weekday: 'short', day: 'numeric', month: 'short' });
                                return (
                                    <Stack key={evt.id} direction="row" alignItems="center" gap={2}
                                        sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.02)', ...SOFT_HOVER }}>
                                        <Box sx={{ width: 40, textAlign: 'center', shrink: 0 }}>
                                            <Typography fontSize={18} fontWeight={800} sx={{ color: cfg.color, lineHeight: 1 }}>{daysLeft}</Typography>
                                            <Typography fontSize={9} color="text.secondary">dní</Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography fontSize={13} fontWeight={600}>{evt.title}</Typography>
                                            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                                                <Chip label={cfg.label} size="small"
                                                    sx={{ height: 18, fontSize: 10, fontWeight: 700, background: `${cfg.color}15`, color: cfg.color, borderRadius: 1 }} />
                                                {courseName && <Typography fontSize={10} color="text.secondary">{courseName}</Typography>}
                                            </Stack>
                                        </Box>
                                        <Typography fontSize={11} color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{dateLabel}</Typography>
                                    </Stack>
                                );
                            })
                        )}
                    </Stack>
                </Paper>
            </Box>

            <AddEventDialog key={selectedDate} open={showAddEvent} onClose={() => setShowAddEvent(false)}
                onSave={(evt) => setEvents(prev => [...prev, evt])} courses={courses} defaultDate={selectedDate}
                allowedTypes={['exam', 'deadline']} defaultType="exam" dialogTitle="Nový termín" />
            <AddEventDialog key={`todo-${selectedDate}`} open={showAddTodo} onClose={() => setShowAddTodo(false)}
                onSave={(evt) => setEvents(prev => [...prev, evt])} courses={courses} defaultDate={today}
                allowedTypes={['todo']} defaultType="todo" dialogTitle="Nový úkol" />
        </Box>
    );
};
