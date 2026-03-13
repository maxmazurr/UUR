/**
 * TipTap WikiLink Extension
 *
 * Detects `[[Topic Name]]` patterns inline as the user types and converts
 * them into styled, clickable inline nodes. Includes an autocomplete
 * suggestion dropdown that appears when typing `[[`.
 */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useEffect, useRef, useMemo, useCallback, forwardRef } from 'react';
import { Box, Paper, Stack, Typography, TextField } from '@mui/material';
import { Network } from 'lucide-react';

// ─── React component rendered inside the editor for each [[wiki-link]] ───
const WikiLinkNodeView = (props) => {
    const { node } = props;
    const topicName = node.attrs.topicName || '';
    const topicId = node.attrs.topicId || '';

    return (
        <NodeViewWrapper as="span" style={{ display: 'inline' }}>
            <Box
                component="span"
                contentEditable={false}
                data-topic-id={topicId}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: 'rgba(144,85,255,0.12)',
                    color: '#9055FF',
                    borderRadius: '4px',
                    px: '6px',
                    py: '1px',
                    fontWeight: 600,
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                    verticalAlign: 'baseline',
                    '&:hover': {
                        background: 'rgba(144,85,255,0.25)',
                        boxShadow: '0 0 8px rgba(144,85,255,0.25)',
                    },
                }}
            >
                {topicName}
            </Box>
        </NodeViewWrapper>
    );
};

// ─── TipTap Node Extension ───
export const WikiLinkNode = Node.create({
    name: 'wikiLink',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            topicId: { default: null },
            topicName: { default: '' },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-wiki-link]',
                getAttrs: (el) => ({
                    topicId: el.getAttribute('data-topic-id'),
                    topicName: el.getAttribute('data-topic-name') || el.textContent,
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-wiki-link': 'true',
                'data-topic-id': HTMLAttributes.topicId,
                'data-topic-name': HTMLAttributes.topicName,
                style: 'color:#9055FF;background:rgba(144,85,255,0.12);border-radius:4px;padding:1px 6px;font-weight:600;cursor:pointer;',
            }),
            HTMLAttributes.topicName || '',
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(WikiLinkNodeView);
    },

    addInputRules() {
        return [];
    },
});

// ─── WikiLink Suggestion Dropdown (rendered outside the editor) ───
export const WikiLinkSuggestion = forwardRef(({ editor, allTopics = [] }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [selectedIdx, setSelectedIdx] = useState(0);
    const dropdownRef = useRef(null);

    const filtered = useMemo(() => {
        if (!query) return allTopics.slice(0, 8);
        const q = query.toLowerCase();
        return allTopics.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.courseName?.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [query, allTopics]);

    // Listen for text input to detect `[[` trigger
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            const { state } = editor;
            const { $from } = state.selection;
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

            // Find `[[` before the cursor
            const lastOpen = textBefore.lastIndexOf('[[');
            if (lastOpen === -1) {
                setIsOpen(false);
                return;
            }

            // Check there's no `]]` after `[[`
            const afterBracket = textBefore.slice(lastOpen + 2);
            if (afterBracket.includes(']]')) {
                setIsOpen(false);
                return;
            }

            // We have an active `[[…` — extract query
            setQuery(afterBracket);
            setIsOpen(true);
            setSelectedIdx(0);

            // Calculate position (relative to editor element)
            try {
                const coords = editor.view.coordsAtPos($from.pos);
                setPosition({ top: coords.bottom + 4, left: coords.left });
            } catch {
                // fallback
            }
        };

        editor.on('update', handleUpdate);
        editor.on('selectionUpdate', handleUpdate);

        return () => {
            editor.off('update', handleUpdate);
            editor.off('selectionUpdate', handleUpdate);
        };
    }, [editor]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen || !editor) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIdx(prev => Math.min(prev + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIdx(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && filtered.length > 0) {
                e.preventDefault();
                insertWikiLink(filtered[selectedIdx]);
            } else if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, filtered, selectedIdx, editor]);

    const insertWikiLink = useCallback((topic) => {
        if (!editor) return;

        const { state } = editor;
        const { $from } = state.selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        const lastOpen = textBefore.lastIndexOf('[[');

        if (lastOpen === -1) return;

        // Calculate the absolute start position of `[[` in the document
        const startOfNode = $from.pos - $from.parentOffset;
        const deleteFrom = startOfNode + lastOpen;
        const deleteTo = $from.pos;

        editor
            .chain()
            .focus()
            .deleteRange({ from: deleteFrom, to: deleteTo })
            .insertContent({
                type: 'wikiLink',
                attrs: {
                    topicId: topic.id,
                    topicName: topic.name,
                },
            })
            .insertContent(' ')
            .run();

        setIsOpen(false);
        setQuery('');
    }, [editor]);

    if (!isOpen || !filtered.length) return null;

    return (
        <Paper
            ref={dropdownRef}
            elevation={8}
            sx={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 9999,
                minWidth: 240,
                maxWidth: 340,
                maxHeight: 280,
                overflowY: 'auto',
                borderRadius: 3,
                background: 'rgba(18,22,36,0.98)',
                border: '1px solid rgba(144,85,255,0.2)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
                py: 0.5,
            }}
        >
            <Typography sx={{ px: 1.5, py: 0.75, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Odkaz na téma
            </Typography>
            {filtered.map((topic, idx) => (
                <Stack key={topic.id} direction="row" alignItems="center" gap={1}
                    onClick={() => insertWikiLink(topic)}
                    sx={{
                        px: 1.5, py: 1, cursor: 'pointer', transition: 'background 0.15s',
                        background: idx === selectedIdx ? 'rgba(144,85,255,0.15)' : 'transparent',
                        '&:hover': { background: 'rgba(144,85,255,0.12)' },
                    }}
                >
                    <Box sx={{
                        width: 8, height: 8, borderRadius: '2px', flexShrink: 0,
                        bgcolor: topic.courseColor || '#7C6FF7',
                        boxShadow: `0 0 4px ${topic.courseColor || '#7C6FF7'}50`,
                    }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {topic.name}
                        </Typography>
                        {topic.courseName && (
                            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                {topic.courseName}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            ))}
            <Typography sx={{ px: 1.5, py: 0.5, fontSize: 10, color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', mt: 0.5 }}>
                ↑↓ navigovat · Enter vybrat · Esc zavřít
            </Typography>
        </Paper>
    );
});

WikiLinkSuggestion.displayName = 'WikiLinkSuggestion';
