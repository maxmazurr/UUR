import { useState } from 'react';
import Box from '@mui/material/Box';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Typography, Stack,
    Chip, Paper, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { X, Copy, Plus } from 'lucide-react';
import { DIFF_COLORS, DIFF_LABELS } from '../constants';
import { DIALOG_PAPER_SX, COLORS } from '../../styles';

const AI_PROMPT_TEMPLATE = `Vytvoř 10 flashcard kartiček ve formátu JSON na téma [TÉMA].
Vrať pouze JSON pole bez dalšího textu, bez markdown bloků:

[
  { "type": "flashcard", "front": "Otázka", "back": "Odpověď", "difficulty": "medium" }
]

Pravidla:
- difficulty: "easy" | "medium" | "hard"
- Pole "front" a "back" jsou povinná
- Vrať pouze čisté JSON pole, žádný komentář`;

const AI_TEST_PROMPT = `Vytvoř 10 testových otázek ABCD ve formátu JSON na téma [TÉMA].
Vrať pouze JSON pole bez dalšího textu, bez markdown bloků:

[
  {
    "question": "Otázka",
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
- difficulty: "easy" | "medium" | "hard"
- Přesně 4 možnosti, právě jedna s correct: true
- Vrať pouze čisté JSON pole, žádný komentář`;

export const CardWizard = ({ courses, onSave, onClose, editCard = null }) => {
    const isEdit = !!editCard;
    const [step, setStep] = useState(isEdit ? 2 : 1);
    const [type, setType] = useState(isEdit ? 'flashcard' : null);
    const [front, setFront] = useState(editCard?.front || '');
    const [back, setBack] = useState(editCard?.back || '');
    const [courseId, setCourseId] = useState(editCard?.courseId || courses[0]?.id || '');
    const [topicId, setTopicId] = useState(editCard?.topicId || courses[0]?.topics?.[0]?.id || '');
    const [difficulty, setDifficulty] = useState(editCard?.difficulty || 'medium');
    const [aiJson, setAiJson] = useState('');
    const [aiParsed, setAiParsed] = useState(null);
    const [aiError, setAiError] = useState('');
    const [aiCopied, setAiCopied] = useState(false);

    const selectedCourse = courses.find(c => c.id === courseId);
    const topics = selectedCourse?.topics || [];

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
            if (valid.length === 0) throw new Error('Žádná validní flashcard nenalezena. Každá kartička musí mít "front" a "back".');
            setAiParsed(valid);
        } catch (e) {
            setAiError(e.message || 'Neplatný JSON formát.');
        }
    };

    const canSave = isEdit
        ? front.trim() && back.trim()
        : type === 'flashcard'
            ? front.trim() && back.trim() && courseId && topicId
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
            courseId, courseName: course?.name || '', courseColor: course?.color || '#7C6FF7',
            topicId, topicName: topic?.name || '',
            successRate: 0, totalReviews: 0, lastReviewed: null,
            nextReview: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString().slice(0, 10),
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

    const accentColor = type === 'ai' ? '#4ade80' : '#4F9CF9';

    const CourseTopicSelectors = () => (
        <Stack direction="row" gap={2}>
            <FormControl fullWidth size="small">
                <InputLabel>Kurz</InputLabel>
                <Select value={courseId} label="Kurz" onChange={e => handleCourseChange(e.target.value)} sx={{ borderRadius: 2 }}>
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
                <Select value={topicId} label="Téma" onChange={e => setTopicId(e.target.value)} sx={{ borderRadius: 2 }}>
                    {topics.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>
    );

    const DifficultySelector = () => (
        <Stack gap={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>Obtížnost</Typography>
            <Stack direction="row" gap={1}>
                {[{ v: 'easy', l: 'Lehká', c: '#4ade80' }, { v: 'medium', l: 'Střední', c: '#fb923c' }, { v: 'hard', l: 'Těžká', c: '#f87171' }].map(d => (
                    <Chip key={d.v} label={d.l} onClick={() => setDifficulty(d.v)}
                        sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer', background: difficulty === d.v ? `${d.c}25` : COLORS.glassBgLight, color: difficulty === d.v ? d.c : COLORS.textDim, border: '1px solid', borderColor: difficulty === d.v ? `${d.c}50` : 'transparent', '&:hover': { background: `${d.c}15` } }} />
                ))}
            </Stack>
        </Stack>
    );

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>{isEdit ? 'Upravit kartičku' : 'Nová kartička'}</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></IconButton>
                </Stack>
                {!isEdit && (
                    <Stack direction="row" gap={1} mt={1.5}>
                        {[1, 2].map(s => (
                            <Box key={s} sx={{ height: 3, flex: 1, borderRadius: 2, background: step >= s ? accentColor : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                        ))}
                    </Stack>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {step === 1 ? (
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">Vyber typ kartičky:</Typography>
                        <Stack gap={2}>
                            {[
                                { value: 'flashcard', label: 'Flashcard', desc: 'Otázka + odpověď — vyplníš ručně', icon: '🃏', color: '#4F9CF9' },
                                { value: 'ai', label: 'AI Import', desc: 'Zkopíruj prompt do ChatGPT a importuj JSON', icon: '🤖', color: '#4ade80' },
                            ].map(t => (
                                <Paper key={t.value} onClick={() => { setType(t.value); setStep(2); }} elevation={0}
                                    sx={{ p: 2, cursor: 'pointer', borderRadius: 3, border: '1px solid', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 2, '&:hover': { borderColor: t.color, background: `${t.color}10` } }}>
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
                                <CourseTopicSelectors />
                                <DifficultySelector />
                            </>
                        ) : (
                            <>
                                <Stack gap={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Zkopíruj prompt, vlož ho do ChatGPT / Gemini, pak sem vlož výsledný JSON.
                                    </Typography>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', maxHeight: 140, overflow: 'auto', lineHeight: 1.5 }}>
                                        {AI_PROMPT_TEMPLATE}
                                    </Paper>
                                    <Button onClick={handleCopyPrompt} variant="outlined" size="small" startIcon={<Copy size={13} />}
                                        sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontSize: 12, borderColor: 'rgba(74,222,128,0.3)', color: aiCopied ? '#4ade80' : 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#4ade80', background: 'rgba(74,222,128,0.08)' } }}>
                                        {aiCopied ? 'Zkopírováno!' : 'Kopírovat prompt'}
                                    </Button>
                                </Stack>

                                <TextField label="Vlož JSON sem" multiline minRows={5} fullWidth
                                    value={aiJson} onChange={e => { setAiJson(e.target.value); setAiParsed(null); setAiError(''); }}
                                    placeholder='[{ "type": "flashcard", "front": "...", "back": "..." }, ...]'
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: 12 } }} />

                                {aiError && <Typography variant="caption" color="error">{aiError}</Typography>}

                                {aiParsed && (
                                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                        <Typography variant="caption" color="#4ade80" fontWeight={700}>
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

                                <CourseTopicSelectors />
                            </>
                        )}
                    </Stack>
                )}
            </DialogContent>

            {step === 2 && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={isEdit ? onClose : () => setStep(1)} variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                        {isEdit ? 'Zrušit' : 'Zpět'}
                    </Button>
                    {type === 'ai' && !aiParsed && (
                        <Button onClick={handleAiParse} disabled={!aiJson.trim()} variant="outlined"
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: 'rgba(74,222,128,0.4)', color: '#4ade80', '&:hover': { borderColor: '#4ade80', background: 'rgba(74,222,128,0.08)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                            Analyzovat JSON
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={!canSave} variant="contained"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: 1, background: accentColor, '&:hover': { filter: 'brightness(0.88)' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                        {isEdit ? 'Uložit změny' : type === 'ai' ? `Importovat ${aiParsed?.length ?? ''} kartiček` : 'Vytvořit kartičku'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export const TestWizard = ({ courseId, courseName, courseColor, topicId, topicName, onSave, onClose, editCard = null }) => {
    const isEdit = !!editCard;
    const [mode, setMode] = useState(isEdit ? 'manual' : null);
    const [question, setQuestion] = useState(editCard?.question || '');
    const [options, setOptions] = useState(editCard?.options || [
        { text: '', correct: false }, { text: '', correct: false },
        { text: '', correct: false }, { text: '', correct: false },
    ]);
    const [difficulty, setDifficulty] = useState(editCard?.difficulty || 'medium');
    const [aiJson, setAiJson] = useState('');
    const [aiParsed, setAiParsed] = useState(null);
    const [aiError, setAiError] = useState('');
    const [aiCopied, setAiCopied] = useState(false);

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
        const base = { courseId, courseName, courseColor, topicId, topicName, type: 'test', successRate: 0, totalReviews: 0, lastReviewed: null, nextReview: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString().slice(0, 10) };
        if (mode === 'ai' && aiParsed) {
            onSave(aiParsed.map((c, i) => ({ ...base, id: `${Date.now()}_${i}`, question: c.question, options: c.options, difficulty: c.difficulty || 'medium' })));
        } else {
            onSave({ ...base, id: `${Date.now()}`, question: question.trim(), options, difficulty });
        }
    };

    const accentColor = '#c084fc';

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>{isEdit ? 'Upravit test (ABCD)' : 'Nový test (ABCD)'}</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></IconButton>
                </Stack>
                {!isEdit && (
                    <Stack direction="row" gap={1} mt={1.5}>
                        {[1, 2].map(s => (
                            <Box key={s} sx={{ height: 3, flex: 1, borderRadius: 2, background: (mode ? 2 : 1) >= s ? accentColor : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                        ))}
                    </Stack>
                )}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {!mode ? (
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">Jak chceš vytvořit test?</Typography>
                        {[
                            { value: 'manual', label: 'Ručně', desc: 'Otázka + 4 možnosti ABCD', icon: '📝', color: '#c084fc' },
                            { value: 'ai', label: 'AI Import', desc: 'Vygeneruj testy pomocí AI a importuj JSON', icon: '🤖', color: '#4ade80' },
                        ].map(t => (
                            <Paper key={t.value} onClick={() => setMode(t.value)} elevation={0}
                                sx={{ p: 2, cursor: 'pointer', borderRadius: 3, border: '1px solid', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 2, '&:hover': { borderColor: t.color, background: `${t.color}10` } }}>
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
                                    <Box onClick={() => setOptionCorrect(i)} sx={{ width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', border: '2px solid', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: opt.correct ? '#4ade80' : 'rgba(255,255,255,0.2)', background: opt.correct ? '#4ade8025' : 'transparent' }}>
                                        {opt.correct && <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />}
                                    </Box>
                                    <TextField size="small" fullWidth placeholder={`Možnost ${String.fromCharCode(65 + i)}`} value={opt.text} onChange={e => setOptionText(i, e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                </Stack>
                            ))}
                        </Stack>
                        <Stack gap={1}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>Obtížnost</Typography>
                            <Stack direction="row" gap={1}>
                                {[{ v: 'easy', l: 'Lehká', c: '#4ade80' }, { v: 'medium', l: 'Střední', c: '#fb923c' }, { v: 'hard', l: 'Těžká', c: '#f87171' }].map(d => (
                                    <Chip key={d.v} label={d.l} onClick={() => setDifficulty(d.v)} sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer', background: difficulty === d.v ? `${d.c}25` : 'rgba(255,255,255,0.04)', color: difficulty === d.v ? d.c : 'rgba(255,255,255,0.4)', border: '1px solid', borderColor: difficulty === d.v ? `${d.c}50` : 'transparent', '&:hover': { background: `${d.c}15` } }} />
                                ))}
                            </Stack>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">Zkopíruj prompt, vlož do ChatGPT / Gemini, pak sem vlož výsledný JSON.</Typography>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.15)', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto', lineHeight: 1.5 }}>
                            {AI_TEST_PROMPT}
                        </Paper>
                        <Button onClick={handleCopyPrompt} variant="outlined" size="small" startIcon={<Copy size={13} />}
                            sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontSize: 12, borderColor: 'rgba(192,132,252,0.3)', color: aiCopied ? '#c084fc' : 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#c084fc', background: 'rgba(192,132,252,0.08)' } }}>
                            {aiCopied ? 'Zkopírováno!' : 'Kopírovat prompt'}
                        </Button>
                        <TextField label="Vlož JSON sem" multiline minRows={4} fullWidth value={aiJson}
                            onChange={e => { setAiJson(e.target.value); setAiParsed(null); setAiError(''); }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: 12 } }} />
                        {aiError && <Typography variant="caption" color="error">{aiError}</Typography>}
                        {aiParsed && (
                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.2)' }}>
                                <Typography variant="caption" color="#c084fc" fontWeight={700}>Nalezeno {aiParsed.length} testů</Typography>
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
                    <Button onClick={isEdit ? onClose : () => setMode(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>{isEdit ? 'Zrušit' : 'Zpět'}</Button>
                    {mode === 'ai' && !aiParsed && (
                        <Button onClick={handleAiParse} disabled={!aiJson.trim()} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: 'rgba(192,132,252,0.4)', color: '#c084fc', '&:hover': { borderColor: '#c084fc' }, '&.Mui-disabled': { opacity: 0.3 } }}>
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
