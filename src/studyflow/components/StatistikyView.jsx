import { useMemo } from 'react';
import { Box, Stack, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { Flame, RotateCcw, Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '../constants';
import { useStudyFlow } from '../StudyFlowContext';
import { today as getToday } from '../utils/date';
import { SectionHeader } from './SharedUI';
import { COLORS } from '../../styles';

const srColor = (rate) => rate >= 70 ? COLORS.green : rate >= 40 ? COLORS.orange : COLORS.red;

export const StatistikyView = () => {
    const { cards, courses } = useStudyFlow();
    const {
        activityData, totalReviews, streak,
        dueToday, dueTomorrow, dueWeek,
        avgSuccess, courseProgress, weakCards,
    } = useMemo(() => {
        const todayStr = getToday();
        const d1 = new Date(); d1.setDate(d1.getDate() + 1);
        const tomorrowStr = d1.toISOString().slice(0, 10);
        const d7 = new Date(); d7.setDate(d7.getDate() + 7);
        const weekEndStr = d7.toISOString().slice(0, 10);

        const reviewsByDate = {};
        let totalReviews = 0;
        cards.forEach(c => {
            totalReviews += (c.totalReviews || 0);
            if (c.lastReviewed) {
                const type = c.type === 'test' ? 'tests' : 'cards';
                if (!reviewsByDate[c.lastReviewed]) reviewsByDate[c.lastReviewed] = { cards: 0, tests: 0, notes: 0 };
                reviewsByDate[c.lastReviewed][type] += 1;
            }
        });

        // Add some mock notes activity based on topic creation dates or current date for demo
        courses.forEach(course => {
            course.topics?.forEach(topic => {
                const date = topic.createdAt || '2026-03-01';
                if (!reviewsByDate[date]) reviewsByDate[date] = { cards: 0, tests: 0, notes: 0 };
                reviewsByDate[date].notes += 1;
            });
        });

        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            if (reviewsByDate[key] && (reviewsByDate[key].cards > 0 || reviewsByDate[key].tests > 0 || reviewsByDate[key].notes > 0)) streak++;
            else if (i > 0) break;
        }

        const activityData = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            const key = d.toISOString().slice(0, 10);
            const dayData = reviewsByDate[key] || { cards: 0, tests: 0, notes: 0 };
            return { 
                date: key.slice(5), 
                count: dayData.cards + dayData.tests + dayData.notes,
                cards: dayData.cards,
                tests: dayData.tests,
                notes: dayData.notes
            };
        });

        const dueToday = cards.filter(c => c.nextReview <= todayStr).length;
        const dueTomorrow = cards.filter(c => c.nextReview === tomorrowStr).length;
        const dueWeek = cards.filter(c => c.nextReview > tomorrowStr && c.nextReview <= weekEndStr).length;
        const avgSuccess = cards.length
            ? Math.round(cards.reduce((s, c) => s + (c.successRate || 0), 0) / cards.length)
            : 0;

        const courseProgress = courses.map(c => {
            const cc = cards.filter(card => card.courseId === c.id);
            if (!cc.length) return null;
            return {
                name: c.name, color: c.color, count: cc.length,
                success: Math.round(cc.reduce((s, card) => s + (card.successRate || 0), 0) / cc.length),
            };
        }).filter(Boolean);

        const weakCards = [...cards]
            .filter(c => (c.totalReviews || 0) > 0)
            .sort((a, b) => (a.successRate || 0) - (b.successRate || 0))
            .slice(0, 5);

        return { activityData, totalReviews, streak, dueToday, dueTomorrow, dueWeek, avgSuccess, courseProgress, weakCards };
    }, [cards, courses]);

    const statBoxes = [
        {
            label: 'Celkem aktivit', val: totalReviews,
            sub: 'bodů za celou dobu', icon: TrendingUp, color: COLORS.primary,
        },
        {
            label: 'Úspěšnost', val: `${avgSuccess}%`,
            sub: avgSuccess >= 70 ? 'Výborně!' : avgSuccess >= 40 ? 'Ujde to' : 'Je co zlepšovat',
            icon: Target, color: srColor(avgSuccess),
        },
        {
            label: 'Série dní', val: streak,
            sub: streak > 0 ? 'dní v řadě 🔥' : 'Začni dnes!',
            icon: Flame, color: COLORS.orange,
        },
        {
            label: 'K opakování dnes', val: dueToday,
            sub: dueToday > 0 ? 'čeká na tebe' : 'Vše hotovo ✓',
            icon: RotateCcw, color: dueToday > 0 ? COLORS.red : COLORS.green,
        },
    ];

    return (
        <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
            {/* Header */}
            <SectionHeader 
                title="Statistiky" 
                subtitle="Přehled tvého studia a pokroku" 
                icon={TrendingUp}
                color={COLORS.primary}
            />

            {/* Stat boxes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
                {statBoxes.map((s, i) => {
                    const SIcon = s.icon;
                    return (
                        <Paper key={i} elevation={0} sx={{
                            p: 2.5, borderRadius: 3, position: 'relative', overflow: 'hidden',
                            background: COLORS.white02, border: `1px solid ${COLORS.white07}`,
                        }}>
                            <Box sx={{
                                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                                borderRadius: '50%', background: `${s.color}10`, pointerEvents: 'none',
                            }} />
                            <SIcon size={18} color={s.color} />
                            <Typography fontSize={30} fontWeight={800} sx={{ mt: 1, color: COLORS.textPrimary, lineHeight: 1 }}>
                                {s.val}
                            </Typography>
                            <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.5 }}>{s.sub}</Typography>
                            <Typography fontSize={11} fontWeight={600} sx={{ color: s.color, mt: 0.25 }}>{s.label}</Typography>
                        </Paper>
                    );
                })}
            </Box>

            {/* Activity chart + Due schedule */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 3 }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, background: COLORS.white02, border: `1px solid ${COLORS.white07}` }}>
                    <Typography fontSize={14} fontWeight={700} mb={0.5}>Aktivita za 30 dní</Typography>
                    <Typography fontSize={11} color="text.secondary" mb={2}>Celkový počet zopakovaných karet, testů a poznámek</Typography>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.white05} />
                            <XAxis dataKey="date" tick={{ fill: COLORS.white30, fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                            <YAxis tick={{ fill: COLORS.white30, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                            <RTooltip 
                                {...CHART_TOOLTIP_STYLE} 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <Box sx={{ ...CHART_TOOLTIP_STYLE.contentStyle }}>
                                                <Typography fontSize={10} color={COLORS.white40} mb={1} fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {d.date}
                                                </Typography>
                                                <Stack gap={0.5}>
                                                    <Typography fontSize={13} color={COLORS.textPrimary} fontWeight={700} mb={0.5}>Celkem: {d.count}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                                        <Typography fontSize={12} color={COLORS.white70}>Kartičky: {d.cards}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.green }} />
                                                        <Typography fontSize={12} color={COLORS.white70}>Testy: {d.tests}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.orange }} />
                                                        <Typography fontSize={12} color={COLORS.white70}>Poznámky: {d.notes}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} fill="url(#actGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, background: COLORS.white02, border: `1px solid ${COLORS.white07}` }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                        <Calendar size={15} color={COLORS.blue} />
                        <Typography fontSize={14} fontWeight={700}>Plán opakování</Typography>
                    </Stack>
                    <Typography fontSize={11} color="text.secondary" mb={3}>Kolik karet tě čeká</Typography>
                    <Stack gap={2.5}>
                        {[
                            { label: 'Dnes', count: dueToday, color: COLORS.red },
                            { label: 'Zítra', count: dueTomorrow, color: COLORS.orange },
                            { label: 'Tento týden', count: dueWeek, color: COLORS.green },
                        ].map(({ label, count, color }) => (
                            <Stack key={label}>
                                <Stack direction="row" justifyContent="space-between" mb={0.75}>
                                    <Typography fontSize={13} color="text.secondary">{label}</Typography>
                                    <Typography fontSize={13} fontWeight={700} sx={{ color: count > 0 ? color : COLORS.white25 }}>
                                        {count} karet
                                    </Typography>
                                </Stack>
                                <LinearProgress variant="determinate"
                                    value={Math.min(100, (count / Math.max(1, cards.length)) * 200)}
                                    sx={{ height: 5, borderRadius: 99, bgcolor: COLORS.white05, '& .MuiLinearProgress-bar': { borderRadius: 99, background: color } }}
                                />
                            </Stack>
                        ))}
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${COLORS.white06}` }}>
                        <Typography fontSize={11} color="text.secondary">Celkem v plánu</Typography>
                        <Typography fontSize={12} fontWeight={700}>{dueToday + dueTomorrow + dueWeek} karet</Typography>
                    </Stack>
                </Paper>
            </Box>

            {/* Course progress + Weak cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {courseProgress.length > 0 && (
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, background: COLORS.white02, border: `1px solid ${COLORS.white07}` }}>
                        <Typography fontSize={14} fontWeight={700} mb={0.5}>Pokrok v kurzech</Typography>
                        <Typography fontSize={11} color="text.secondary" mb={2.5}>Průměrná úspěšnost karet</Typography>
                        <Stack gap={2.5}>
                            {courseProgress.map((c, i) => (
                                <Stack key={i}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                            <Typography fontSize={13} fontWeight={600}>{c.name}</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Typography fontSize={11} color="text.secondary">{c.count} karet</Typography>
                                            <Typography fontSize={13} fontWeight={800} sx={{ color: srColor(c.success), minWidth: 38, textAlign: 'right' }}>
                                                {c.success}%
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={c.success}
                                        sx={{ height: 6, borderRadius: 99, bgcolor: COLORS.white05, '& .MuiLinearProgress-bar': { borderRadius: 99, background: c.color } }}
                                    />
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                )}

                {weakCards.length > 0 && (
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, background: COLORS.white02, border: `1px solid ${COLORS.white07}` }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                            <AlertCircle size={15} color={COLORS.red} />
                            <Typography fontSize={14} fontWeight={700}>Nejslabší kartičky</Typography>
                        </Stack>
                        <Typography fontSize={11} color="text.secondary" mb={2}>Potřebují nejvíc procvičování</Typography>
                        <Stack gap={2.5}>
                            {weakCards.map((card, i) => (
                                <Stack key={i}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.75} gap={1}>
                                        <Typography fontSize={12} sx={{ flex: 1, lineHeight: 1.4 }} className="line-clamp-2">
                                            {card.front || card.question}
                                        </Typography>
                                        <Chip label={`${card.successRate || 0}%`} size="small" sx={{
                                            height: 20, fontSize: 10, fontWeight: 700, borderRadius: 1, flexShrink: 0,
                                            background: `${srColor(card.successRate || 0)}18`,
                                            color: srColor(card.successRate || 0),
                                        }} />
                                    </Stack>
                                    <LinearProgress variant="determinate" value={card.successRate || 0}
                                        sx={{ height: 3, borderRadius: 99, bgcolor: COLORS.white05, '& .MuiLinearProgress-bar': { borderRadius: 99, background: srColor(card.successRate || 0) } }}
                                    />
                                    <Typography fontSize={10} color="text.secondary" sx={{ mt: 0.5 }}>
                                        {card.courseName} · {card.topicName}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};
