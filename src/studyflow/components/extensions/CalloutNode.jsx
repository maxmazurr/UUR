import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Box, Typography, IconButton } from '@mui/material';
import { Info, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';
import { COLORS } from '../../../styles';

const VARIANTS = {
    info:    { icon: Info,          label: 'ℹ Informace',  bg: COLORS.blue08,    border: COLORS.blue20,    color: COLORS.blue,    iconColor: COLORS.blue },
    warning: { icon: AlertTriangle, label: '⚠ Pozor',      bg: `${COLORS.orange}0D`, border: `${COLORS.orange}33`, color: COLORS.orange, iconColor: COLORS.orange },
    tip:     { icon: Lightbulb,     label: '💡 Tip',        bg: `${COLORS.green}0D`,  border: `${COLORS.green}33`,  color: COLORS.green,  iconColor: COLORS.green },
    example: { icon: BookOpen,      label: '📖 Příklad',   bg: `${COLORS.purple}0D`, border: `${COLORS.purple}26`, color: COLORS.purple, iconColor: COLORS.purple },
};

const VARIANT_ORDER = ['info', 'warning', 'tip', 'example'];

const CalloutNodeView = ({ node, updateAttributes }) => {
    const variant = VARIANTS[node.attrs.variant] || VARIANTS.info;
    const Icon = variant.icon;

    const cycleVariant = () => {
        const idx = VARIANT_ORDER.indexOf(node.attrs.variant);
        const next = VARIANT_ORDER[(idx + 1) % VARIANT_ORDER.length];
        updateAttributes({ variant: next });
    };

    return (
        <NodeViewWrapper>
            <Box
                contentEditable={false}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.5, mb: 0.5,
                    borderRadius: '6px 6px 0 0',
                    background: variant.bg,
                    borderLeft: `3px solid ${variant.border}`,
                    borderTop: `1px solid ${variant.border}`,
                    borderRight: `1px solid ${variant.border}`,
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                onClick={cycleVariant}
                title="Kliknutím změnit typ"
            >
                <Icon size={14} color={variant.iconColor} />
                <Typography fontSize={12} fontWeight={700} sx={{ color: variant.color, flex: 1 }}>
                    {variant.label}
                </Typography>
                <Typography fontSize={10} sx={{ color: variant.color, opacity: 0.5 }}>
                    klikni pro změnu
                </Typography>
            </Box>
            <Box sx={{
                borderLeft: `3px solid ${variant.border}`,
                borderBottom: `1px solid ${variant.border}`,
                borderRight: `1px solid ${variant.border}`,
                borderRadius: '0 0 6px 6px',
                px: 2, py: 1,
                background: `${variant.bg}`,
                '& p': { margin: 0, lineHeight: 1.7 },
                '& p + p': { marginTop: '0.4em' },
            }}>
                <NodeViewContent />
            </Box>
        </NodeViewWrapper>
    );
};

export const CalloutNode = Node.create({
    name: 'callout',
    group: 'block',
    content: 'block+',
    defining: true,

    addAttributes() {
        return {
            variant: { default: 'info' },
        };
    },

    parseHTML() {
        return [{
            tag: 'div[data-callout]',
            getAttrs: el => ({ variant: el.getAttribute('data-callout') }),
        }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': HTMLAttributes.variant }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CalloutNodeView);
    },
});
