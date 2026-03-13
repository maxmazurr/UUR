import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DEMO_COURSES, DEMO_CARDS, DEMO_EVENTS } from './constants';

const StudyFlowContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useStudyFlow = () => {
    const context = useContext(StudyFlowContext);
    if (!context) throw new Error('useStudyFlow must be used within a StudyFlowProvider');
    return context;
};

export const StudyFlowProvider = ({ children }) => {
    // Helper to load from localStorage
    const load = (key, fallback) => {
        const saved = localStorage.getItem(`studyflow_${key}`);
        if (!saved) return fallback;
        try { return JSON.parse(saved); } catch { return fallback; }
    };

    const [courses, setCoursesState] = useState(() => load('courses', DEMO_COURSES));
    const [cards, setCardsState] = useState(() => load('cards', DEMO_CARDS));
    const [events, setEventsState] = useState(() => load('events', DEMO_EVENTS));
    const [notes, setNotesState] = useState(() => load('notes', {}));

    // Persistence
    useEffect(() => { localStorage.setItem('studyflow_courses', JSON.stringify(courses)); }, [courses]);
    useEffect(() => { localStorage.setItem('studyflow_cards', JSON.stringify(cards)); }, [cards]);
    useEffect(() => { localStorage.setItem('studyflow_events', JSON.stringify(events)); }, [events]);
    useEffect(() => { localStorage.setItem('studyflow_notes', JSON.stringify(notes)); }, [notes]);

    // Functional update wrappers (to match the behavior I added to Zustand)
    const setCourses = useCallback((val) => {
        setCoursesState(prev => typeof val === 'function' ? val(prev) : val);
    }, []);
    const setCards = useCallback((val) => {
        setCardsState(prev => typeof val === 'function' ? val(prev) : val);
    }, []);
    const setEvents = useCallback((val) => {
        setEventsState(prev => typeof val === 'function' ? val(prev) : val);
    }, []);

    const setNote = useCallback((topicId, content) => {
        setNotesState(prev => ({ ...prev, [topicId]: content }));
    }, []);

    const getAllTopics = useCallback(() => {
        return courses.flatMap(c => 
            (c.topics || []).map(t => ({ 
                id: t.id, 
                name: t.name, 
                courseId: c.id, 
                courseName: c.name, 
                courseColor: c.color 
            }))
        );
    }, [courses]);

    const getBacklinks = useCallback((targetTopicId) => {
        const allTopics = getAllTopics();
        const backlinks = [];

        Object.entries(notes).forEach(([sourceTopicId, html]) => {
            if (sourceTopicId === targetTopicId) return;
            const searchStr = `data-topic-id="${targetTopicId}"`;
            if (html.includes(searchStr)) {
                const topic = allTopics.find(t => t.id === sourceTopicId);
                if (topic) {
                    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
                    const snippet = text.length > 100 ? text.slice(0, 100) + '...' : text;
                    backlinks.push({ topic, snippet });
                }
            }
        });
        return backlinks;
    }, [notes, getAllTopics]);

    const exportData = useCallback(() => {
        const data = { courses, cards, events, notes, version: '1.0', exportDate: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studyflow_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [courses, cards, events, notes]);

    const importData = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.courses) setCoursesState(data.courses);
                if (data.cards) setCardsState(data.cards);
                if (data.events) setEventsState(data.events);
                if (data.notes) setNotesState(data.notes);
                alert('Data úspěšně importována!');
            } catch {
                alert('Chyba při importu: Neplatný formát souboru.');
            }
        };
        reader.readAsText(file);
    }, []);

    const value = useMemo(() => ({
        courses, setCourses,
        cards, setCards,
        events, setEvents,
        notes, setNote,
        getBacklinks, getAllTopics,
        exportData, importData
    }), [courses, cards, events, notes, setCourses, setCards, setEvents, setNote, getBacklinks, getAllTopics, exportData, importData]);

    return (
        <StudyFlowContext.Provider value={value}>
            {children}
        </StudyFlowContext.Provider>
    );
};
