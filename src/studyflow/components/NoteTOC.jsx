import { useMemo } from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import { List, X } from 'lucide-react';
import { COLORS } from '../../styles';

function extractHeadings(doc) {
    const headings = [];
    if (!doc) return headings;
    doc.forEach(node => {
        if (node.type.name === 'heading') {
            headings.push({
                level: node.attrs.level,
                text: node.textContent,
            });
        }
    });
    return headings;
}

export const NoteTOC = ({ editor, onClose }) => {
    const headings = useMemo(() => {
        if (!editor) return [];
        return extractHeadings(editor.state.doc);
    }, [editor, editor?.state.doc]);

    const scrollToHeading = (text) => {
        if (!editor) return;
        let found = false;
        editor.state.doc.descendants((node, pos) => {
            if (found) return false;
            if (node.type.name === 'heading' && node.textContent === text) {
                found = true;
                editor.commands.setTextSelection(pos);
                editor.view.dom.ownerDocument.querySelector(
                    '.ProseMirror'
                )?.closest('[class*="RichTextContent"]')
                    ?.scrollTo({ top: editor.view.coordsAtPos(pos).top - 80, behavior: 'smooth' });
                // Fallback: focus and scroll the editor DOM
                const domNode = editor.view.nodeDOM(pos);
                if (domNode?.scrollIntoView) {
                    domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    };

    if (!headings.length) return (
        <Box sx={{
            width: 220, borderLeft: `1px solid ${COLORS.white08}`,
            p: 2, display: 'flex', flexDirection: 'column', gap: 1,
        }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={0.75}>
                    <List size={13} color={COLORS.white40} />
                    <Typography fontSize={11} fontWeight={700} color={COLORS.white40}>
                        Obsah
                    </Typography>
                </Stack>
                <IconButton size="small" onClick={onClose} sx={{ color: COLORS.white30, p: 0.25 }}>
                    <X size={13} />
                </IconButton>
            </Stack>
            <Typography fontSize={11} color={COLORS.white25} sx={{ mt: 1 }}>
                Přidej nadpisy (H1–H3) pro zobrazení obsahu.
            </Typography>
        </Box>
    );

    return (
        <Box sx={{
            width: 220, borderLeft: `1px solid ${COLORS.white08}`,
            p: 2, display: 'flex', flexDirection: 'column', gap: 0.5,
            overflowY: 'auto',
        }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Stack direction="row" alignItems="center" gap={0.75}>
                    <List size={13} color={COLORS.primary} />
                    <Typography fontSize={11} fontWeight={700} sx={{ color: COLORS.primary }}>
                        Obsah
                    </Typography>
                </Stack>
                <IconButton size="small" onClick={onClose} sx={{ color: COLORS.white30, p: 0.25 }}>
                    <X size={13} />
                </IconButton>
            </Stack>
            {headings.map((h, i) => (
                <Box
                    key={i}
                    onClick={() => scrollToHeading(h.text)}
                    sx={{
                        pl: (h.level - 1) * 1.5,
                        py: 0.4, px: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        color: h.level === 1 ? COLORS.textPrimary : COLORS.white60,
                        fontSize: h.level === 1 ? 12 : 11,
                        fontWeight: h.level === 1 ? 700 : 500,
                        '&:hover': { background: COLORS.white05, color: COLORS.textPrimary },
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    title={h.text}
                >
                    {h.text || '(prázdný nadpis)'}
                </Box>
            ))}
        </Box>
    );
};
