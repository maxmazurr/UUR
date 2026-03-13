import { AppSidebar } from '../studyflow/components/AppSidebar';
import { AppTopBar } from '../studyflow/components/AppTopBar';
import { HeroCard, StatCards } from '../studyflow/components/DashboardCards';
import { useState, useEffect, useRef, useMemo, useCallback, Fragment } from 'react';
import {
    Menu as MenuIcon, Search, Bell, Home, FileText, Layers, CheckSquare,
    BarChart2, Network, Settings, HelpCircle, Plus, X,
    Flame, Target, Activity, ArrowRight, Award, BookOpen, Clock,
    Frown, Smile, ChevronDown, ChevronLeft, ChevronRight, Folder, Lightbulb,
    TrendingUp, Play, Calendar, Download, Upload,
} from 'lucide-react';
import Box from '@mui/material/Box';
import {
    Button, IconButton, Typography, Stack,
    Chip, Paper, LinearProgress, TextField,
} from '@mui/material';

import {
    orbFloat1Anim, orbFloat2Anim, orbFloat3Anim, deadlineShimmerAnim,
    GLASS_PANEL, HEAT_COLORS,
    DEMO_COURSES, DEMO_CARDS, DEMO_EVENTS,
} from '../studyflow/constants';
import { COLORS, HIDE_SCROLLBAR } from '../styles';
import { FadeUp, HoloCard, NavItem, NotifItem, TreeItem, ContinueCard, CardRow, WeakCard } from '../studyflow/components/Sidebar';
import { TopicView } from '../studyflow/components/TopicView';
import { PoznamkyView, AddTopicModal } from '../studyflow/components/TopicComponents';
import { KartičkyView, TestyView } from '../studyflow/components/StudyViews';
import { StatistikyView } from '../studyflow/components/StatistikyView';
import { PlanovacView } from '../studyflow/components/PlanovacView';
import { ZenMode } from '../studyflow/components/ZenMode';



import { StudyFlowProvider, useStudyFlow } from '../studyflow/StudyFlowContext';



export default function StudyFlow() {
    return (
        <StudyFlowProvider>
            <StudyFlowContent />
        </StudyFlowProvider>
    );
}

function StudyFlowContent() {
    const { 
        courses, setCourses, 
        cards, setCards, 
        events, setEvents, 
        notes, // getAllTopics,
        exportData, importData
    } = useStudyFlow();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [tipFlipped, setTipFlipped] = useState(false);
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [completedCards, setCompletedCards] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [tipStatus, setTipStatus] = useState(null); 
    const parallaxOrbRef = useRef(null);
    const orbRef1 = useRef(null);
    const orbRef2 = useRef(null);
    const orbRef3 = useRef(null);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const scrollYRef = useRef(0);
    
    const [openTopic, setOpenTopic] = useState(null); 
    const [showZen, setShowZen] = useState(false);
    const [zenCards, setZenCards] = useState(null);
    const searchInputRef = useRef(null);
    // const [addTopicForCourse, setAddTopicForCourse] = useState(null);
    const mainScrollRef = useRef(null);
    const searchBlurTimerRef = useRef(null);

    // Initial data load if store is empty
    useEffect(() => {
        if (courses.length === 0) setCourses(DEMO_COURSES);
        if (cards.length === 0) setCards(DEMO_CARDS);
        if (events.length === 0) setEvents(DEMO_EVENTS);
    }, [courses.length, cards.length, events.length, setCourses, setCards, setEvents]);

    const topicStats = useMemo(() => {
        const map = {};
        cards.forEach(c => {
            if (!map[c.topicId]) map[c.topicId] = { flashcard: 0, test: 0 };
            if (c.type === 'flashcard') map[c.topicId].flashcard++;
            else if (c.type === 'test') map[c.topicId].test++;
        });
        return map;
    }, [cards]);

    const TOTAL_DAILY = 20;
    const BASE_DONE = 8;
    const currentDone = BASE_DONE + completedCards.length;
    const dailyPercent = Math.min(Math.round((currentDone / TOTAL_DAILY) * 100), 100);



    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                clearTimeout(searchBlurTimerRef.current);
                setSearchFocused(false);
                setNotifOpen(false);
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        const currentRef = searchBlurTimerRef.current;
        return () => clearTimeout(currentRef);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mousePosRef.current = {
                x: e.clientX - window.innerWidth / 2,
                y: e.clientY - window.innerHeight / 2,
            };
            if (parallaxOrbRef.current) {
                parallaxOrbRef.current.style.transform = `translate(${mousePosRef.current.x * 0.05}px, ${(mousePosRef.current.y * 0.05) - (scrollYRef.current * 0.15)}px)`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const allSearchItems = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const items = [];
        courses.forEach(c => {
            items.push({ type: 'courses', label: c.name, subtitle: c.description || '' });
            (c.topics || []).forEach(t => {
                const noteHtml = notes[t.id] || '';
                // Simple tag stripping for indexing
                const noteText = noteHtml.replace(/<[^>]*>/g, ' '); 
                items.push({ 
                    type: 'notes', 
                    label: t.name, 
                    subtitle: c.name, 
                    searchText: noteText,
                    _course: c, 
                    _topic: t 
                });
            });
        });
        cards.forEach(card => {
            const isFlash = card.type === 'flashcard';
            items.push({
                type: isFlash ? 'cards' : 'tests',
                label: isFlash ? card.front : card.question,
                subtitle: card.courseName,
                searchText: isFlash ? card.back : (card.options || []).map(o => o.text).join(' '),
                due: card.nextReview <= todayStr,
            });
        });
        return items;
    }, [courses, cards, notes]);

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [
            ...allSearchItems.filter(i => i.type === 'courses').slice(0, 4),
            ...allSearchItems.filter(i => i.due).slice(0, 4),
        ];
        return allSearchItems.filter(i =>
            i.label.toLowerCase().includes(q) ||
            i.subtitle?.toLowerCase().includes(q) ||
            i.searchText?.toLowerCase().includes(q)
        ).slice(0, 25);
    }, [searchQuery, allSearchItems]);

    const toggleCard = useCallback((title) => {
        setCompletedCards(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
    }, []);

    // ─── Tree management callbacks ───
    const handleRenameCourse = useCallback((courseId, newName) => {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, name: newName } : c));
    }, [setCourses]);

    const handleDeleteCourse = useCallback((courseId) => {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        // Also remove cards belonging to that course
        setCards(prev => prev.filter(c => c.courseId !== courseId));
    }, [setCourses, setCards]);

    // const handleAddTopicFromTree = useCallback((courseId) => {
    //     setAddTopicForCourse(courseId);
    // }, []);

    // const handleSaveNewTopic = useCallback((topic) => {
    //     if (!addTopicForCourse) return;
    //     setCourses(prev => prev.map(c =>
    //         c.id === addTopicForCourse
    //             ? { ...c, topics: [...(c.topics || []), topic] }
    //             : c
    //     ));
    //     setAddTopicForCourse(null);
    // }, [addTopicForCourse, setCourses]);

    const handleRenameTopic = useCallback((courseId, topicId, newName) => {
        setCourses(prev => prev.map(c =>
            c.id === courseId
                ? { ...c, topics: (c.topics || []).map(t => t.id === topicId ? { ...t, name: newName } : t) }
                : c
        ));
    }, [setCourses]);

    const handleDeleteTopic = useCallback((courseId, topicId) => {
        setCourses(prev => prev.map(c =>
            c.id === courseId
                ? { ...c, topics: (c.topics || []).filter(t => t.id !== topicId) }
                : c
        ));
        // Also remove cards belonging to that topic
        setCards(prev => prev.filter(c => c.topicId !== topicId));
        // Close topic view if viewing the deleted topic
        if (openTopic?.topic?.id === topicId) setOpenTopic(null);
    }, [setCourses, setCards, openTopic]);

    const handleMoveTopic = useCallback((sourceCourseId, targetCourseId, topicId, targetIdx) => {
        setCourses(prev => {
            let topic = null;
            // Remove from source
            const updated = prev.map(c => {
                if (c.id === sourceCourseId) {
                    const existing = (c.topics || []).find(t => t.id === topicId);
                    if (existing) topic = existing;
                    return { ...c, topics: (c.topics || []).filter(t => t.id !== topicId) };
                }
                return c;
            });
            if (!topic) return prev;
            // Insert into target at targetIdx
            return updated.map(c => {
                if (c.id === targetCourseId) {
                    const newTopics = [...(c.topics || [])];
                    newTopics.splice(targetIdx, 0, topic);
                    return { ...c, topics: newTopics };
                }
                return c;
            });
        });
        // Update card references if moved to a different course
        if (sourceCourseId !== targetCourseId) {
            const targetCourse = courses.find(c => c.id === targetCourseId);
            if (targetCourse) {
                setCards(prev => prev.map(card =>
                    card.topicId === topicId
                        ? { ...card, courseId: targetCourseId, courseName: targetCourse.name, courseColor: targetCourse.color }
                        : card
                ));
            }
        }
    }, [setCourses, setCards, courses]);

    const handleSearchItemClick = useCallback((item) => {
        if (item.type === 'notes' && item._course && item._topic) {
            setOpenTopic({ courseId: item._course.id, course: item._course, topic: item._topic });
            setActiveNav('Poznámky');
        } else if (item.type === 'courses') {
            setActiveNav('Poznámky');
        } else if (item.type === 'cards') {
            setActiveNav('Kartičky');
        } else {
            setActiveNav('Testy');
        }
        setSearchFocused(false);
        setSearchQuery('');
    }, []);

    // const scrollRef = useRef(null);
    // const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    // const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

    const heatmapData = useMemo(() => Array.from({ length: 14 }, () =>
        Array.from({ length: 7 }, () => Math.random() > 0.5 ? Math.floor(Math.random() * 4 + 1) : 0)
    ), []);

    const colorPairs = useMemo(() => [
        { c1: [144, 85, 255], c2: [19, 226, 218], c3: [124, 111, 247] },
        { c1: [214, 255, 127], c2: [0, 179, 204], c3: [48, 190, 150] },
        { c1: [237, 123, 132], c2: [144, 85, 255], c3: [255, 202, 201] },
        { c1: [64, 37, 101], c2: [48, 190, 150], c3: [19, 226, 218] }
    ], []);

    const handleMainScroll = useCallback((e) => {
        const el = e.currentTarget;
        const currentScroll = el.scrollTop;
        scrollYRef.current = currentScroll;

        // Обновляем параллакс орбы напрямую в DOM
        if (parallaxOrbRef.current) {
            parallaxOrbRef.current.style.transform = `translate(${mousePosRef.current.x * 0.05}px, ${(mousePosRef.current.y * 0.05) - (currentScroll * 0.15)}px)`;
        }

        const interpolate = (start, end, factor) => Math.round(start + (end - start) * factor);
        
        // Use a fixed distance for color transition (e.g., 2000px) 
        // to prevent hyper-active color changes on short pages.
        const transitionDistance = 2400; 
        let progress = Math.max(0, Math.min(1, currentScroll / transitionDistance));
        
        const numSegments = colorPairs.length - 1;
        let segment = Math.floor(progress * numSegments);
        if (segment >= numSegments) segment = numSegments - 1;
        const localProgress = (progress * numSegments) - segment;
        const start = colorPairs[segment];
        const end = colorPairs[segment + 1];

        const c1 = `${interpolate(start.c1[0], end.c1[0], localProgress)}, ${interpolate(start.c1[1], end.c1[1], localProgress)}, ${interpolate(start.c1[2], end.c1[2], localProgress)}`;
        const c2 = `${interpolate(start.c2[0], end.c2[0], localProgress)}, ${interpolate(start.c2[1], end.c2[1], localProgress)}, ${interpolate(start.c2[2], end.c2[2], localProgress)}`;
        const c3 = `${interpolate(start.c3[0], end.c3[0], localProgress)}, ${interpolate(start.c3[1], end.c3[1], localProgress)}, ${interpolate(start.c3[2], end.c3[2], localProgress)}`;

        // Обновляем цвета орбов напрямую в DOM
        if (orbRef1.current) orbRef1.current.style.background = `rgba(${c1}, 0.4)`;
        if (orbRef2.current) orbRef2.current.style.background = `rgba(${c2}, 0.3)`;
        if (orbRef3.current) orbRef3.current.style.background = `rgba(${c3}, 0.15)`;
    }, [colorPairs]);

    // Reset scroll on view change
    useEffect(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
            // Force color update at top
            handleMainScroll({ currentTarget: mainScrollRef.current });
        }
    }, [activeNav, openTopic, handleMainScroll]);

    return (
        <Stack direction="row" sx={{ height: '100vh', overflow: 'hidden', position: 'relative', bgcolor: '#0F1117', color: '#F0F2F8', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>


            {/* ═══════════════ SIDEBAR & LAYOUT ═══════════════ */}
            <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeNav={activeNav} setActiveNav={setActiveNav} setOpenTopic={setOpenTopic} courses={courses} cards={cards} events={events} topicStats={topicStats} currentDone={currentDone} TOTAL_DAILY={TOTAL_DAILY} dailyPercent={dailyPercent} handleRenameCourse={handleRenameCourse} handleDeleteCourse={handleDeleteCourse} handleRenameTopic={handleRenameTopic} handleDeleteTopic={handleDeleteTopic} handleMoveTopic={handleMoveTopic} exportData={exportData} importData={importData} />

            {/* ═══════════════ MAIN AREA ═══════════════ */}
            <Stack sx={{ flex: 1, height: '100vh', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <Box ref={parallaxOrbRef} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, willChange: 'transform', transition: 'transform 0.1s ease-out' }}>
                        <Box ref={orbRef1} sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.55, mixBlendMode: 'screen', pointerEvents: 'none', width: '65vw', height: '65vw', background: 'rgba(144, 85, 255, 0.4)', top: '-15%', left: '-10%', willChange: 'transform', animation: `${orbFloat1Anim} 20s ease-in-out infinite alternate` }} />
                        <Box ref={orbRef2} sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', pointerEvents: 'none', width: '60vw', height: '60vw', background: 'rgba(19, 226, 218, 0.3)', bottom: '-20%', right: '-15%', willChange: 'transform', animation: `${orbFloat2Anim} 24s ease-in-out infinite alternate-reverse`, opacity: 0.45, mixBlendMode: 'screen' }} />
                        <Box ref={orbRef3} sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.55, mixBlendMode: 'screen', pointerEvents: 'none', width: '50vw', height: '50vw', background: 'rgba(124, 111, 247, 0.15)', top: '30%', left: '30%', willChange: 'transform', animation: `${orbFloat3Anim} 28s linear infinite` }} />
                    </Box>
                </Box>

                {/* ── TOPBAR ── */}
                <AppTopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} searchFocused={searchFocused} setSearchFocused={setSearchFocused} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredItems={filteredItems} handleSearchItemClick={handleSearchItemClick} searchInputRef={searchInputRef} searchBlurTimerRef={searchBlurTimerRef} notifOpen={notifOpen} setNotifOpen={setNotifOpen} />

                {/* ── MAIN SCROLL AREA ── */}
                <Box ref={mainScrollRef} component="main" sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', ...HIDE_SCROLLBAR, position: 'relative', zIndex: 10, px: { xs: 1.5, sm: 2.5, md: 4, lg: 6 }, py: { xs: 2, sm: 3, md: 4 }, pb: 12 }} onScroll={handleMainScroll}>
                    {openTopic ? (
                        <TopicView
                            course={courses.find(c => c.id === openTopic.courseId) || openTopic.course}
                            topic={openTopic.topic}
                            onOpenTopic={(cr, t) => setOpenTopic({ courseId: cr.id, course: cr, topic: t })}
                            onBack={() => setOpenTopic(null)} />
                    ) : activeNav === 'Poznámky' ? (
                        <PoznamkyView onOpenTopic={(course, topic) => setOpenTopic({ courseId: course.id, course, topic })} />
                    ) : activeNav === 'Kartičky' ? (
                        <KartičkyView 
                            onStartZen={(customCards) => { setZenCards(customCards || null); setShowZen(true); }} 
                            onOpenTopic={(courseId, topicId) => {
                                const course = courses.find(c => c.id === courseId);
                                const topic = course?.topics?.find(t => t.id === topicId);
                                if (course && topic) setOpenTopic({ courseId, course, topic });
                            }} 
                        />
                    ) : activeNav === 'Testy' ? (
                        <TestyView 
                            onStartZen={(customCards) => { setZenCards(customCards || null); setShowZen(true); }} 
                            onOpenTopic={(courseId, topicId) => {
                                const course = courses.find(c => c.id === courseId);
                                const topic = course?.topics?.find(t => t.id === topicId);
                                if (course && topic) setOpenTopic({ courseId, course, topic });
                            }} 
                        />
                    ) : activeNav === 'Statistiky' ? (
                        <StatistikyView />
                    ) : activeNav === 'Plánovač' ? (
                        <PlanovacView />
                    ) : (
                        <Stack sx={{ maxWidth: 1140, mx: 'auto', gap: { xs: '20px', sm: '28px', md: '32px' } }}>

                            {/* ── SECTION 1: HERO ── */}
                            <HeroCard TOTAL_DAILY={TOTAL_DAILY} currentDone={currentDone} setShowZen={setShowZen} setZenCards={setZenCards} setOpenTopic={setOpenTopic} setActiveNav={setActiveNav} />

                            {/* ── SECTION 2: THREE STAT CARDS ── */}
                            <StatCards TOTAL_DAILY={TOTAL_DAILY} currentDone={currentDone} dailyPercent={dailyPercent} tipFlipped={tipFlipped} setTipFlipped={setTipFlipped} tipStatus={tipStatus} setTipStatus={setTipStatus} />

                            {/* ── SECTION 3: ACTIVITY ── */}
                            <Box component="section">
                                <FadeUp sx={{
                                    border: `1px solid ${COLORS.border}`, borderRadius: 4, p: { xs: 2, sm: '20px' },
                                    display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: { xs: 2, sm: 3 }, alignItems: 'stretch',
                                    background: COLORS.bgSecondary,
                                }}>
                                    <Stack sx={{ flex: 1, justifyContent: 'center', minWidth: 0 }}>
                                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, mb: 2 }}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${COLORS.blue}1a` }}>
                                                <Activity size={16} sx={{ color: COLORS.blue }} />
                                            </Box>
                                            <Typography variant="h2" sx={{ fontSize: '1rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 600 }}>Tvoje aktivita</Typography>
                                        </Stack>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 1, sm: 1.5 }, mb: 2 }}>
                                            <Box sx={{ borderRadius: 3, px: 2, py: 1.5, border: `1px solid ${COLORS.borderSubtle}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: COLORS.overlayDark }}>
                                                <Typography sx={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, fontWeight: 600 }}>Karet za týden</Typography>
                                                <Stack direction="row" sx={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'white', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Typography sx={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>248</Typography>
                                                    <Chip icon={<TrendingUp size={10} />} label="12%" size="small" sx={{ fontSize: '10px', fontWeight: 500, height: 'auto', py: 0.25, background: `${COLORS.green}1a`, color: COLORS.green, '& .MuiChip-icon': { color: COLORS.green, ml: 0.5 }, '& .MuiChip-label': { px: 0.5 } }} />
                                                </Stack>
                                            </Box>

                                            <Box sx={{ borderRadius: 3, px: 2, py: 1.5, border: `1px solid ${COLORS.borderSubtle}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: COLORS.overlayDark }}>
                                                <Typography sx={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, fontWeight: 600 }}>Čas učení dnes</Typography>
                                                <Stack sx={{ mt: 0.5 }}>
                                                    <Typography sx={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'white', lineHeight: 1, mb: 0.75 }}>
                                                        4<Typography component="span" sx={{ fontSize: '0.875rem', fontFamily: '"DM Sans", sans-serif', color: COLORS.textMuted }}>h</Typography> 20<Typography component="span" sx={{ fontSize: '0.875rem', fontFamily: '"DM Sans", sans-serif', color: COLORS.textMuted }}>m</Typography>
                                                    </Typography>
                                                    <Stack direction="row" sx={{ fontSize: '10px', color: COLORS.green, alignItems: 'center', gap: 0.25, fontWeight: 500 }}>
                                                        <TrendingUp size={10} /> <Typography sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>+45m oproti včerejšku</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Box>

                                            <Box sx={{ borderRadius: 3, px: 2, py: 1.5, border: `1px solid ${COLORS.borderSubtle}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: COLORS.overlayDark }}>
                                                <Typography sx={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, fontWeight: 600 }}>Úspěšnost</Typography>
                                                <Stack sx={{ mt: 0.5 }}>
                                                    <Typography sx={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'white', lineHeight: 1, mb: 0.75 }}>
                                                        85<Typography component="span" sx={{ fontSize: '0.875rem', fontFamily: '"DM Sans", sans-serif', color: COLORS.textMuted }}>%</Typography>
                                                    </Typography>
                                                    <Stack direction="row" sx={{ fontSize: '10px', color: COLORS.green, alignItems: 'center', gap: 0.25, fontWeight: 500 }}>
                                                        <TrendingUp size={10} /> <Typography sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>+5% oproti včerejšku</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </Box>

                                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, fontSize: '10px' }}>
                                            <Chip icon={<Award size={11} />} label="Týden v řadě ✓" size="small" sx={{ fontSize: '10px', fontWeight: 500, height: 'auto', py: 0.5, px: 0.5, borderRadius: 2, background: `${COLORS.green}0f`, color: COLORS.green, border: `1px solid ${COLORS.green}1f`, '& .MuiChip-icon': { color: COLORS.green, ml: 0.5 }, '& .MuiChip-label': { px: 0.5 } }} />
                                            <Chip icon={<Layers size={11} />} label="100 karet ✓" size="small" sx={{ fontSize: '10px', fontWeight: 500, height: 'auto', py: 0.5, px: 0.5, borderRadius: 2, background: `${COLORS.primary}0f`, color: COLORS.accent, border: `1px solid ${COLORS.accent}1f`, '& .MuiChip-icon': { color: COLORS.accent, ml: 0.5 }, '& .MuiChip-label': { px: 0.5 } }} />
                                            <Chip icon={<Clock size={11} />} label="Speed run ✗" size="small" title="Dokonči test za méně než 2 minuty" sx={{ fontSize: '10px', fontWeight: 500, height: 'auto', py: 0.5, px: 0.5, borderRadius: 2, cursor: 'help', background: COLORS.glassBgLight, color: COLORS.textMuted, border: `1px solid ${COLORS.borderSubtle}`, '& .MuiChip-icon': { color: COLORS.textMuted, ml: 0.5 }, '& .MuiChip-label': { px: 0.5 } }} />
                                        </Stack>
                                    </Stack>

                                    {/* Heatmap */}
                                    <Stack sx={{
                                        flexShrink: 0, justifyContent: 'center', borderRadius: 3, p: { xs: 1.5, sm: 2 },
                                        border: `1px solid ${COLORS.borderSubtle}`, width: { xs: '100%', xl: 'auto' }, overflow: 'hidden',
                                        background: COLORS.bgDialog,
                                    }}>
                                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, fontSize: '10px', color: 'var(--text-muted)' }}>
                                            <Typography sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'inherit', color: 'inherit' }}>14 týdnů</Typography>
                                            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, fontSize: '9px' }}>
                                                <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>Méně</Typography>
                                                <Stack direction="row" sx={{ gap: '2px', mx: 0.5 }}>
                                                    {[0, 1, 2, 4].map(l => <Box key={l} sx={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: HEAT_COLORS[l] }} />)}
                                                </Stack>
                                                <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>Více</Typography>
                                            </Stack>
                                        </Stack>
                                        <Stack direction="row" sx={{ gap: '3px', overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, pb: 0.5, mb: -0.5 }}>
                                            {heatmapData.map((week, i) => (
                                                <Stack key={i} sx={{ gap: '3px' }}>
                                                    {week.map((level, j) => (
                                                        <Box key={j} sx={{
                                                            width: { xs: 11, sm: 12 }, height: { xs: 11, sm: 12 }, borderRadius: '2px', cursor: 'pointer',
                                                            transition: 'all 0.2s', '&:hover': { outline: '1px solid rgba(255,255,255,0.5)' },
                                                            backgroundColor: HEAT_COLORS[level],
                                                        }} title={`${level * 5} karet`} />
                                                    ))}
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </FadeUp>
                            </Box>

                            {/* ── SECTION 3.5: TODOS, TESTS & DEADLINES ── */}
                            <Box component="section">
                                <FadeUp>
                                    <Typography variant="h2" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, fontFamily: '"Clash Display", sans-serif', fontWeight: 600, mb: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Target size={18} sx={{ color: COLORS.accent }} /> Co tě čeká
                                    </Typography>
                                </FadeUp>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: { xs: 1.5, sm: 2 } }}>
                                    {/* Ukoly -- real events */}
                                    <FadeUp delay={0}>
                                        <Box sx={{ borderRadius: 3, p: 2, height: '100%', ...GLASS_PANEL }}>
                                            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h3" sx={{ fontSize: '1rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.25, color: 'white' }}>
                                                    <Box sx={{ width: 28, height: 28, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${COLORS.green}26` }}>
                                                        <CheckSquare size={15} sx={{ color: COLORS.green }} />
                                                    </Box>
                                                    Úkoly
                                                </Typography>
                                                <Chip label={`${events.filter(e => e.type === 'todo' && !e.done).length} zbývá`} size="small" sx={{ fontSize: '10px', fontWeight: 500, height: 'auto', py: 0.25, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', '& .MuiChip-label': { px: 1 } }} />
                                            </Stack>
                                            <Stack sx={{ gap: 1 }}>
                                                {events.filter(e => e.type === 'todo').slice(0, 5).map(task => (
                                                    <Stack key={task.id} direction="row"
                                                        onClick={() => setEvents(prev => prev.map(e => e.id === task.id ? { ...e, done: !e.done } : e))}
                                                        sx={{
                                                            alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 3, cursor: 'pointer',
                                                            borderLeft: '2px solid transparent', transition: 'all 0.3s',
                                                            background: task.done ? 'transparent' : 'rgba(255,255,255,0.01)',
                                                            opacity: task.done ? 0.4 : 1,
                                                            '&:hover': task.done ? {} : { bgcolor: 'rgba(255,255,255,0.04)', borderLeftColor: '#7C6FF7' },
                                                            '&:hover .task-icon-box': task.done ? {} : { bgcolor: 'rgba(255,255,255,0.08)' },
                                                            '&:hover .task-title': task.done ? {} : { color: 'white' },
                                                            '&:hover .task-check': task.done ? {} : { opacity: 0.6 },
                                                        }}>
                                                        <Box className="task-icon-box" sx={{ p: 0.75, borderRadius: 2, transition: 'background 0.2s', bgcolor: task.done ? 'transparent' : `${COLORS.white}0a` }}>
                                                            <Layers size={15} sx={{ color: COLORS.accent }} />
                                                        </Box>
                                                        <Typography className="task-title" sx={{ fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.3s', flex: 1, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)' }}>
                                                            {task.title}
                                                        </Typography>
                                                        <Box className="task-check" sx={{ flexShrink: 0, transition: 'all 0.3s', opacity: task.done ? 1 : 0, transform: task.done ? 'scale(1.1)' : 'scale(1)' }}>
                                                            <CheckSquare size={16} sx={{ color: task.done ? COLORS.green : COLORS.textMuted }} />
                                                        </Box>
                                                    </Stack>
                                                ))}
                                                {events.filter(e => e.type === 'todo').length === 0 && (
                                                    <Typography sx={{ textAlign: 'center', py: 2, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Žádné úkoly</Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    </FadeUp>

                                    {/* Exams -- real events */}
                                    <FadeUp delay={80}>
                                        <Box sx={{ borderRadius: 3, p: 2, height: '100%', ...GLASS_PANEL }}>
                                            <Typography variant="h3" sx={{ fontSize: '1rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1.25, color: 'white' }}>
                                                <Box sx={{ width: 28, height: 28, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${COLORS.red}26` }}>
                                                    <Calendar size={15} sx={{ color: COLORS.red }} />
                                                </Box>
                                                Blížící se zkoušky
                                            </Typography>
                                            <Stack sx={{ gap: 1.25 }}>
                                                {events.filter(e => e.type === 'exam' && !e.done && e.date >= new Date().toISOString().slice(0, 10))
                                                    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map(exam => {
                                                        const daysLeft = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / 86400000));
                                                        const color = daysLeft <= 2 ? '#F87171' : daysLeft <= 7 ? '#FB923C' : '#4ADE80';
                                                        const courseName = courses.find(c => c.id === exam.courseId)?.name || '';
                                                        return (
                                                            <Stack key={exam.id} direction="row" sx={{
                                                                alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 3, borderLeft: `2px solid ${color}`,
                                                                transition: 'all 0.2s', cursor: 'pointer', background: 'rgba(255,255,255,0.01)',
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                                            }}>
                                                                <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${color}15` }}>
                                                                    <FileText size={14} sx={{ color }} />
                                                                </Box>
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</Typography>
                                                                    <Typography sx={{ fontSize: '10px', color: 'var(--text-muted)' }}>{courseName}</Typography>
                                                                </Box>
                                                                <Chip label={daysLeft === 0 ? 'Dnes' : daysLeft === 1 ? 'Zítra' : `Za ${daysLeft} dní`} size="small" sx={{
                                                                    fontSize: '11px', fontWeight: 700, flexShrink: 0, height: 'auto', py: 0.5,
                                                                    background: `${color}15`, color, border: `1px solid ${color}30`,
                                                                    ...(daysLeft <= 2 ? { animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } } } : {}),
                                                                    '& .MuiChip-label': { px: 1.25 },
                                                                }} />
                                                            </Stack>
                                                        );
                                                    })}
                                                {events.filter(e => e.type === 'exam' && !e.done && e.date >= new Date().toISOString().slice(0, 10)).length === 0 && (
                                                    <Typography sx={{ textAlign: 'center', py: 2, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Žádné nadcházející zkoušky</Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    </FadeUp>

                                    {/* Deadlines -- real events with shimmer */}
                                    <FadeUp delay={160} sx={{ gridColumn: { sm: 'span 2', lg: 'span 1' } }}>
                                        <Box sx={{ borderRadius: 3, p: 2, height: '100%', ...GLASS_PANEL }}>
                                            <Typography variant="h3" sx={{ fontSize: '1rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1.25, color: 'white' }}>
                                                <Box sx={{ width: 28, height: 28, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${COLORS.orange}26` }}>
                                                    <Clock size={15} sx={{ color: COLORS.orange }} />
                                                </Box>
                                                Deadliny
                                            </Typography>
                                            <Stack sx={{ gap: 1.5 }}>
                                                {events.filter(e => e.type === 'deadline' && !e.done && e.date >= new Date().toISOString().slice(0, 10))
                                                    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map(dl => {
                                                        const daysLeft = Math.max(0, Math.ceil((new Date(dl.date) - new Date()) / 86400000));
                                                        const color = daysLeft <= 3 ? '#F87171' : daysLeft <= 10 ? '#FB923C' : '#4ADE80';
                                                        const dateLabel = new Date(dl.date + 'T00:00:00').toLocaleDateString('cs', { day: 'numeric', month: 'long' });
                                                        return (
                                                            <Box key={dl.id} sx={{
                                                                p: 1.5, cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(15,17,23,0.5)',
                                                                position: 'relative', overflow: 'hidden', borderRadius: '12px',
                                                                '&:hover': { transform: 'scale(1.01)' },
                                                                '&::before': {
                                                                    content: '""', position: 'absolute', inset: 0, borderRadius: '12px', padding: '1px',
                                                                    background: `linear-gradient(135deg, ${color} 0%, transparent 40%, transparent 60%, ${color} 100%)`,
                                                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                                    WebkitMaskComposite: 'xor',
                                                                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                                    maskComposite: 'exclude',
                                                                    opacity: 0.35,
                                                                    animation: `${deadlineShimmerAnim} 3s ease-in-out infinite`,
                                                                },
                                                                '&:hover::before': { opacity: 0.7 },
                                                            }}>
                                                                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dl.title}</Typography>
                                                                        <Stack direction="row" sx={{ fontSize: '10px', color: 'var(--text-muted)', mt: 0.25, alignItems: 'center', gap: 0.5 }}>
                                                                            <Calendar size={9} /> <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>{dateLabel}</Typography>
                                                                        </Stack>
                                                                    </Box>
                                                                    <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1.5 }}>
                                                                        <Typography sx={{ fontSize: '1.125rem', fontFamily: 'monospace', fontWeight: 700, color }}>{daysLeft}</Typography>
                                                                        <Typography sx={{ fontSize: '9px', color: 'var(--text-muted)' }}>dní</Typography>
                                                                    </Box>
                                                                </Stack>
                                                                <Box sx={{ height: 6, borderRadius: '9999px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                                                    <Box sx={{
                                                                        height: '100%', borderRadius: '9999px',
                                                                        transition: 'width 0.6s ease',
                                                                        width: `${Math.max(5, Math.min(95, (1 - daysLeft / 30) * 100))}%`,
                                                                        background: `linear-gradient(90deg, ${color}90, ${color})`,
                                                                    }} />
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                {events.filter(e => e.type === 'deadline' && !e.done && e.date >= new Date().toISOString().slice(0, 10)).length === 0 && (
                                                    <Typography sx={{ textAlign: 'center', py: 2, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Žádné deadliny</Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    </FadeUp>
                                </Box>
                            </Box>

                            {/* ── SECTION 3.8: POKRACUJ TAM ── */}
                            <Box component="section">
                                <FadeUp delay={50} sx={{ mb: { xs: 2, sm: 2.5 } }}>
                                    <Typography variant="h2" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, fontFamily: '"Clash Display", sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Folder size={18} sx={{ color: COLORS.green }} /> Pokračuj tam, kde jsi skončil
                                    </Typography>
                                </FadeUp>

                                <Stack direction="row" sx={{
                                    gap: { xs: 1.5, sm: 2 }, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                                    py: 2, my: -2, scrollSnapType: 'x mandatory',
                                }}>
                                    {[
                                        { title: "Matematika", clr: COLORS.blue, notes: 12, tests: 2, cards: 145, date: "Dnes, 09:41", icon: <Folder sx={{ color: COLORS.blue }} />, delay: 0 },
                                        { title: "Angličtina B2", clr: COLORS.purple, notes: 5, tests: 1, cards: 320, date: "Včera", icon: <Folder sx={{ color: COLORS.purple }} />, delay: 100 },
                                        { title: "Fyzika", clr: COLORS.green, notes: 8, tests: 4, cards: 85, date: "Před 2 dny", icon: <Folder sx={{ color: COLORS.green }} />, delay: 200 },
                                        { title: "Dějepis", clr: COLORS.yellow, notes: 24, tests: 0, cards: 410, date: "Před 3 dny", icon: <Folder sx={{ color: COLORS.yellow }} />, delay: 300 },
                                    ].map((item, idx) => (
                                        <FadeUp key={idx} delay={item.delay} sx={{ width: { xs: '78vw', sm: '55vw', md: 'calc(33.333% - 0.75rem)', lg: 'calc(25% - 0.75rem)' }, flexShrink: 0, scrollSnapAlign: 'start', minHeight: 220 }}>
                                            <HoloCard item={item} />
                                        </FadeUp>
                                    ))}
                                </Stack>
                            </Box>

                            {/* ── SECTION 4: CARDS & WEAK ── */}
                            <Box component="section" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(5, 1fr)' }, gap: { xs: 2, sm: 3 } }}>

                                {/* Left: Today's cards (3/5 width) */}
                                <FadeUp sx={{ gridColumn: { lg: 'span 3' } }}>
                                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                        <Typography variant="h2" sx={{ fontSize: '1.125rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Kartičky na dnes <Chip label={TOTAL_DAILY - currentDone + completedCards.length} size="small" sx={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 500, height: 'auto', py: 0.25, background: COLORS.glassBgLight, color: COLORS.textMuted, '& .MuiChip-label': { px: 1 } }} />
                                        </Typography>
                                        <Button 
                                            onClick={() => { setZenCards(null); setShowZen(true); }}
                                            sx={{ fontSize: '0.75rem', color: COLORS.accent, textTransform: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } }}>
                                            Začít vše <ArrowRight size={13} />
                                        </Button>
                                    </Stack>

                                    {completedCards.length >= 7 ? (
                                        <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 6, px: 3, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4, background: 'rgba(255,255,255,0.01)' }}>
                                            <Typography sx={{ fontSize: '3rem', mb: 2, animation: 'bounce 3s infinite', '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } } }}>🏖️</Typography>
                                            <Typography variant="h3" sx={{ fontSize: '1.125rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 700, color: 'white', mb: 1 }}>Vše hotovo!</Typography>
                                            <Typography sx={{ fontSize: '0.875rem', color: COLORS.textMuted, textAlign: 'center', maxWidth: 320 }}>Pro dnešek máš volno. Odpočiň si nebo pokračuj v testech z jiných kurzů.</Typography>
                                        </Stack>
                                    ) : (
                                        <Stack sx={{ gap: 1.5 }}>
                                            <Stack sx={{ gap: 1 }}>
                                                <Stack direction="row" sx={{ fontSize: '0.75rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 600, mb: 1, alignItems: 'center', gap: 1, color: COLORS.red }}>
                                                    <Box sx={{ width: 20, height: 20, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${COLORS.red}1f` }}>
                                                        <Frown size={11} sx={{ color: COLORS.red }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Těžké (2)</Typography>
                                                </Stack>
                                                <CardRow title="Co je determinant matice?" color="#F87171" delay={80} completed={completedCards.includes('Co je determinant matice?')} onToggle={toggleCard} />
                                                <CardRow title="Definice limity funkce" color="#F87171" delay={140} completed={completedCards.includes('Definice limity funkce')} onToggle={toggleCard} />
                                            </Stack>

                                            <Box sx={{ height: 1, width: '100%', my: 0.5, background: 'rgba(255,255,255,0.04)' }} />

                                            <Stack sx={{ gap: 1 }}>
                                                <Stack direction="row" sx={{ fontSize: '0.75rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 600, mb: 1, alignItems: 'center', gap: 1, color: COLORS.orange }}>
                                                    <Box sx={{ width: 20, height: 20, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${COLORS.orange}1f` }}>
                                                        <Target size={11} sx={{ color: COLORS.orange }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Střední (10)</Typography>
                                                </Stack>
                                                <CardRow title="Pythagorova věta" color="#FB923C" delay={200} completed={completedCards.includes('Pythagorova věta')} onToggle={toggleCard} />
                                                <CardRow title="React useEffect hook" color="#FB923C" delay={260} completed={completedCards.includes('React useEffect hook')} onToggle={toggleCard} />
                                                <Button sx={{
                                                    width: '100%', textAlign: 'center', mt: 1, py: 1.5, fontSize: '0.75rem', fontWeight: 600, textTransform: 'none',
                                                    color: `${COLORS.white}80`, borderRadius: 3, transition: 'all 0.2s',
                                                    border: `1px dashed ${COLORS.white}1a`,
                                                    '&:hover': { color: 'white', bgcolor: `${COLORS.white}0a` },
                                                    '&:active': { transform: 'scale(0.98)' },
                                                }}>
                                                    Zobrazit dalších 8 karet <ChevronDown size={14} style={{ display: 'inline', marginLeft: 4, marginBottom: 2 }} />
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    )}
                                </FadeUp>

                                {/* Right Column: Weakest cards & Time widget (2/5 width) */}
                                <Stack sx={{ gridColumn: { lg: 'span 2' }, gap: 3 }}>

                                    {/* Weakest Cards Widget */}
                                    <FadeUp delay={100} sx={{
                                        border: '1px solid rgba(248,113,113,0.12)', borderRadius: 4, p: '20px', position: 'relative',
                                        overflow: 'hidden', height: 'fit-content', background: 'rgba(22,27,39,0.5)',
                                    }}>
                                        <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1.5, opacity: 0.05 }}>
                                            <Activity size={100} sx={{ color: COLORS.red }} />
                                        </Box>
                                        <Typography variant="h2" sx={{ fontSize: '1rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 600, color: 'white', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 10 }}>
                                            Nejslabší kartičky <Flame size={16} sx={{ color: COLORS.red }} />
                                        </Typography>

                                        <Stack sx={{ gap: 1.5, position: 'relative', zIndex: 10, mb: 3 }}>
                                            <WeakCard title="Co je to rekurze?" value={40} />
                                            <WeakCard title="Fourierova transformace" value={30} />
                                            <WeakCard title="Taylorův rozvoj" value={20} />
                                        </Stack>

                                        <Button sx={{
                                            width: '100%', py: 1.25, borderRadius: 3, fontWeight: 700, textTransform: 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontSize: '0.875rem',
                                            position: 'relative', zIndex: 10, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)' },
                                            background: `${COLORS.red}1a`, color: COLORS.red, border: `1px solid ${COLORS.red}33`, boxShadow: `0 4px 15px ${COLORS.red}26`,
                                        }}>
                                            Procvičit slabá místa <ArrowRight size={14} strokeWidth={2.5} />
                                        </Button>
                                    </FadeUp>

                                </Stack>
                            </Box>





                            {/* ── FOOTER ── */}
                            <Box component="footer" sx={{ mt: 4, pt: 3, borderTop: `1px solid ${COLORS.borderSubtle}`, textAlign: 'center' }}>
                                <Stack direction="row" sx={{ fontSize: '11px', color: COLORS.textMuted, alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Typography sx={{ background: `linear-gradient(to right, ${COLORS.accent}, ${COLORS.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: '"Clash Display", sans-serif', fontWeight: 700, fontSize: 'inherit' }}>StudyFlow</Typography>
                                    <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>•</Typography>
                                    <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>Vytvořeno s ❤️ pro lepší učení</Typography>
                                </Stack>
                            </Box>

                        </Stack>
                    )}
                </Box>
            </Stack>

            {showZen && <ZenMode specificCards={zenCards} onClose={() => { setShowZen(false); setZenCards(null); }} />}
        </Stack>
    );
}
