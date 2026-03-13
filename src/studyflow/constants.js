import { keyframes } from '@emotion/react';
import { COLORS } from '../styles';

// Re-export shared styles so existing imports keep working
export { GLASS_PANEL, fadeInUpAnim, modalSlideInAnim, deadlineShimmerAnim } from '../styles';

// --- KEYFRAMES (StudyFlow-specific) ---
export const orbFloat1Anim = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(10vw, -10vh) scale(1.1); }
  66% { transform: translate(-10vw, 5vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;
export const orbFloat2Anim = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-10vw, 10vh) scale(1.1); }
  66% { transform: translate(10vw, -5vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;
export const orbFloat3Anim = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(5vw, -5vh) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
`;

// --- STYLE CONSTANTS ---
export const HEAT_COLORS = {
    0: COLORS.glassBgLight,
    1: 'rgba(124, 111, 247, 0.25)',
    2: 'rgba(124, 111, 247, 0.50)',
    3: 'rgba(124, 111, 247, 0.75)',
    4: COLORS.accent,
};

// --- COURSE CONSTANTS ---
export const COURSE_COLORS = [
    '#60a5fa', '#3b82f6', '#38bdf8', '#06b6d4',
    COLORS.green, '#22c55e', '#a3e635', COLORS.yellow,
    COLORS.orange, COLORS.red, '#f43f5e', '#e879f9',
    COLORS.purple, '#a78bfa', '#818cf8', '#ffffff',
];

export const COURSE_ICONS = [
    '📚', '📖', '🧮', '💻', '🔬', '⚛️', '🌍', '📝',
    '🎨', '🎵', '⚗️', '📐', '🧠', '💡', '🔭', '📊',
    '🏛️', '⚽', '🎭', '🌱', '🔢', '📜', '🗺️', '🎯',
];

// --- DEMO DATA ---
export const DEMO_COURSES = [
    {
        id: 'c1', name: 'Matematika', color: '#60a5fa', color2: null, useGradient: false, icon: '🧮',
        description: 'Lineární algebra, analýza a statistika', createdAt: '2026-01-15', lastOpened: '2026-03-07T09:41:00', notes: 12, cards: 145, tests: 2,
        topics: [
            { id: 't1', name: 'Lineární algebra', color: '#60a5fa', notes: 5, cards: 60, createdAt: '2026-01-16' },
            { id: 't2', name: 'Matematická analýza', color: '#38bdf8', notes: 4, cards: 50, createdAt: '2026-01-20' },
            { id: 't3', name: 'Statistika', color: '#818cf8', notes: 3, cards: 35, createdAt: '2026-02-01' },
        ],
    },
    {
        id: 'c2', name: 'Angličtina B2', color: COLORS.purple, color2: '#38bdf8', useGradient: true, icon: '🌍',
        description: 'Gramatika, slovní zásoba a konverzace', createdAt: '2026-01-20', lastOpened: '2026-03-06T18:22:00', notes: 5, cards: 320, tests: 1,
        topics: [
            { id: 't4', name: 'Gramatika', color: COLORS.purple, notes: 2, cards: 120, createdAt: '2026-01-21' },
            { id: 't5', name: 'Phrasal verbs', color: '#38bdf8', notes: 3, cards: 200, createdAt: '2026-01-28' },
        ],
    },
    {
        id: 'c3', name: 'Fyzika', color: COLORS.green, color2: null, useGradient: false, icon: '⚛️',
        description: 'Mechanika, termodynamika, elektřina', createdAt: '2026-01-25', lastOpened: '2026-03-05T14:10:00', notes: 8, cards: 85, tests: 4,
        topics: [
            { id: 't6', name: 'Mechanika', color: COLORS.green, notes: 4, cards: 40, createdAt: '2026-01-26' },
            { id: 't7', name: 'Termodynamika', color: COLORS.yellow, notes: 2, cards: 25, createdAt: '2026-02-05' },
            { id: 't8', name: 'Elektromagnetismus', color: COLORS.orange, notes: 2, cards: 20, createdAt: '2026-02-15' },
        ],
    },
    {
        id: 'c4', name: 'Dějepis', color: COLORS.yellow, color2: COLORS.orange, useGradient: true, icon: '📜',
        description: 'Světové dějiny 20. století', createdAt: '2026-02-01', lastOpened: '2026-03-04T11:00:00', notes: 24, cards: 410, tests: 0,
        topics: [
            { id: 't9', name: '1. světová válka', color: COLORS.yellow, notes: 8, cards: 120, createdAt: '2026-02-02' },
            { id: 't10', name: '2. světová válka', color: COLORS.orange, notes: 10, cards: 180, createdAt: '2026-02-10' },
            { id: 't11', name: 'Studená válka', color: COLORS.red, notes: 6, cards: 110, createdAt: '2026-02-20' },
        ],
    },
];

export const DEMO_CARDS = [
    { id: 'k1', type: 'flashcard', front: 'Co je determinant matice?', back: 'Skalární hodnota charakterizující čtvercovou matici. Značí se det(A) nebo |A|.', courseId: 'c1', courseName: 'Matematika', courseColor: '#60a5fa', topicId: 't1', topicName: 'Lineární algebra', difficulty: 'hard', successRate: 35, totalReviews: 18, lastReviewed: '2026-03-06', nextReview: '2026-03-08', createdAt: '2026-01-20' },
    { id: 'k2', type: 'flashcard', front: 'Definice limity funkce', back: 'Limita f(x) v bodě a je L, pokud pro každé ε>0 existuje δ>0 tak, že |f(x)−L|<ε pro 0<|x−a|<δ.', courseId: 'c1', courseName: 'Matematika', courseColor: '#60a5fa', topicId: 't2', topicName: 'Matematická analýza', difficulty: 'hard', successRate: 42, totalReviews: 22, lastReviewed: '2026-03-05', nextReview: '2026-03-08', createdAt: '2026-01-22' },
    { id: 'k3', type: 'test', question: 'Která hodnota je determinant jednotkové matice 2×2?', options: [{ text: '0', correct: false }, { text: '1', correct: true }, { text: '-1', correct: false }, { text: '2', correct: false }], courseId: 'c1', courseName: 'Matematika', courseColor: '#60a5fa', topicId: 't1', topicName: 'Lineární algebra', difficulty: 'medium', successRate: 78, totalReviews: 12, lastReviewed: '2026-03-04', nextReview: '2026-03-11', createdAt: '2026-01-25' },
    { id: 'k4', type: 'flashcard', front: 'Pythagorova věta', back: 'V pravoúhlém trojúhelníku: a² + b² = c², kde c je přepona.', courseId: 'c1', courseName: 'Matematika', courseColor: '#60a5fa', topicId: 't1', topicName: 'Lineární algebra', difficulty: 'easy', successRate: 92, totalReviews: 30, lastReviewed: '2026-03-07', nextReview: '2026-03-14', createdAt: '2026-01-18' },
    { id: 'k5', type: 'flashcard', front: 'Co dělá useEffect v Reactu?', back: 'Hook pro vedlejší efekty — fetching, subscriptions, DOM manipulace. Spouští se po renderování.', courseId: 'c1', courseName: 'Matematika', courseColor: '#60a5fa', topicId: 't3', topicName: 'Statistika', difficulty: 'medium', successRate: 65, totalReviews: 14, lastReviewed: '2026-03-07', nextReview: '2026-03-09', createdAt: '2026-02-01' },
    { id: 'k6', type: 'test', question: 'Který čas se používá pro probíhající děje v angličtině?', options: [{ text: 'Past Simple', correct: false }, { text: 'Present Simple', correct: false }, { text: 'Present Continuous', correct: true }, { text: 'Future Perfect', correct: false }], courseId: 'c2', courseName: 'Angličtina B2', courseColor: COLORS.purple, topicId: 't4', topicName: 'Gramatika', difficulty: 'easy', successRate: 85, totalReviews: 20, lastReviewed: '2026-03-06', nextReview: '2026-03-12', createdAt: '2026-01-28' },
    { id: 'k7', type: 'flashcard', front: 'Newtonův druhý zákon pohybu', back: 'F = m · a — síla se rovná součinu hmotnosti a zrychlení.', courseId: 'c3', courseName: 'Fyzika', courseColor: COLORS.green, topicId: 't6', topicName: 'Mechanika', difficulty: 'medium', successRate: 58, totalReviews: 16, lastReviewed: '2026-03-05', nextReview: '2026-03-08', createdAt: '2026-01-30' },
];

export const DEMO_EVENTS = [
    { id: 'evt-1', type: 'exam', title: 'Zkouška z Matematiky', date: '2026-03-20', courseId: 'c1', done: false, createdAt: '2026-03-01T10:00:00' },
    { id: 'evt-2', type: 'deadline', title: 'Odevzdání seminární práce', date: '2026-03-11', courseId: 'c1', done: false, createdAt: '2026-02-25T10:00:00' },
    { id: 'evt-3', type: 'deadline', title: 'Projekt — 1. milestone', date: '2026-03-18', courseId: 'c3', done: false, createdAt: '2026-02-20T10:00:00' },
    { id: 'evt-4', type: 'todo', title: 'Opakovat 20 kartiček', date: '2026-03-08', courseId: null, done: false, createdAt: '2026-03-07T10:00:00' },
    { id: 'evt-5', type: 'todo', title: 'Napsat test: Derivace', date: '2026-03-08', courseId: 'c1', done: false, createdAt: '2026-03-07T10:00:00' },
    { id: 'evt-6', type: 'exam', title: 'Test z Angličtiny', date: '2026-03-14', courseId: 'c2', done: false, createdAt: '2026-03-01T10:00:00' },
    { id: 'evt-7', type: 'todo', title: 'Přečíst poznámky z Historie', date: '2026-03-09', courseId: 'c4', done: false, createdAt: '2026-03-07T10:00:00' },
    { id: 'evt-8', type: 'deadline', title: 'Registrace na zkoušku', date: '2026-03-25', courseId: 'c3', done: false, createdAt: '2026-03-01T10:00:00' },
];

// --- EVENTS ---
export const EVENT_TYPE_CONFIG = {
    exam: { label: 'Zkouška', color: COLORS.red, icon: 'exam' },
    deadline: { label: 'Deadline', color: COLORS.orange, icon: 'deadline' },
    todo: { label: 'Úkol', color: COLORS.green, icon: 'todo' },
};

// --- CARD TYPE/DIFFICULTY MAPS ---
export const TYPE_COLORS = { flashcard: COLORS.blue, test: COLORS.purple, ai: COLORS.green };
export const TYPE_LABELS = { flashcard: 'Flashcard', test: 'Test' };
export const DIFF_COLORS = { easy: COLORS.green, medium: COLORS.orange, hard: COLORS.red };
export const DIFF_LABELS = { easy: 'Lehká', medium: 'Střední', hard: 'Těžká' };

// --- CHART CONFIG ---
export const CHART_TOOLTIP_STYLE = {
    contentStyle: { background: '#1a1b23', border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, fontSize: 13 },
    itemStyle: { color: COLORS.textPrimary },
    cursor: { stroke: COLORS.borderLight },
};
export const DAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];