import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Typography, Stack,
    Chip, Paper, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { X, Copy, Plus } from 'lucide-react';
import { DIFF_COLORS, DIFF_LABELS } from '../constants';
import { DIALOG_PAPER_SX, COLORS } from '../../styles';
import { today as getToday } from '../utils/date';

const AI_PROMPT_TEMPLATE = `Vytvoř 15 flashcard kartiček ve formátu JSON na téma [TÉMA].
Zadání: [ZDE VLOŽ TEXT NEBO TÉMA]

Vrať pouze JSON pole:
[
  { "type": "flashcard", "front": "Středně dlouhá otázka (max 10 slov)", "back": "Stručná a jasná odpověď", "difficulty": "medium" }
]

Pravidla:
- Jazyk: Čeština
- Rozmanitost: Pokryj různé aspekty tématu
- Formát: Čistý JSON bez markdownu`;

const AI_TEST_PROMPT = `Vytvoř 10 testových otázek ABCD ve formátu JSON na téma [TÉMA].
Zadání: [ZDE VLOŽ TEXT NEBO TÉMA]

Vrať pouze JSON pole:
[
  {
    "question": "Otázka (max 15 slov)?",
    "options": [
      { "text": "Možnost A", "correct": true },
      { "text": "Možnost B", "correct": false },
      { "text": "Možnost C", "correct": false },
      { "text": "Možnost D", "correct": false }
    ],
    "difficulty": "medium"
  }
]

Pravidla:
- Jazyk: Čeština
- Každá otázka má právě jednu správnou odpověď
- Formát: Čistý JSON bez markdownu`;

const BULK_PLACEHOLDER = `Hlavní město ČR? | Praha
Nejvyšší hora světa? | Mount Everest
Kdo napsal Máj? | Karel Hynek Mácha`;

// ─── Shared sub-components used by both CardWizard and TestWizard ───

const CourseTopicSelectors = ({ courses, courseId, topicId, onCourseChange, onTopicChange }) => {
    const selectedCourse = courses.find(c => c.id === courseId);
    const topics = selectedCourse?.topics || [];
    return (
        <Stack direction="row" gap={2}>
            <FormControl fullWidth size="small">
                <InputLabel>Kurz</InputLabel>
                <Select value={courseId} label="Kurz" onChange={e => onCourseChange(e.target.value)} sx={{ borderRadius: 2 }}>
                    {courses.map(c => (
                        <MenuItem key={c.id} value={c.id}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                {c.name}
                            </Stack>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!topics.length}>
                <InputLabel>Téma</InputLabel>
                <Select value={topicId} label="Téma" onChange={e => onTopicChange(e.target.value)} sx={{ borderRadius: 2 }}>
                    {topics.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>
    );
};

const DifficultySelector = ({ difficulty, onChange }) => (
    <Stack gap={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>Obtížnost</Typography>
        <Stack direction="row" gap={1}>
            {Object.entries(DIFF_LABELS).map(([v, l]) => {
                const c = DIFF_COLORS[v];
                return (
                    <Chip key={v} label={l} onClick={() => onChange(v)}
                        sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer', background: difficulty === v ? `${c}25` : COLORS.glassBgLight, color: difficulty === v ? c : COLORS.textDim, border: '1px solid', borderColor: difficulty === v ? `${c}50` : 'transparent', '&:hover': { background: `${c}15` } }} />
                );
            })}
        </Stack>
    </Stack>
);

export const CardWizard = ({ courses, onSave, onClose, open, editCard = null, presetCourseId = null, presetTopicId = null }) => {
    const isEdit = !!editCard;
    const [step, setStep] = useState(1);
    const [type, setType] = useState(null);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [courseId, setCourseId] = useState('');
    const [topicId, setTopicId] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [bulkText, setBulkText] = useState('');
    const [aiJson, setAiJson] = useState('');
    const [aiParsed, setAiParsed] = useState(null);
    const [aiError, setAiError] = useState('');
    const [aiCopied, setAiCopied] = useState(false);

    // Reset/Sync state when dialog opens or editCard changes
    useEffect(() => {
        if (open) {
            setStep(isEdit ? 2 : 1);
            setType(isEdit ? 'flashcard' : null);
            setFront(editCard?.front || '');
            setBack(editCard?.back || '');
            setCourseId(editCard?.courseId || presetCourseId || courses[0]?.id || '');
            const c = courses.find(c => c.id === (editCard?.courseId || presetCourseId || courses[0]?.id));
            setTopicId(editCard?.topicId || presetTopicId || c?.topics?.[0]?.id || '');
            setDifficulty(editCard?.difficulty || 'medium');
            setBulkText('');
            setAiJson('');
            setAiParsed(null);
            setAiError('');
        }
    }, [open, editCard, presetCourseId, presetTopicId, courses]);

    const handleCourseChange = (id) => {
        setCourseId(id);
        const c = courses.find(c => c.id === id);
        setTopicId(c?.topics?.[0]?.id || '');
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(AI_PROMPT_TEMPLATE).then(() => {
            setAiCopied(true);
            setTimeout(() => setAiCopied(false), 2000);
        });
    };

    const handleAiParse = () => {
        setAiError('');
        setAiParsed(null);
        try {
            const raw = aiJson.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Očekáváno JSON pole kartiček.');
            const valid = parsed.filter(c => c.front && c.back);
            if (valid.length === 0) throw new Error('Žádná validní flashcard nenalezena.');
            setAiParsed(valid);
        } catch (e) {
            setAiError(e.message || 'Neplatný JSON formát.');
        }
    };

    const getBulkCards = () => {
        return bulkText.split('\n')
            .map(line => line.split('|'))
            .filter(parts => parts.length >= 2 && parts[0].trim() && parts[1].trim())
            .map(parts => ({ front: parts[0].trim(), back: parts[1].trim() }));
    };

    const canSave = isEdit
        ? front.trim() && back.trim()
        : type === 'flashcard'
            ? front.trim() && back.trim() && courseId && topicId
            : type === 'bulk'
                ? getBulkCards().length > 0 && courseId && topicId
                : aiParsed && aiParsed.length > 0 && courseId && topicId;

    const handleSave = () => {
        if (!canSave) return;
        if (isEdit) {
            onSave({ ...editCard, difficulty, front: front.trim(), back: back.trim() });
            return;
        }
        const course = courses.find(c => c.id === courseId);
        const topic = course?.topics?.find(t => t.id === topicId);
        const base = {
            courseId, courseName: course?.name || '', courseColor: course?.color || COLORS.accent,
            topicId, topicName: topic?.name || '',
            successRate: 0, totalReviews: 0, lastReviewed: null,
            nextReview: getToday(),
            createdAt: getToday(),
        };

        if (type === 'ai') {
            const cards = aiParsed.map((c, i) => ({
                ...base,
                id: `${Date.now()}_${i}`,
                type: 'flashcard',
                difficulty: c.difficulty || 'medium',
                front: c.front, back: c.back,
            }));
            onSave(cards);
        } else if (type === 'bulk') {
            const cards = getBulkCards().map((c, i) => ({
                ...base,
                id: `${Date.now()}_${i}`,
                type: 'flashcard',
                difficulty: 'medium',
                front: c.front, back: c.back,
            }));
            onSave(cards);
        } else {
            onSave({
                ...base,
                id: `${Date.now()}`,
                type: 'flashcard',
                difficulty,
                front: front.trim(), back: back.trim(),
            });
        }
    };

    const accentColor = type === 'ai' ? COLORS.green : type === 'bulk' ? COLORS.orange : COLORS.blue;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>{isEdit ? 'Upravit kartičku' : 'Nová kartička'}</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: COLORS.white40 }}><X size={16} /></IconButton>
                </Stack>
                {!isEdit && (
                    <Stack direction="row" gap={1} mt={1.5}>
                        {[1, 2].map(s => (
                            <Box key={s} sx={{ height: 3, flex: 1, borderRadius: 2, background: step >= s ? accentColor : COLORS.white10, transition: 'background 0.3s' }} />
                        ))}
                    </Stack>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {step === 1 ? (
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">Vyber způsob vytvoření:</Typography>
                        <Stack gap={2}>
                            {[
                                { value: 'flashcard', label: 'Jednotlivě', desc: 'Otázka + odpověď — klasický způsob', icon: '🃏', color: COLORS.blue },
                                { value: 'bulk', label: 'Hromadně (Seznam)', desc: 'Vlož seznam otázek a odpovědí pod sebe', icon: '📑', color: COLORS.orange },
                                { value: 'ai', label: 'AI Import (Pack)', desc: 'Vygeneruj balík kartiček pomocí AI', icon: '🤖', color: COLORS.green },
                            ].map(t => (
                                <Paper key={t.value} onClick={() => { setType(t.value); setStep(2); }} elevation={0}
                                    sx={{ p: 2, cursor: 'pointer', borderRadius: 3, border: '1px solid', borderColor: COLORS.white08, background: COLORS.white02, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 2, '&:hover': { borderColor: t.color, background: `${t.color}10` } }}>
                                    <Typography fontSize={28}>{t.icon}</Typography>
                                    <Box>
                                        <Typography fontWeight={700} fontSize={15}>{t.label}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Stack>
                ) : (
                    <Stack gap={2.5}>
                        {type === 'flashcard' ? (
                            <>
                                <TextField label="Přední strana (otázka)" multiline minRows={2} fullWidth
                                    value={front} onChange={e => setFront(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <TextField label="Zadní strana (odpověď)" multiline minRows={3} fullWidth
                                    value={back} onChange={e => setBack(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <CourseTopicSelectors
                                    courses={courses} courseId={courseId} topicId={topicId}
                                    onCourseChange={handleCourseChange} onTopicChange={setTopicId} />
                                <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
                            </>
                        ) : type === 'bulk' ? (
                            <>
                                <Stack gap={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Vložte otázky a odpovědi oddělené svislou čárou <b>|</b>. Každá karta na nový řádek.
                                    </Typography>
                                    <TextField label="Seznam (Otázka | Odpověď)" multiline minRows={8} fullWidth
                                        value={bulkText} onChange={e => setBulkText(e.target.value)}
                                        placeholder={BULK_PLACEHOLDER}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: 12 } }} />
                                    {getBulkCards().length > 0 && (
                                        <Typography variant="caption" color="success.main" fontWeight={700}>
                                            Rozpoznáno {getBulkCards().length} kartiček k vytvoření.
                                        </Typography>
                                    )}
                                </Stack>
                                <CourseTopicSelectors
                                    courses={courses} courseId={courseId} topicId={topicId}
                                    onCourseChange={handleCourseChange} onTopicChange={setTopicId} />
                            </>
                        ) : (
                            <>
                                <Stack gap={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Zkopíruj prompt, vlož ho do ChatGPT / Gemini, pak sem vlož výsledný JSON.
                                    </Typography>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: COLORS.green05, border: `1px solid ${COLORS.green}26`, fontFamily: 'monospace', fontSize: 11, color: COLORS.white60, whiteSpace: 'pre-wrap', maxHeight: 140, overflow: 'auto', lineHeight: 1.5 }}>
                                        {AI_PROMPT_TEMPLATE}
                                    </Paper>
                                    <Button onClick={handleCopyPrompt} variant="outlined" size="small" startIcon={<Copy size={13} />}
                                        sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontSize: 12, borderColor: `${COLORS.green}4D`, color: aiCopied ? COLORS.green : COLORS.white50, '&:hover': { borderColor: COLORS.green, background: COLORS.green08 } }}>
                                        {aiCopied ? 'Zkopírováno!' : 'Kopírovat prompt'}
                                    </Button>
                                </Stack>

                                <TextField label="Vlož JSON sem" multiline minRows={5} fullWidth
                                    value={aiJson} onChange={e => { setAiJson(e.target.value); setAiParsed(null); setAiError(''); }}
                                    placeholder='[{ "type": "flashcard", "front": "...", "back": "..." }, ...]'
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: 12 } }} />

                                {aiError && <Typography variant="caption" color="error">{aiError}</Typography>}

                                {aiParsed && (
                                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, background: COLORS.green08, border: `1px solid ${COLORS.green}33` }}>
                                        <Typography variant="caption" color={COLORS.green} fontWeight={700}>
                                            Nalezeno {aiParsed.length} flashcard kartiček
                                        </Typography>
                                        <Stack gap={0.5} mt={1} sx={{ maxHeight: 120, overflow: 'auto' }}>
                                            {aiParsed.map((c, i) => (
                                                <Typography key={i} variant="caption" color="text.secondary" noWrap>
                                                    {i + 1}. {c.front}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Paper>
                                )}

                                <CourseTopicSelectors
                                    courses={courses} courseId={courseId} topicId={topicId}
                                    onCourseChange={handleCourseChange} onTopicChange={setTopicId} />
                            </>
                        )}
                    </Stack>
                )}
            </DialogContent>

            {step === 2 && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={isEdit ? onClose : () => setStep(1)} variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none', borderColor: COLORS.white10, color: COLORS.white50 }}>
                        {isEdit ? 'Zrušit' : 'Zpět'}
                    </Button>
                    {type === 'ai' && !aiParsed && (
                        <Button onClick={handleAiParse} disabled={!aiJson.trim()} variant="outlined"
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: `${COLORS.green}66`, color: COLORS.green, '&:hover': { borderColor: COLORS.green, background: COLORS.green08 }, '&.Mui-disabled': { opacity: 0.3 } }}>
                            Analyzovat JSON
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={!canSave} variant="contained"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: 1, background: accentColor, '&:hover': { filter: 'brightness(0.88)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                        {isEdit ? 'Uložit změny' : type === 'ai' ? `Importovat ${aiParsed?.length ?? ''} kartiček` : type === 'bulk' ? `Vytvořit ${getBulkCards().length} kartiček` : 'Vytvořit kartičku'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export const TestWizard = ({ courses = [], onSave, onClose, open, editCard = null, courseId: presetCourseId, topicId: presetTopicId, courseName: presetCourseName, courseColor: presetCourseColor, topicName: presetTopicName }) => {
    const isEdit = !!editCard;
    const [mode, setMode] = useState(null);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([
        { text: '', correct: false }, { text: '', correct: false },
        { text: '', correct: false }, { text: '', correct: false },
    ]);
    const [courseId, setCourseId] = useState('');
    const [topicId, setTopicId] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [aiJson, setAiJson] = useState('');
    const [aiParsed, setAiParsed] = useState(null);
    const [aiError, setAiError] = useState('');
    const [aiCopied, setAiCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setMode(isEdit ? 'manual' : null);
            setQuestion(editCard?.question || '');
            setOptions(editCard?.options || [
                { text: '', correct: false }, { text: '', correct: false },
                { text: '', correct: false }, { text: '', correct: false },
            ]);
            setCourseId(editCard?.courseId || presetCourseId || courses[0]?.id || '');
            const c = courses.find(c => c.id === (editCard?.courseId || presetCourseId || courses[0]?.id));
            setTopicId(editCard?.topicId || presetTopicId || c?.topics?.[0]?.id || '');
            setDifficulty(editCard?.difficulty || 'medium');
            setAiJson('');
            setAiParsed(null);
            setAiError('');
        }
    }, [open, editCard, presetCourseId, presetTopicId, courses]);

    const courseName = courses.find(c => c.id === courseId)?.name || presetCourseName || '';
    const courseColor = courses.find(c => c.id === courseId)?.color || presetCourseColor || COLORS.primary;
    const topicName = courses.find(c => c.id === courseId)?.topics?.find(t => t.id === topicId)?.name || presetTopicName || '';

    const handleCourseChange = (id) => {
        setCourseId(id);
        const c = courses.find(c => c.id === id);
        setTopicId(c?.topics?.[0]?.id || '');
    };

    const setOptionCorrect = (idx) => setOptions(prev => prev.map((o, i) => ({ ...o, correct: i === idx })));
    const setOptionText = (idx, text) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, text } : o));

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(AI_TEST_PROMPT).then(() => { setAiCopied(true); setTimeout(() => setAiCopied(false), 2000); });
    };

    const handleAiParse = () => {
        setAiError(''); setAiParsed(null);
        try {
            const raw = aiJson.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || !parsed.length) throw new Error('Očekáváno JSON pole.');
            const valid = parsed.filter(c => c.question && Array.isArray(c.options) && c.options.length === 4 && c.options.some(o => o.correct));
            if (!valid.length) throw new Error('Žádný validní test nenalezen.');
            setAiParsed(valid);
        } catch (e) { setAiError(e.message || 'Neplatný JSON.'); }
    };

    const canSaveManual = question.trim() && options.every(o => o.text.trim()) && options.some(o => o.correct);

    const handleSave = () => {
        if (isEdit) {
            onSave({ ...editCard, question: question.trim(), options, difficulty });
            return;
        }
        const base = { courseId, courseName, courseColor, topicId, topicName, type: 'test', successRate: 0, totalReviews: 0, lastReviewed: null, nextReview: getToday(), createdAt: getToday() };
        if (mode === 'ai' && aiParsed) {
            onSave(aiParsed.map((c, i) => ({ ...base, id: `${Date.now()}_${i}`, question: c.question, options: c.options, difficulty: c.difficulty || 'medium' })));
        } else {
            onSave({ ...base, id: `${Date.now()}`, question: question.trim(), options, difficulty });
        }
    };

    const accentColor = COLORS.purple;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>{isEdit ? 'Upravit test (ABCD)' : 'Nový test (ABCD)'}</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: COLORS.white40 }}><X size={16} /></IconButton>
                </Stack>
                {!isEdit && (
                    <Stack direction="row" gap={1} mt={1.5}>
                        {[1, 2].map(s => (
                            <Box key={s} sx={{ height: 3, flex: 1, borderRadius: 2, background: (mode ? 2 : 1) >= s ? accentColor : COLORS.white10, transition: 'background 0.3s' }} />
                        ))}
                    </Stack>
                )}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {!mode ? (
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">Jak chceš vytvořit test?</Typography>
                        {[
                            { value: 'manual', label: 'Ručně', desc: 'Otázka + 4 možnosti ABCD', icon: '📝', color: COLORS.purple },
                            { value: 'ai', label: 'AI Import', desc: 'Vygeneruj testy pomocí AI a importuj JSON', icon: '🤖', color: COLORS.green },
                        ].map(t => (
                            <Paper key={t.value} onClick={() => setMode(t.value)} elevation={0}
                                sx={{ p: 2, cursor: 'pointer', borderRadius: 3, border: '1px solid', borderColor: COLORS.white08, background: COLORS.white02, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 2, '&:hover': { borderColor: t.color, background: `${t.color}10` } }}>
                                <Typography fontSize={28}>{t.icon}</Typography>
                                <Box>
                                    <Typography fontWeight={700} fontSize={15}>{t.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                ) : mode === 'manual' ? (
                    <Stack gap={2.5}>
                        <TextField label="Otázka" multiline minRows={2} fullWidth value={question} onChange={e => setQuestion(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <Stack gap={1}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                Možnosti — klikni na kruh pro správnou odpověď
                            </Typography>
                            {options.map((opt, i) => (
                                <Stack key={i} direction="row" alignItems="center" gap={1.5}>
                                    <Box onClick={() => setOptionCorrect(i)} sx={{ width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', border: '2px solid', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: opt.correct ? COLORS.green : COLORS.white20, background: opt.correct ? `${COLORS.green}40` : 'transparent' }}>
                                        {opt.correct && <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.green }} />}
                                    </Box>
                                    <TextField size="small" fullWidth placeholder={`Možnost ${String.fromCharCode(65 + i)}`} value={opt.text} onChange={e => setOptionText(i, e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                </Stack>
                            ))}
                        </Stack>
                        <CourseTopicSelectors
                            courses={courses} courseId={courseId} topicId={topicId}
                            onCourseChange={handleCourseChange} onTopicChange={setTopicId} />
                        <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
                    </Stack>
                ) : (
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">Zkopíruj prompt, vlož do ChatGPT / Gemini, pak sem vlož výsledný JSON.</Typography>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: `${COLORS.purple}0D`, border: `1px solid ${COLORS.purple}26`, fontFamily: 'monospace', fontSize: 11, color: COLORS.white60, whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto', lineHeight: 1.5 }}>
                            {AI_TEST_PROMPT}
                        </Paper>
                        <Button onClick={handleCopyPrompt} variant="outlined" size="small" startIcon={<Copy size={13} />}
                            sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontSize: 12, borderColor: `${COLORS.purple}4D`, color: aiCopied ? COLORS.purple : COLORS.white50, '&:hover': { borderColor: COLORS.purple, background: `${COLORS.purple}12` } }}>
                            {aiCopied ? 'Zkopírováno!' : 'Kopírovat prompt'}
                        </Button>
                        <TextField label="Vlož JSON sem" multiline minRows={4} fullWidth value={aiJson}
                            onChange={e => { setAiJson(e.target.value); setAiParsed(null); setAiError(''); }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: 12 } }} />
                        <CourseTopicSelectors
                            courses={courses} courseId={courseId} topicId={topicId}
                            onCourseChange={handleCourseChange} onTopicChange={setTopicId} />
                        {aiError && <Typography variant="caption" color="error">{aiError}</Typography>}
                        {aiParsed && (
                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, background: `${COLORS.purple}0F`, border: `1px solid ${COLORS.purple}33` }}>
                                <Typography variant="caption" color={COLORS.purple} fontWeight={700}>Nalezeno {aiParsed.length} testů</Typography>
                                <Stack gap={0.5} mt={1} sx={{ maxHeight: 100, overflow: 'auto' }}>
                                    {aiParsed.map((c, i) => (
                                        <Typography key={i} variant="caption" color="text.secondary" noWrap>{i + 1}. {c.question}</Typography>
                                    ))}
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                )}
            </DialogContent>
            {mode && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={isEdit ? onClose : () => setMode(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: COLORS.white10, color: COLORS.white50 }}>{isEdit ? 'Zrušit' : 'Zpět'}</Button>
                    {mode === 'ai' && !aiParsed && (
                        <Button onClick={handleAiParse} disabled={!aiJson.trim()} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: `${COLORS.purple}66`, color: COLORS.purple, '&:hover': { borderColor: COLORS.purple }, '&.Mui-disabled': { opacity: 0.3 } }}>
                            Analyzovat JSON
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={mode === 'manual' ? !canSaveManual : !aiParsed} variant="contained"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: 1, background: accentColor, '&:hover': { filter: 'brightness(0.88)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                        {isEdit ? 'Uložit změny' : mode === 'ai' ? `Importovat ${aiParsed?.length ?? ''} testů` : 'Vytvořit test'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};
