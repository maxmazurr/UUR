import React, { useMemo } from 'react';
import { useStudyFlow } from '../StudyFlowContext';
import { Box, Stack, Typography, Button, Chip } from '@mui/material';
import { 
    Activity, Target, CheckSquare, Calendar, Clock, 
    Layers, Award, FileText, ArrowRight, Folder, Flame, 
    Frown, Target as TargetIcon, TrendingUp, ChevronDown,
    BarChart3
} from 'lucide-react';
import { COLORS, GRADIENT_TEXT, HIDE_SCROLLBAR } from '../../styles';
import { HeroCard, StatCards } from './DashboardCards';
import { FadeUp, CardRow, WeakCard } from './SharedUI';
import { HoloCard } from './Sidebar';
import { HEAT_COLORS } from '../constants';
import { today as getToday } from '../utils/date';
import { 
    BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip as RTooltip 
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '../constants';

export const DashboardView = ({
    TOTAL_DAILY, currentDone, dailyPercent, tipFlipped, setTipFlipped,
    tipStatus, setTipStatus, setShowZen, setZenCards, setOpenTopic,
    setActiveNav, events, setEvents, courses, completedCards, toggleCard,
}) => {
    const { cards } = useStudyFlow();
    const today = getToday();
    
    const cardsForToday = useMemo(() => {
        return cards.filter(c => c.type === 'flashcard' && c.nextReview <= today).slice(0, 4);
    }, [cards, today]);

    const testsForToday = useMemo(() => {
        return cards.filter(c => c.type === 'test' && c.nextReview <= today).slice(0, 4);
    }, [cards, today]);

    const weakSpots = useMemo(() => {
        return cards
            .filter(c => c.totalReviews > 0 && (c.successRate || 0) < 60)
            .sort((a, b) => (a.successRate || 0) - (b.successRate || 0))
            .slice(0, 3);
    }, [cards]);

    return (
        <Stack sx={{ maxWidth: 1300, mx: 'auto', gap: { xs: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
            {/* HERO & MAIN STATS */}
            <HeroCard 
                TOTAL_DAILY={TOTAL_DAILY} 
                currentDone={currentDone} 
                setShowZen={setShowZen} 
                setZenCards={setZenCards} 
                setOpenTopic={setOpenTopic} 
                setActiveNav={setActiveNav} 
            />

            <StatCards 
                TOTAL_DAILY={TOTAL_DAILY} 
                currentDone={currentDone} 
                dailyPercent={dailyPercent} 
                tipFlipped={tipFlipped} 
                setTipFlipped={setTipFlipped} 
                tipStatus={tipStatus} 
                setTipStatus={setTipStatus} 
            />

            {/* AGENDA - COMPACT GRID */}
            <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 700, fontFamily: '"Clash Display", sans-serif', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Target size={22} color={COLORS.accent} /> Co tě čeká
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {/* Todos */}
                    <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: COLORS.bgSecondary, border: `1px solid ${COLORS.border}` }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25, color: COLORS.white90 }}>
                            <CheckSquare size={18} color={COLORS.green} /> Úkoly
                        </Typography>
                        <Stack gap={1}>
                            {events.filter(e => e.type === 'todo').slice(0, 3).map(task => (
                                <Stack key={task.id} direction="row" alignItems="center" gap={1.5} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: task.done ? 'transparent' : COLORS.white02, opacity: task.done ? 0.5 : 1, cursor: 'pointer' }} onClick={() => setEvents(prev => prev.map(e => e.id === task.id ? { ...e, done: !e.done } : e))}>
                                    <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: COLORS.white05, display: 'flex' }}><Layers size={16} color={COLORS.accent} /></Box>
                                    <Typography sx={{ fontSize: 14, fontWeight: 500, flex: 1, textDecoration: task.done ? 'line-through' : 'none', color: COLORS.white80 }}>{task.title}</Typography>
                                    {task.done && <CheckSquare size={16} color={COLORS.green} />}
                                </Stack>
                            ))}
                        </Stack>
                    </Box>

                    {/* Exams */}
                    <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: COLORS.bgSecondary, border: `1px solid ${COLORS.border}` }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25, color: COLORS.white90 }}>
                            <Calendar size={18} color={COLORS.red} /> Zkoušky
                        </Typography>
                        <Stack gap={1.25}>
                            {events.filter(e => e.type === 'exam' && !e.done && e.date >= getToday()).slice(0, 3).map(exam => {
                                const days = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / 86400000));
                                return (
                                    <Stack key={exam.id} direction="row" alignItems="center" gap={1.5} 
                                        onClick={() => {
                                            const cr = courses.find(c => c.id === exam.courseId);
                                            if (cr) {
                                                const tp = cr.topics?.[0]; // Fallback to first topic
                                                setOpenTopic({ courseId: cr.id, course: cr, topic: tp || cr.topics?.[0], tab: 2 });
                                            }
                                        }}
                                        sx={{ 
                                            p: 1.25, borderRadius: 2.5, 
                                            borderLeft: `3px solid ${days < 3 ? COLORS.red : COLORS.orange}`, 
                                            bgcolor: COLORS.white02,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: COLORS.white05, transform: 'translateX(4px)' }
                                        }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{exam.title}</Typography>
                                            <Typography sx={{ fontSize: 11, color: COLORS.white50, fontWeight: 500 }}>{courses.find(c => c.id === exam.courseId)?.name}</Typography>
                                        </Box>
                                        <Chip label={days === 0 ? 'Dnes' : `Za ${days} d`} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: `${COLORS.red}15`, color: COLORS.red }} />
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Box>

                    {/* Deadlines */}
                    <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: COLORS.bgSecondary, border: `1px solid ${COLORS.border}` }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25, color: COLORS.white90 }}>
                            <Clock size={18} color={COLORS.orange} /> Deadliny
                        </Typography>
                        <Stack gap={2}>
                            {events.filter(e => e.type === 'deadline' && !e.done).slice(0, 2).map(dl => {
                                const days = Math.max(0, Math.ceil((new Date(dl.date) - new Date()) / 86400000));
                                return (
                                    <Box key={dl.id} 
                                        onClick={() => {
                                            const cr = courses.find(c => c.id === dl.courseId);
                                            if (cr) {
                                                const tp = cr.topics?.[0];
                                                setOpenTopic({ courseId: cr.id, course: cr, topic: tp || cr.topics?.[0], tab: 2 });
                                            }
                                        }}
                                        sx={{ 
                                            cursor: 'pointer', p: 1, borderRadius: 2, 
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: COLORS.white05 } 
                                        }}>
                                        <Stack direction="row" justifyContent="space-between" mb={1}>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{dl.title}</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: COLORS.orange }}>{days} d</Typography>
                                        </Stack>
                                        <Box sx={{ height: 6, borderRadius: 3, bgcolor: COLORS.white05, overflow: 'hidden' }}>
                                            <Box sx={{ height: '100%', width: `${Math.max(10, 100 - days * 5)}%`, bgcolor: COLORS.orange }} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                </Box>
            </Box>

            {/* COMBINED LEARNING HUB (Activity + Continue Learning) */}
            {/* COMBINED LEARNING HUB (Activity + Continue Learning) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '380px 1fr' }, gap: 3, alignItems: 'flex-start' }}>
                <FadeUp sx={{ 
                    p: 3, borderRadius: 4, bgcolor: COLORS.bgSecondary, 
                    border: `1px solid ${COLORS.border}`, display: 'flex', 
                    flexDirection: 'column', gap: 3, height: '100%'
                }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${COLORS.blue}15`, display: 'flex' }}>
                            <Activity size={20} color={COLORS.blue} />
                        </Box>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, fontFamily: '"Clash Display", sans-serif', color: COLORS.textPrimary }}>Tvé pokroky</Typography>
                    </Stack>
                    
                    <Stack gap={2}>
                        {[
                            { label: 'Karty / týden', val: '248', trend: '+12%', color: COLORS.green, icon: <Layers size={18} /> },
                            { label: 'Čas / dnes', val: '4h 20m', trend: '+45m', color: COLORS.green, icon: <Clock size={18} /> },
                            { label: 'Úspěšnost', val: '85%', trend: '+5%', color: COLORS.green, icon: <Target size={18} /> }
                        ].map((s, i) => (
                            <Stack key={i} direction="row" alignItems="center" justifyContent="space-between" sx={{ 
                                p: 2, borderRadius: 3.5, bgcolor: COLORS.overlayDark, border: `1px solid ${COLORS.white05}`,
                                transition: 'all 0.2s', '&:hover': { bgcolor: COLORS.white05, transform: 'translateX(4px)' }
                            }}>
                                <Stack direction="row" alignItems="center" gap={2}>
                                    <Box sx={{ color: COLORS.textMuted }}>{s.icon}</Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>{s.label}</Typography>
                                        <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: '"Clash Display", sans-serif', color: COLORS.textPrimary, lineHeight: 1 }}>{s.val}</Typography>
                                    </Box>
                                </Stack>
                                <Typography sx={{ fontSize: 13, color: s.color, fontWeight: 800, bgcolor: `${s.color}15`, px: 1.5, py: 0.75, borderRadius: 2.5, border: `1px solid ${s.color}20` }}>
                                    {s.trend}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>

                    <Box sx={{ mt: 1, pt: 3, borderTop: `1px solid ${COLORS.white05}` }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: COLORS.textPrimary, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Týdenní aktivita</Typography>
                        </Box>
                        
                        <Box sx={{ height: 200, width: '100%', ml: -1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                                    data={[
                                        { day: 'Po', cards: 20, tests: 5, notes: 2 },
                                        { day: 'Út', cards: 45, tests: 12, notes: 8 },
                                        { day: 'St', cards: 35, tests: 5, notes: 5 },
                                        { day: 'Čt', cards: 65, tests: 15, notes: 10 },
                                        { day: 'Pá', cards: 40, tests: 10, notes: 5 },
                                        { day: 'So', cards: 15, tests: 2, notes: 3 },
                                        { day: 'Ne', cards: 8, tests: 1, notes: 1 }
                                    ]}
                                >
                                    <defs>
                                        <linearGradient id="barGradCards" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.9} />
                                            <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.6} />
                                        </linearGradient>
                                        <linearGradient id="barGradTests" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.9} />
                                            <stop offset="100%" stopColor={COLORS.green} stopOpacity={0.5} />
                                        </linearGradient>
                                        <linearGradient id="barGradNotes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.9} />
                                            <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.5} />
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: COLORS.textMuted, fontSize: 11, fontWeight: 700 }} 
                                        dy={10}
                                    />
                                    <RTooltip 
                                        cursor={{ fill: COLORS.white05, radius: 8 }}
                                        contentStyle={{ ...CHART_TOOLTIP_STYLE.contentStyle, padding: '10px 14px', borderRadius: '12px' }}
                                        itemStyle={{ ...CHART_TOOLTIP_STYLE.itemStyle, fontSize: '12px' }}
                                        labelStyle={{ color: COLORS.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}
                                    />
                                    <Bar 
                                        dataKey="cards" 
                                        name="Kartičky"
                                        stackId="a"
                                        fill="url(#barGradCards)" 
                                        radius={[0, 0, 8, 8]} 
                                        barSize={26}
                                        style={{ filter: 'url(#glow)' }}
                                    />
                                    <Bar 
                                        dataKey="tests" 
                                        name="Testy"
                                        stackId="a"
                                        fill="url(#barGradTests)" 
                                        radius={[0, 0, 0, 0]} 
                                        barSize={26}
                                        style={{ filter: 'url(#glow)' }}
                                    />
                                    <Bar 
                                        dataKey="notes" 
                                        name="Poznámky"
                                        stackId="a"
                                        fill="url(#barGradNotes)" 
                                        radius={[8, 8, 0, 0]} 
                                        barSize={26}
                                        style={{ filter: 'url(#glow)' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        
                        <Stack direction="row" justifyContent="center" gap={3} sx={{ mt: 1 }}>
                            {[
                                { label: 'Kartičky', color: COLORS.accent },
                                { label: 'Testy', color: COLORS.green },
                                { label: 'Poznámky', color: COLORS.orange }
                            ].map((leg, i) => (
                                <Stack key={i} direction="row" alignItems="center" gap={1}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: leg.color }} />
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase' }}>{leg.label}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                </FadeUp>

                {/* Right side: Carousel */}
                <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Folder size={18} color={COLORS.green} /> Pokračuj v učení
                        </Typography>
                        <Button size="small" sx={{ color: COLORS.textMuted, textTransform: 'none', fontSize: 12 }}>Všechny kurzy</Button>
                    </Stack>
                    
                    <Stack direction="row" gap={2.5} alignItems="stretch" sx={{ 
                        overflowX: 'auto', 
                        py: 3,
                        px: 0,
                        mx: 0,
                        mt: -2,
                        mb: -3,
                        flex: 1,
                        scrollSnapType: 'x mandatory',
                        ...HIDE_SCROLLBAR 
                    }}>
                        {[
                            { title: "Matematika", clr: COLORS.blue, notes: 12, tests: 2, cards: 145, date: "Dnes", icon: "🧮" },
                            { title: "Angličtina B2", clr: COLORS.purple, notes: 5, tests: 1, cards: 320, date: "Včera", icon: "🌍" },
                            { title: "Fyzika", clr: COLORS.green, notes: 8, tests: 4, cards: 85, date: "Před 2 dny", icon: "⚛️" },
                            { title: "Dějepis", clr: COLORS.orange, notes: 15, tests: 0, cards: 210, date: "Před 3 dny", icon: "📜" },
                            { title: "Informatika", clr: COLORS.accent, notes: 22, tests: 5, cards: 98, date: "Před týdnem", icon: "💻" }
                        ].map((item, idx) => (
                            <Box key={idx} sx={{ 
                                width: { xs: '280px', sm: 'calc(50% - 10px)', lg: 'calc((100% - 40px) / 3)' }, 
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                display: 'flex'
                            }}>
                                <HoloCard 
                                    item={item} 
                                    onOpenCards={() => {
                                        const realCourse = courses.find(c => c.name === item.title);
                                        if (realCourse && realCourse.topics?.length) {
                                            setOpenTopic({ courseId: realCourse.id, course: realCourse, topic: realCourse.topics[0], tab: 1 });
                                        } else {
                                            setActiveNav('Kartičky');
                                        }
                                    }}
                                    onOpenTests={() => {
                                        const realCourse = courses.find(c => c.name === item.title);
                                        if (realCourse && realCourse.topics?.length) {
                                            setOpenTopic({ courseId: realCourse.id, course: realCourse, topic: realCourse.topics[0], tab: 2 });
                                        } else {
                                            setActiveNav('Testy');
                                        }
                                    }}
                                />
                            </Box>
                        ))}
                    </Stack>

                    <Box sx={{ mt: 2, p: 2, borderRadius: 4, bgcolor: COLORS.bgSecondary, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${COLORS.accent}15` }}>
                            <Flame size={20} color={COLORS.accent} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Dnešní výzva</Typography>
                            <Typography sx={{ fontSize: 11, color: COLORS.textSecondary }}>Studijní maraton: Dokonči 30 kartiček bez jediné chyby pro bonus.</Typography>
                        </Box>
                        <Button variant="contained" size="small" sx={{ ml: 'auto', borderRadius: 2, textTransform: 'none', px: 2 }}>Začít</Button>
                    </Box>
                </Box>
            </Box>

            {/* CARDS, TESTS & WEAK SPOTS */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
                {/* Kartičky */}
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.blue }}>Kartičky na dnes</Typography>
                        <Button size="small" onClick={() => { setActiveNav('Kartičky'); }} sx={{ color: COLORS.blue, textTransform: 'none' }}>Více <ArrowRight size={14} /></Button>
                    </Stack>
                    
                    <Stack gap={1}>
                        {cardsForToday.length > 0 ? cardsForToday.map((c) => (
                            <CardRow 
                                key={c.id}
                                title={c.front} 
                                color={c.courseColor || COLORS.blue} 
                                completed={completedCards.includes(c.id)} 
                                onToggle={() => toggleCard(c.id)} 
                                onDetail={() => {
                                    setOpenTopic({ courseId: c.courseId, topic: { id: c.topicId, name: c.topicName }, tab: 1 });
                                }}
                            />
                        )) : (
                            <Typography variant="caption" color="text.secondary" sx={{ p: 2, textAlign: 'center', border: `1px dashed ${COLORS.white07}`, borderRadius: 2 }}>
                                Vše hotovo! Žádné kartičky k opakování.
                            </Typography>
                        )}
                    </Stack>
                </Box>

                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.purple }}>Testy na dnes</Typography>
                        <Button size="small" onClick={() => setActiveNav('Testy')} sx={{ color: COLORS.purple, textTransform: 'none' }}>Více <ArrowRight size={14} /></Button>
                    </Stack>
                    <Stack gap={1}>
                        {testsForToday.length > 0 ? testsForToday.map((t) => (
                            <CardRow 
                                key={t.id} 
                                title={t.question} 
                                color={t.courseColor || COLORS.purple} 
                                completed={completedCards.includes(t.id)} 
                                onToggle={() => toggleCard(t.id)} 
                                onDetail={() => {
                                    setOpenTopic({ courseId: t.courseId, topic: { id: t.topicId, name: t.topicName }, tab: 2 });
                                }} 
                            />
                        )) : (
                            <Typography variant="caption" color="text.secondary" sx={{ p: 2, textAlign: 'center', border: `1px dashed ${COLORS.white07}`, borderRadius: 2 }}>
                                Žádné testy k opakování.
                            </Typography>
                        )}
                    </Stack>
                </Box>

                {/* Slabá místa */}
                <FadeUp delay={100} sx={{ p: 2.5, borderRadius: 4, bgcolor: `${COLORS.bgSecondary}80`, border: `1px solid ${COLORS.red}20`, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}><Activity size={120} color={COLORS.red} /></Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Slabá místa <Flame size={16} color={COLORS.red} />
                    </Typography>
                    <Stack gap={1.5} mb={3}>
                        {weakSpots.length > 0 ? weakSpots.map((ws) => (
                            <WeakCard 
                                key={ws.id}
                                title={`${ws.question || ws.front} (${ws.type === 'test' ? 'T' : 'K'})`} 
                                value={ws.successRate || 0} 
                                onDetail={() => setActiveNav(ws.type === 'test' ? 'Testy' : 'Kartičky')} 
                            />
                        )) : (
                            <Typography variant="caption" color="text.secondary">Zatím žádná slabá místa. Jen tak dál!</Typography>
                        )}
                    </Stack>
                    <Button fullWidth onClick={() => setActiveNav('Statistiky')} sx={{ py: 1, borderRadius: 2.5, bgcolor: `${COLORS.red}15`, color: COLORS.red, fontWeight: 700, textTransform: 'none', border: `1px solid ${COLORS.red}30` }}>
                        Detailní analýza <ArrowRight size={14} />
                    </Button>
                </FadeUp>
            </Box>

            {/* FOOTER */}
            <Stack direction="row" justifyContent="center" alignItems="center" gap={1} py={4} sx={{ borderTop: `1px solid ${COLORS.white05}`, opacity: 0.5 }}>
                <Typography sx={{ ...GRADIENT_TEXT(COLORS.accent, COLORS.blue), fontWeight: 800, fontSize: 12 }}>StudyFlow</Typography>
                <Typography sx={{ fontSize: 11 }}>•</Typography>
                <Typography sx={{ fontSize: 11 }}>Efektivní učení</Typography>
            </Stack>
        </Stack>
    );
};
