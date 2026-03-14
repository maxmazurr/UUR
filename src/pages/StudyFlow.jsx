import { AppSidebar } from '../studyflow/components/AppSidebar';
import { DashboardView } from '../studyflow/components/DashboardView';
import { AppTopBar } from '../studyflow/components/AppTopBar';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    orbFloat1Anim, orbFloat2Anim, orbFloat3Anim,
    DEMO_COURSES, DEMO_CARDS, DEMO_EVENTS, TOTAL_DAILY,
} from '../studyflow/constants';
import { COLORS, HIDE_SCROLLBAR } from "../styles";
import { TopicView } from '../studyflow/components/TopicView';
import { today as getToday } from '../studyflow/utils/date';
import { PoznamkyView } from '../studyflow/components/TopicComponents';
import { KartičkyView, TestyView } from '../studyflow/components/StudyViews';
import { StatistikyView } from '../studyflow/components/StatistikyView';
import { PlanovacView } from '../studyflow/components/PlanovacView';
import { ZenMode } from '../studyflow/components/ZenMode';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { StudyFlowProvider, useStudyFlow } from '../studyflow/StudyFlowContext';
import { ErrorBoundary } from '../studyflow/components/ErrorBoundary';

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
        notes, 
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

    const currentDone = useMemo(() => {
        const today = getToday();
        const reviewsToday = cards.filter(c => c.lastReviewed === today).length;
        // Count significant note updates (simple proxy: word count or just entry count)
        const notesCount = notes ? Object.values(notes).filter(n => n.updatedAt === today).length : 0;
        
        return reviewsToday + (notesCount * 3); // Notes count for more 'progress'
    }, [cards, notes]);

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
        const todayStr = getToday();
        const items = [];
        courses.forEach(c => {
            items.push({ type: 'courses', label: c.name, subtitle: c.description || '' });
            (c.topics || []).forEach(t => {
                const noteHtml = notes[t.id] || '';
                const noteText = noteHtml.replace(/<[^>]*>/g, ' '); 
                items.push({ 
                    type: 'notes', label: t.name, subtitle: c.name, searchText: noteText,
                    _course: c, _topic: t 
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
                _card: card
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

    const handleRenameCourse = useCallback((courseId, newName) => {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, name: newName } : c));
    }, [setCourses]);

    const handleDeleteCourse = useCallback((courseId) => {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setCards(prev => prev.filter(c => c.courseId !== courseId));
    }, [setCourses, setCards]);

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
        setCards(prev => prev.filter(c => c.topicId !== topicId));
        if (openTopic?.topic?.id === topicId) setOpenTopic(null);
    }, [setCourses, setCards, openTopic]);

    const handleMoveTopic = useCallback((sourceCourseId, targetCourseId, topicId, targetIdx) => {
        setCourses(prev => {
            let topic = null;
            const updated = prev.map(c => {
                if (c.id === sourceCourseId) {
                    const existing = (c.topics || []).find(t => t.id === topicId);
                    if (existing) topic = existing;
                    return { ...c, topics: (c.topics || []).filter(t => t.id !== topicId) };
                }
                return c;
            });
            if (!topic) return prev;
            return updated.map(c => {
                if (c.id === targetCourseId) {
                    const newTopics = [...(c.topics || [])];
                    newTopics.splice(targetIdx, 0, topic);
                    return { ...c, topics: newTopics };
                }
                return c;
            });
        });
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
            setOpenTopic({ courseId: item._course.id, course: item._course, topic: item._topic, tab: 0 });
            setActiveNav('Poznámky');
        } else if (item.type === 'cards' && item._card) {
            const cr = courses.find(c => c.id === item._card.courseId);
            const tp = cr?.topics?.find(t => t.id === item._card.topicId);
            if (cr && tp) setOpenTopic({ courseId: cr.id, course: cr, topic: tp, tab: 1 });
            setActiveNav('Kartičky');
        } else if (item.type === 'tests' && item._card) {
            const cr = courses.find(c => c.id === item._card.courseId);
            const tp = cr?.topics?.find(t => t.id === item._card.topicId);
            if (cr && tp) setOpenTopic({ courseId: cr.id, course: cr, topic: tp, tab: 2 });
            setActiveNav('Testy');
        } else if (item.type === 'courses') {
            setActiveNav('Poznámky');
        }
        setSearchFocused(false);
        setSearchQuery('');
    }, [courses, setOpenTopic]);

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

        if (parallaxOrbRef.current) {
            parallaxOrbRef.current.style.transform = `translate(${mousePosRef.current.x * 0.05}px, ${(mousePosRef.current.y * 0.05) - (currentScroll * 0.15)}px)`;
        }

        const interpolate = (start, end, factor) => Math.round(start + (end - start) * factor);
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

        if (orbRef1.current) orbRef1.current.style.background = `rgba(${c1}, 0.4)`;
        if (orbRef2.current) orbRef2.current.style.background = `rgba(${c2}, 0.3)`;
        if (orbRef3.current) orbRef3.current.style.background = `rgba(${c3}, 0.15)`;
    }, [colorPairs]);

    useEffect(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
            handleMainScroll({ currentTarget: mainScrollRef.current });
        }
    }, [activeNav, openTopic, handleMainScroll]);

    return (
        <Stack direction="row" sx={{ height: '100vh', overflow: 'hidden', position: 'relative', bgcolor: COLORS.bgPrimary, color: COLORS.textPrimary, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
            <AppSidebar 
                sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
                activeNav={activeNav} setActiveNav={setActiveNav} 
                setOpenTopic={setOpenTopic} courses={courses} 
                cards={cards} events={events} topicStats={topicStats} 
                currentDone={currentDone} TOTAL_DAILY={TOTAL_DAILY} 
                dailyPercent={dailyPercent} 
                handleRenameCourse={handleRenameCourse} handleDeleteCourse={handleDeleteCourse} 
                handleRenameTopic={handleRenameTopic} handleDeleteTopic={handleDeleteTopic} 
                handleMoveTopic={handleMoveTopic} exportData={exportData} importData={importData} 
            />

            <Stack sx={{ flex: 1, height: '100vh', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <Box ref={parallaxOrbRef} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, willChange: 'transform', transition: 'transform 0.1s ease-out' }}>
                        <Box ref={orbRef1} sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.55, mixBlendMode: 'screen', pointerEvents: 'none', width: '65vw', height: '65vw', background: `${COLORS.primary}66`, top: '-15%', left: '-10%', willChange: 'transform', animation: `${orbFloat1Anim} 20s ease-in-out infinite alternate` }} />
                        <Box ref={orbRef2} sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', pointerEvents: 'none', width: '60vw', height: '60vw', background: `${COLORS.secondary}4d`, bottom: '-20%', right: '-15%', willChange: 'transform', animation: `${orbFloat2Anim} 24s ease-in-out infinite alternate-reverse`, opacity: 0.45, mixBlendMode: 'screen' }} />
                        <Box ref={orbRef3} sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.55, mixBlendMode: 'screen', pointerEvents: 'none', width: '50vw', height: '50vw', background: `${COLORS.accent}26`, top: '30%', left: '30%', willChange: 'transform', animation: `${orbFloat3Anim} 28s linear infinite` }} />
                    </Box>
                </Box>

                <AppTopBar 
                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
                    searchFocused={searchFocused} setSearchFocused={setSearchFocused} 
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
                    filteredItems={filteredItems} handleSearchItemClick={handleSearchItemClick} 
                    searchInputRef={searchInputRef} searchBlurTimerRef={searchBlurTimerRef} 
                    notifOpen={notifOpen} setNotifOpen={setNotifOpen} 
                />

                <Box ref={mainScrollRef} component="main" sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', ...HIDE_SCROLLBAR, position: 'relative', zIndex: 10, px: { xs: 1.5, sm: 2.5, md: 4, lg: 6 }, py: { xs: 2, sm: 3, md: 4 }, pb: 12 }} onScroll={handleMainScroll}>
                <ErrorBoundary>
                    {openTopic ? (
                        <TopicView
                            key={`${openTopic.courseId}-${openTopic.topic?.id}`}
                            course={courses.find(c => c.id === openTopic.courseId) || openTopic.course}
                            topic={openTopic.topic}
                            initialTab={openTopic.tab || 0}
                            initialWizard={openTopic.wizard || null}
                            onOpenTopic={(cr, t) => setOpenTopic({ courseId: cr.id, course: cr, topic: t, tab: 0 })}
                            onBack={() => setOpenTopic(null)} />
                    ) : activeNav === 'Poznámky' ? (
                        <PoznamkyView onOpenTopic={(course, topic) => setOpenTopic({ courseId: course.id, course, topic, tab: 0 })} />
                    ) : activeNav === 'Kartičky' ? (
                        <KartičkyView 
                            onStartZen={(customCards) => { setZenCards(customCards || null); setShowZen(true); }} 
                            onOpenTopic={(courseId, topicId) => {
                                const course = courses.find(c => c.id === courseId);
                                const topic = course?.topics?.find(t => t.id === topicId);
                                if (course && topic) setOpenTopic({ courseId, course, topic, tab: 1 });
                            }} 
                        />
                    ) : activeNav === 'Testy' ? (
                        <TestyView 
                            onStartZen={(customCards) => { setZenCards(customCards || null); setShowZen(true); }} 
                            onOpenTopic={(courseId, topicId) => {
                                const course = courses.find(c => c.id === courseId);
                                const topic = course?.topics?.find(t => t.id === topicId);
                                if (course && topic) setOpenTopic({ courseId, course, topic, tab: 2 });
                            }} 
                        />
                    ) : activeNav === 'Statistiky' ? (
                        <StatistikyView />
                    ) : activeNav === 'Plánovač' ? (
                        <PlanovacView />
                    ) : (
                        <DashboardView 
                            TOTAL_DAILY={TOTAL_DAILY}
                            currentDone={currentDone}
                            dailyPercent={dailyPercent}
                            tipFlipped={tipFlipped}
                            setTipFlipped={setTipFlipped}
                            tipStatus={tipStatus}
                            setTipStatus={setTipStatus}
                            setShowZen={setShowZen}
                            setZenCards={setZenCards}
                            setOpenTopic={setOpenTopic}
                            setActiveNav={setActiveNav}
                            events={events}
                            setEvents={setEvents}
                            courses={courses}
                            completedCards={completedCards}
                            toggleCard={toggleCard}
                            heatmapData={heatmapData}
                        />
                    )}
                </ErrorBoundary>
                </Box>
            </Stack>

            {showZen && <ZenMode specificCards={zenCards} onClose={() => { setShowZen(false); setZenCards(null); }} />}
        </Stack>
    );
}
