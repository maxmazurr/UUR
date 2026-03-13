import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import {
    Dialog, DialogTitle, DialogContent,
    TextField, Button, IconButton, Typography, Stack, Paper, Chip,
} from '@mui/material';
import { Network, X, Save, Clock } from 'lucide-react';
import {
    RichTextEditor,
    MenuControlsContainer,
    MenuSelectHeading,
    MenuDivider,
    MenuButtonBold,
    MenuButtonItalic,
    MenuButtonStrikethrough,
    MenuButtonBulletedList,
    MenuButtonOrderedList,
    MenuButtonBlockquote,
    MenuButtonCode,
    MenuButtonCodeBlock,
    MenuButtonEditLink,
    MenuButtonHorizontalRule,
    MenuButtonUndo,
    MenuButtonRedo,
    MenuButtonAddTable,
    MenuButtonHighlightToggle,
    LinkBubbleMenu,
    LinkBubbleMenuHandler,
    TableBubbleMenu,
    TableImproved,
    useRichTextEditorContext,
} from 'mui-tiptap';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import { WikiLinkNode, WikiLinkSuggestion } from './WikiLinkExtension';

const TIPTAP_EXTENSIONS = [
    StarterKit.configure({
        codeBlock: {
            HTMLAttributes: {
                class: 'code-block',
            },
        },
    }),
    Link.configure({ openOnClick: false, autolink: true }),
    LinkBubbleMenuHandler,
    TableImproved.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Highlight,
    WikiLinkNode,
];

export const TopicLinkButton = ({ allTopics }) => {
    const editor = useRichTextEditorContext();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return allTopics;
        const q = search.toLowerCase();
        return allTopics.filter(t => t.name.toLowerCase().includes(q) || t.courseName.toLowerCase().includes(q));
    }, [allTopics, search]);

    const handleSelect = (topic) => {
        if (editor) {
            editor.chain().focus()
                .insertContent({
                    type: 'wikiLink',
                    attrs: {
                        topicId: topic.id,
                        topicName: topic.name,
                    },
                })
                .insertContent(' ')
                .run();
        }
        setOpen(false);
        setSearch('');
    };

    if (!allTopics?.length) return null;

    return (
        <>
            <IconButton size="small" onClick={() => setOpen(true)} sx={{ color: 'text.secondary', '&:hover': { color: '#9055FF' } }} title="Odkaz na téma [[…]]">
                <Network size={18} />
            </IconButton>
            <Dialog open={open} onClose={() => { setOpen(false); setSearch(''); }} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } } }}>
                <DialogTitle sx={{ pb: 1 }}>Odkaz na téma</DialogTitle>
                <DialogContent>
                    <TextField fullWidth size="small" placeholder="Hledat téma..." value={search}
                        onChange={e => setSearch(e.target.value)} autoFocus
                        sx={{ mb: 2, mt: 0.5 }} />
                    <Stack gap={0.5} sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {filtered.map(t => (
                            <Paper key={t.id} onClick={() => handleSelect(t)} elevation={0}
                                sx={{
                                    p: 1.5, cursor: 'pointer', borderRadius: 2, border: '1px solid transparent',
                                    '&:hover': { background: 'rgba(144,85,255,0.08)', borderColor: 'rgba(144,85,255,0.2)' }
                                }}>
                                <Typography fontSize={14} fontWeight={600}>{t.name}</Typography>
                                <Typography fontSize={12} color="text.secondary">{t.courseName}</Typography>
                            </Paper>
                        ))}
                        {filtered.length === 0 && (
                            <Typography color="text.secondary" fontSize={13} textAlign="center" py={3}>Nic nenalezeno</Typography>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};

// ─── Save status indicator ───
const SaveIndicator = ({ status }) => (
    <Stack direction="row" alignItems="center" gap={0.5}
        sx={{
            position: 'absolute', bottom: 12, right: 16, zIndex: 20,
            opacity: status === 'idle' ? 0 : 1,
            transition: 'opacity 0.3s',
        }}
    >
        {status === 'saving' && (
            <>
                <Clock size={11} style={{ color: '#fb923c' }} />
                <Typography sx={{ fontSize: 10, color: '#fb923c', fontWeight: 500 }}>Ukládání...</Typography>
            </>
        )}
        {status === 'saved' && (
            <>
                <Save size={11} style={{ color: '#4ade80' }} />
                <Typography sx={{ fontSize: 10, color: '#4ade80', fontWeight: 500 }}>Uloženo</Typography>
            </>
        )}
    </Stack>
);

import { useStudyFlow } from '../StudyFlowContext';

export const NoteEditor = ({ topicId, allTopics, onNavigateToTopic }) => {
    const { notes, setNote } = useStudyFlow();
    const rteRef = useRef(null);
    const saveTimerRef = useRef(null);
    const hideSaveRef = useRef(null);
    const lastHtmlRef = useRef('');
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
    const [editorInstance, setEditorInstance] = useState(null);

    const initialContent = useMemo(() => {
        return notes[topicId] || '';
    }, [topicId, notes]);

    const handleUpdate = useCallback(({ editor }) => {
        const html = editor.getHTML();
        lastHtmlRef.current = html;

        // Show "saving" indicator
        setSaveStatus('saving');
        clearTimeout(hideSaveRef.current);

        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            setNote(topicId, html);
            setSaveStatus('saved');
            hideSaveRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
        }, 400);
    }, [topicId, setNote]);

    // Flush save on unmount / topic change
    useEffect(() => {
        return () => {
            clearTimeout(saveTimerRef.current);
            clearTimeout(hideSaveRef.current);
            if (lastHtmlRef.current) {
                setNote(topicId, lastHtmlRef.current);
            }
        };
    }, [topicId, setNote]);

    // Capture the editor instance for the suggestion dropdown
    const handleCreate = useCallback(({ editor }) => {
        setEditorInstance(editor);
    }, []);

    // Ctrl+Click on wiki-link nodes → navigate
    const handleEditorClick = useCallback((e) => {
        if (e.ctrlKey || e.metaKey) {
            // Check for wiki-link node-view click
            const wikiEl = e.target.closest('[data-topic-id]');
            if (wikiEl) {
                e.preventDefault();
                const tid = wikiEl.getAttribute('data-topic-id');
                if (tid) onNavigateToTopic?.(tid);
                return;
            }
            // Fallback: legacy <a href="#topic:…"> links
            const link = e.target.closest('a[href^="#topic:"]');
            if (link) {
                e.preventDefault();
                const tid = link.getAttribute('href').replace('#topic:', '');
                onNavigateToTopic?.(tid);
            }
        }
    }, [onNavigateToTopic]);

    return (
        <Box sx={{ position: 'relative' }}>

            <Box onClick={handleEditorClick} sx={{
                width: '100%',
                position: 'relative',
                '& .MuiTiptap-RichTextField-root': {
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.02)',
                },
                '& .MuiTiptap-RichTextContent-root .ProseMirror': {
                    minHeight: 360,
                    px: 3,
                    py: 2,
                },
                '& .MuiTiptap-MenuBar-root': {
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px 12px 0 0',
                },
                // Legacy topic link styling (for backward compat)
                '& a[href^="#topic:"]': {
                    color: '#9055FF',
                    background: 'rgba(144,85,255,0.12)',
                    borderRadius: '4px',
                    px: '4px',
                    py: '1px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.15s',
                    '&:hover': { background: 'rgba(144,85,255,0.25)' },
                },
                // Table styling
                '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    my: 2,
                },
                '& th, & td': {
                    border: '1px solid rgba(255,255,255,0.12)',
                    p: 1.5,
                    minWidth: 80,
                },
                '& th': {
                    background: 'rgba(144,85,255,0.08)',
                    fontWeight: 700,
                },
                // Highlight styling
                '& mark': {
                    background: 'rgba(250,204,21,0.3)',
                    color: 'inherit',
                    borderRadius: '2px',
                    px: '2px',
                },
                // Code block styling
                '& pre': {
                    background: 'rgba(0,0,0,0.6) !important',
                    color: '#e2e8f0',
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    padding: '2rem 1.25rem 1.25rem 1.25rem !important',
                    borderRadius: '12px !important',
                    margin: '1.5rem 0 !important',
                    border: '1px solid rgba(144,85,255,0.2) !important',
                    overflowX: 'auto',
                    position: 'relative',
                    '&::before': {
                        content: '"KÓD"',
                        position: 'absolute',
                        top: '8px',
                        left: '12px',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: 'rgba(144,85,255,0.6)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }
                },
                '& pre code': {
                    color: 'inherit',
                    padding: '0 !important',
                    background: 'none !important',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                },
                // Inline code styling
                '& code:not(pre code)': {
                    background: 'rgba(144,85,255,0.15)',
                    color: '#9055FF',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    fontWeight: 600,
                },
            }}>
                <RichTextEditor
                    ref={rteRef}
                    extensions={TIPTAP_EXTENSIONS}
                    content={initialContent}
                    editorDependencies={[topicId]}
                    onUpdate={handleUpdate}
                    onCreate={handleCreate}
                    renderControls={() => (
                        <MenuControlsContainer>
                            <MenuSelectHeading />
                            <MenuDivider />
                            <MenuButtonBold />
                            <MenuButtonItalic />
                            <MenuButtonStrikethrough />
                            <MenuButtonHighlightToggle />
                            <MenuDivider />
                            <MenuButtonBulletedList />
                            <MenuButtonOrderedList />
                            <MenuButtonBlockquote />
                            <MenuDivider />
                            <MenuButtonCode />
                            <MenuButtonCodeBlock />
                            <MenuButtonHorizontalRule />
                            <MenuDivider />
                            <MenuButtonAddTable />
                            <MenuDivider />
                            <MenuButtonEditLink />
                            <TopicLinkButton allTopics={allTopics} />
                            <MenuDivider />
                            <MenuButtonUndo />
                            <MenuButtonRedo />
                        </MenuControlsContainer>
                    )}
                >
                    {() => (
                        <>
                            <LinkBubbleMenu />
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextEditor>

                {/* Save status indicator */}
                <SaveIndicator status={saveStatus} />
            </Box>

            {/* Wiki-link suggestion dropdown */}
            {editorInstance && (
                <WikiLinkSuggestion editor={editorInstance} allTopics={allTopics} />
            )}
        </Box>
    );
};
