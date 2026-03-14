import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import {
    Dialog, DialogTitle, DialogContent,
    TextField, Button, IconButton, Typography, Stack, Paper, Chip,
    Menu, MenuItem, Tooltip, Select,
} from '@mui/material';
import {
    Network, X, Save, Clock, Paperclip, Image as ImageIcon,
    List as ListIcon, Info, AlertTriangle, Lightbulb, BookOpen,
} from 'lucide-react';
import {
    RichTextEditor,
    MenuControlsContainer,
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
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import { WikiLinkNode, WikiLinkSuggestion } from './WikiLinkExtension';
import Image from '@tiptap/extension-image';
import { FileAttachmentNode, getFileTypeIcon } from './extensions/FileAttachmentNode';
import { FileLinkMark } from './extensions/FileLinkMark';
import { CalloutNode } from './extensions/CalloutNode';
import { NoteTOC } from './NoteTOC';
import { fileStorage, readFileAsDataURL, openFileFromDataUrl } from '../utils/fileStorage';
import { useStudyFlow } from '../StudyFlowContext';
import { COLORS } from '../../styles';

const BASE_TIPTAP_EXTENSIONS = [
    StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'code-block' } } }),
    Link.configure({ openOnClick: false, autolink: true }),
    LinkBubbleMenuHandler,
    TableImproved.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    Highlight,
    WikiLinkNode,
    Image.configure({ inline: false, allowBase64: true }),
    FileAttachmentNode,
    FileLinkMark,
    CalloutNode,
];

// ─── Heading select scoped to current block only ───
const HEADING_OPTIONS = [
    { value: 0,  label: 'Odstavec' },
    { value: 1,  label: 'Nadpis 1' },
    { value: 2,  label: 'Nadpis 2' },
    { value: 3,  label: 'Nadpis 3' },
    { value: 4,  label: 'Nadpis 4' },
];

const HeadingSelect = () => {
    const editor = useRichTextEditorContext();

    let currentLevel = 0;
    for (let l = 1; l <= 4; l++) {
        if (editor?.isActive('heading', { level: l })) { currentLevel = l; break; }
    }

    const handleChange = (e) => {
        const level = Number(e.target.value);
        if (!editor) return;
        // Collapse selection to cursor position so the command only touches
        // the single block where the cursor is, not all selected blocks.
        const anchor = editor.state.selection.anchor;
        if (level === 0) {
            editor.chain().focus().setTextSelection(anchor).setParagraph().run();
        } else {
            editor.chain().focus().setTextSelection(anchor).setHeading({ level }).run();
        }
    };

    return (
        <Select
            size="small"
            value={currentLevel}
            onChange={handleChange}
            // Stop mousedown from stealing focus/selection before onChange fires
            onMouseDown={e => e.preventDefault()}
            sx={{
                fontSize: 12, height: 28, mr: 0.5,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-select': { py: '2px', pl: 1, pr: '24px !important' },
                color: 'text.secondary',
                '&:hover': { bgcolor: COLORS.white05 },
                borderRadius: 1,
                minWidth: 96,
            }}
        >
            {HEADING_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>
                    {label}
                </MenuItem>
            ))}
        </Select>
    );
};

// ─── Topic link button ───
export const TopicLinkButton = ({ allTopics }) => {
    const editor = useRichTextEditorContext();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return allTopics;
        const q = search.toLowerCase();
        return allTopics.filter(t =>
            t.name.toLowerCase().includes(q) || t.courseName.toLowerCase().includes(q)
        );
    }, [allTopics, search]);

    const handleSelect = (topic) => {
        if (editor) {
            editor.chain().focus()
                .insertContent({ type: 'wikiLink', attrs: { topicId: topic.id, topicName: topic.name } })
                .insertContent(' ')
                .run();
        }
        setOpen(false);
        setSearch('');
    };

    if (!allTopics?.length) return null;

    return (
        <>
            <IconButton size="small" onClick={() => setOpen(true)}
                sx={{ color: 'text.secondary', '&:hover': { color: COLORS.primary } }}
                title="Odkaz na téma [[…]]">
                <Network size={18} />
            </IconButton>
            <Dialog open={open} onClose={() => { setOpen(false); setSearch(''); }} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { background: '#1a1b23', border: `1px solid ${COLORS.white10}`, borderRadius: 3 } } }}>
                <DialogTitle sx={{ pb: 1 }}>Odkaz na téma</DialogTitle>
                <DialogContent>
                    <TextField fullWidth size="small" placeholder="Hledat téma..." value={search}
                        onChange={e => setSearch(e.target.value)} autoFocus sx={{ mb: 2, mt: 0.5 }} />
                    <Stack gap={0.5} sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {filtered.map(t => (
                            <Paper key={t.id} onClick={() => handleSelect(t)} elevation={0}
                                sx={{
                                    p: 1.5, cursor: 'pointer', borderRadius: 2, border: '1px solid transparent',
                                    '&:hover': { background: `${COLORS.primary}14`, borderColor: `${COLORS.primary}33` },
                                }}>
                                <Typography fontSize={14} fontWeight={600}>{t.name}</Typography>
                                <Typography fontSize={12} color="text.secondary">{t.courseName}</Typography>
                            </Paper>
                        ))}
                        {!filtered.length && (
                            <Typography color="text.secondary" fontSize={13} textAlign="center" py={3}>
                                Nic nenalezeno
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};

// ─── Callout dropdown ───
const CALLOUT_VARIANTS = [
    { v: 'info',    Icon: Info,          label: 'Informace',  color: COLORS.blue },
    { v: 'warning', Icon: AlertTriangle, label: 'Varování',   color: COLORS.orange },
    { v: 'tip',     Icon: Lightbulb,     label: 'Tip',        color: COLORS.green },
    { v: 'example', Icon: BookOpen,      label: 'Příklad',    color: COLORS.purple },
];

const CalloutMenuButton = () => {
    const editor = useRichTextEditorContext();
    const [anchor, setAnchor] = useState(null);

    const insert = (variant) => {
        editor?.chain().focus().insertContent({
            type: 'callout',
            attrs: { variant },
            content: [{ type: 'paragraph' }],
        }).run();
        setAnchor(null);
    };

    return (
        <>
            <Tooltip title="Vložit barevný blok (callout)">
                <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}
                    sx={{ color: 'text.secondary', '&:hover': { color: COLORS.primary } }}>
                    <Info size={16} />
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
                slotProps={{ paper: { sx: { background: '#1a1b23', border: `1px solid ${COLORS.white10}`, borderRadius: 2, minWidth: 160 } } }}>
                {CALLOUT_VARIANTS.map(({ v, Icon, label, color }) => (
                    <MenuItem key={v} onClick={() => insert(v)}
                        sx={{ gap: 1.5, fontSize: 13, py: 1, '&:hover': { background: COLORS.white05 } }}>
                        <Icon size={14} color={color} />
                        <Typography fontSize={13}>{label}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

// ─── Save indicator ───
const SaveIndicator = ({ status }) => (
    <Stack direction="row" alignItems="center" gap={0.5}
        sx={{
            position: 'absolute', bottom: 12, right: 16, zIndex: 20,
            opacity: status === 'idle' ? 0 : 1,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
        }}>
        {status === 'saving' && (
            <>
                <Clock size={11} style={{ color: COLORS.orange }} />
                <Typography sx={{ fontSize: 10, color: COLORS.orange, fontWeight: 500 }}>Ukládání...</Typography>
            </>
        )}
        {status === 'saved' && (
            <>
                <Save size={11} style={{ color: COLORS.green }} />
                <Typography sx={{ fontSize: 10, color: COLORS.green, fontWeight: 500 }}>Uloženo</Typography>
            </>
        )}
    </Stack>
);

// ─── Attachment list (non-image files stored in IndexedDB) ───
const AttachmentPanel = ({ topicId, refreshKey }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fileStorage.getByTopic(topicId).then(setFiles).catch(() => {});
    }, [topicId, refreshKey]);

    if (!files.length) return null;

    const handleDelete = async (id) => {
        await fileStorage.delete(id);
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <Box sx={{ px: 1.5, py: 1, borderTop: `1px solid ${COLORS.white06}`, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Typography fontSize={10} sx={{ width: '100%', color: COLORS.white25, mb: 0.25 }}>
                Přílohy:
            </Typography>
            {files.map(f => (
                <Chip key={f.id}
                    icon={getFileTypeIcon(f.mimeType, 12)}
                    label={f.name}
                    size="small"
                    onDelete={() => handleDelete(f.id)}
                    sx={{
                        fontSize: 11, height: 24,
                        background: COLORS.blue08, color: COLORS.blue,
                        border: `1px solid ${COLORS.blue20}`,
                        '& .MuiChip-icon': { color: COLORS.blue, ml: 0.5 },
                        '& .MuiChip-deleteIcon': { color: COLORS.blue, fontSize: 13, '&:hover': { color: COLORS.red } },
                    }}
                />
            ))}
        </Box>
    );
};

// ─── Word count footer ───
const WordCountFooter = ({ editor, showTOC, onToggleTOC }) => {
    const words = useMemo(() => {
        const text = editor?.state.doc.textContent || '';
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }, [editor?.state.doc]);

    const readMin = Math.max(1, Math.round(words / 200));

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between"
            sx={{ px: 1.5, py: 0.5, borderTop: `1px solid ${COLORS.white06}` }}>
            <Typography fontSize={10} sx={{ color: COLORS.white25 }}>
                {words} slov · {readMin} min čtení
            </Typography>
            <Tooltip title={showTOC ? 'Skrýt obsah' : 'Zobrazit obsah (nadpisy)'}>
                <IconButton size="small" onClick={onToggleTOC}
                    sx={{ color: showTOC ? COLORS.primary : COLORS.white30, p: 0.25, '&:hover': { color: COLORS.primary } }}>
                    <ListIcon size={13} />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

// ─── Main NoteEditor ───
export const NoteEditor = ({ topicId, allTopics, onNavigateToTopic }) => {
    const { notes, setNote } = useStudyFlow();

    // Refs
    const rteRef = useRef(null);
    const saveTimerRef = useRef(null);
    const hideSaveRef = useRef(null);
    const lastHtmlRef = useRef('');
    const editorRef = useRef(null);           // stable editor access in callbacks
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const savedSelectionRef = useRef(null);   // selection saved before file picker opens
    // State
    const [saveStatus, setSaveStatus] = useState('idle');
    const [editorInstance, setEditorInstance] = useState(null);
    const [showTOC, setShowTOC] = useState(false);
    const [attachKey, setAttachKey] = useState(0);

    const initialContent = useMemo(() => notes[topicId] || '', [topicId]); // eslint-disable-line

    // ─── Save logic ───
    const handleUpdate = useCallback(({ editor }) => {
        const html = editor.getHTML();
        lastHtmlRef.current = html;
        setSaveStatus('saving');
        clearTimeout(hideSaveRef.current);
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            setNote(topicId, html);
            setSaveStatus('saved');
            hideSaveRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
        }, 400);
    }, [topicId, setNote]);

    useEffect(() => {
        return () => {
            clearTimeout(saveTimerRef.current);
            clearTimeout(hideSaveRef.current);
            if (lastHtmlRef.current) setNote(topicId, lastHtmlRef.current);
        };
    }, [topicId, setNote]);

    const handleCreate = useCallback(({ editor }) => {
        editorRef.current = editor;
        setEditorInstance(editor);
    }, []);

    // ─── Click handler: file links + wiki links ───
    const handleEditorClick = useCallback(async (e) => {
        // File link mark → open file on any click
        const fileSpan = e.target.closest('[data-file-link-id]');
        if (fileSpan) {
            e.preventDefault();
            const fileId = fileSpan.getAttribute('data-file-link-id');
            if (fileId) {
                const record = await fileStorage.get(fileId);
                if (record) openFileFromDataUrl(record.dataUrl, record.mimeType);
            }
            return;
        }
        // Wiki links: Ctrl/Cmd + click
        if (e.ctrlKey || e.metaKey) {
            const wikiEl = e.target.closest('[data-topic-id]');
            if (wikiEl) {
                e.preventDefault();
                const tid = wikiEl.getAttribute('data-topic-id');
                if (tid) onNavigateToTopic?.(tid);
                return;
            }
            const link = e.target.closest('a[href^="#topic:"]');
            if (link) {
                e.preventDefault();
                onNavigateToTopic?.(link.getAttribute('href').replace('#topic:', ''));
            }
        }
    }, [onNavigateToTopic]);

    // ─── Image insertion ───
    const insertImages = useCallback(async (files) => {
        const editor = editorRef.current;
        if (!editor) return;
        for (const file of files) {
            const dataUrl = await readFileAsDataURL(file);
            editor.chain().focus().setImage({ src: dataUrl, alt: file.name || 'image' }).run();
        }
    }, []);

    // ─── File (PDF etc.) insertion ───
    const insertFile = useCallback(async (file) => {
        const editor = editorRef.current;
        if (!editor) return;

        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const dataUrl = await readFileAsDataURL(file);
        await fileStorage.save({ id, topicId, name: file.name, mimeType: file.type, size: file.size, dataUrl });

        const sel = savedSelectionRef.current;
        savedSelectionRef.current = null;

        if (sel && sel.from !== sel.to) {
            // Wrap selected text with FileLinkMark
            editor.chain()
                .focus()
                .setTextSelection({ from: sel.from, to: sel.to })
                .setMark('fileLink', { fileId: id, fileName: file.name, mimeType: file.type })
                .run();
        } else {
            // No selection → insert standalone chip
            editor.chain().focus()
                .insertContent({ type: 'fileAttachment', attrs: { fileId: id, fileName: file.name, mimeType: file.type } })
                .insertContent(' ')
                .run();
        }
        // Refresh attachment panel
        setAttachKey(k => k + 1);
    }, [topicId]);

    // ─── ProseMirror plugin for file drop/paste ───
    // actionsRef holds latest callbacks so the plugin (created once) doesn't close over stale values
    const actionsRef = useRef({ insertImages, insertFile });
    actionsRef.current = { insertImages, insertFile };

    const fileHandlerExt = useMemo(() => Extension.create({ // eslint-disable-line react-hooks/exhaustive-deps
        name: 'fileHandler',
        addProseMirrorPlugins() {
            return [new Plugin({
                key: new PluginKey('fileHandler'),
                props: {
                    handleDOMEvents: {
                        drop(view, e) {
                            const files = Array.from(e.dataTransfer?.files || []);
                            if (!files.length) return false;
                            e.preventDefault();
                            e.stopPropagation();
                            const images = files.filter(f => f.type.startsWith('image/'));
                            const others = files.filter(f => !f.type.startsWith('image/'));
                            if (images.length) actionsRef.current.insertImages(images);
                            others.forEach(f => actionsRef.current.insertFile(f));
                            return true;
                        },
                        paste(view, e) {
                            const items = Array.from(e.clipboardData?.items || []);
                            const images = items
                                .filter(i => i.kind === 'file' && i.type.startsWith('image/'))
                                .map(i => i.getAsFile())
                                .filter(Boolean);
                            if (!images.length) return false;
                            e.preventDefault();
                            actionsRef.current.insertImages(images);
                            return true;
                        },
                    },
                },
            })];
        },
    }), []); // eslint-disable-line react-hooks/exhaustive-deps

    const extensions = useMemo(
        () => [...BASE_TIPTAP_EXTENSIONS, fileHandlerExt],
        [fileHandlerExt],
    );

    // ─── Toolbar button handlers ───
    const handleImagePickClick = useCallback(() => {
        imageInputRef.current?.click();
    }, []);

    const handleFilePickClick = useCallback(() => {
        // Save current selection BEFORE focus leaves the editor
        const editor = editorRef.current;
        if (editor) {
            const { from, to } = editor.state.selection;
            savedSelectionRef.current = { from, to };
        }
        fileInputRef.current?.click();
    }, []);

    const onImageInputChange = useCallback(async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length) await insertImages(files);
    }, [insertImages]);

    const onFileInputChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) await insertFile(file);
    }, [insertFile]);


    return (
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Hidden file inputs */}
            <Box component="input" ref={imageInputRef} type="file" accept="image/*" multiple
                onChange={onImageInputChange} sx={{ display: 'none' }} />
            <Box component="input" ref={fileInputRef} type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                onChange={onFileInputChange} sx={{ display: 'none' }} />

            <Box sx={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
                {/* Editor column */}
                <Box
                    onClick={handleEditorClick}
                    sx={{
                    flex: 1, position: 'relative',
                    '& .MuiTiptap-RichTextField-root': {
                        borderRadius: showTOC ? '12px 0 0 0' : 3,
                        border: `1px solid ${COLORS.white10}`,
                        background: COLORS.white02,
                    },
                    '& .MuiTiptap-RichTextContent-root .ProseMirror': {
                        minHeight: 360, px: 3, py: 2,
                    },
                    '& .MuiTiptap-MenuBar-root': {
                        borderBottom: `1px solid ${COLORS.white08}`,
                        background: COLORS.white03,
                        borderRadius: '12px 12px 0 0',
                    },
                    // Legacy wiki-link
                    '& a[href^="#topic:"]': {
                        color: COLORS.primary, background: `${COLORS.primary}1F`,
                        borderRadius: '4px', px: '4px', py: '1px',
                        textDecoration: 'none', fontWeight: 600, transition: 'all 0.15s',
                        '&:hover': { background: `${COLORS.primary}40` },
                    },
                    // Images
                    '& img': {
                        maxWidth: '100%', borderRadius: '8px',
                        display: 'block', my: 1,
                        cursor: 'default',
                        '&.ProseMirror-selectednode': { outline: `2px solid ${COLORS.primary}` },
                    },
                    // Tables
                    '& table': { borderCollapse: 'collapse', width: '100%', my: 2 },
                    '& th, & td': { border: `1px solid ${COLORS.white12}`, p: 1.5, minWidth: 80 },
                    '& th': { background: `${COLORS.primary}14`, fontWeight: 700 },
                    // Highlight
                    '& mark': { background: 'rgba(250,204,21,0.3)', color: 'inherit', borderRadius: '2px', px: '2px' },
                    // Code blocks
                    '& pre': {
                        background: 'rgba(0,0,0,0.6) !important',
                        color: '#e2e8f0',
                        fontFamily: '"JetBrains Mono","Fira Code",monospace',
                        padding: '2rem 1.25rem 1.25rem !important',
                        borderRadius: '12px !important',
                        margin: '1.5rem 0 !important',
                        border: `1px solid ${COLORS.purple}33 !important`,
                        overflowX: 'auto', position: 'relative',
                        '&::before': {
                            content: '"KÓD"', position: 'absolute', top: '8px', left: '12px',
                            fontSize: '9px', fontWeight: 800,
                            color: `${COLORS.purple}99`, letterSpacing: '0.1em', textTransform: 'uppercase',
                        },
                    },
                    '& pre code': { color: 'inherit', padding: '0 !important', background: 'none !important', fontSize: '0.85rem', lineHeight: '1.6' },
                    '& code:not(pre code)': {
                        background: `${COLORS.primary}26`, color: COLORS.primary,
                        padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85em', fontWeight: 600,
                    },
                }}>
                    <RichTextEditor
                        ref={rteRef}
                        extensions={extensions}
                        content={initialContent}
                        editorDependencies={[topicId]}
                        onUpdate={handleUpdate}
                        onCreate={handleCreate}
                        renderControls={() => (
                            <MenuControlsContainer>
                                <HeadingSelect />
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
                                {/* Callout block dropdown */}
                                <CalloutMenuButton />
                                <MenuDivider />
                                {/* Image insert */}
                                <Tooltip title="Vložit obrázek (nebo přetáhni / vlož ze schránky)">
                                    <IconButton size="small" onClick={handleImagePickClick}
                                        sx={{ color: 'text.secondary', '&:hover': { color: COLORS.green } }}>
                                        <ImageIcon size={16} />
                                    </IconButton>
                                </Tooltip>
                                {/* File / PDF attach */}
                                <Tooltip title="Připojit soubor — vyber text a pak klikni pro odkaz, nebo bez výběru pro čip">
                                    <IconButton size="small" onClick={handleFilePickClick}
                                        sx={{ color: 'text.secondary', '&:hover': { color: COLORS.blue } }}>
                                        <Paperclip size={16} />
                                    </IconButton>
                                </Tooltip>
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

                    <SaveIndicator status={saveStatus} />
                    <AttachmentPanel topicId={topicId} refreshKey={attachKey} />
                    <WordCountFooter editor={editorInstance} showTOC={showTOC} onToggleTOC={() => setShowTOC(v => !v)} />
                </Box>

                {/* TOC panel */}
                {showTOC && (
                    <Box sx={{ borderLeft: `1px solid ${COLORS.white08}`, borderRadius: '0 12px 12px 0', overflow: 'hidden', background: COLORS.white02 }}>
                        <NoteTOC editor={editorInstance} onClose={() => setShowTOC(false)} />
                    </Box>
                )}
            </Box>

            {/* Wiki-link suggestion */}
            {editorInstance && (
                <WikiLinkSuggestion editor={editorInstance} allTopics={allTopics} />
            )}
        </Box>
    );
};
