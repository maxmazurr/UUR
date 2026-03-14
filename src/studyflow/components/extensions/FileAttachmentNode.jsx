/* eslint-disable react-refresh/only-export-components */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Box } from '@mui/material';
import { FileText, Image, Film, Archive, File } from 'lucide-react';
import { fileStorage, openFileFromDataUrl } from '../../utils/fileStorage';
import { COLORS } from '../../../styles';

export function getFileTypeIcon(mimeType, size = 13) {
    if (!mimeType) return <File size={size} />;
    if (mimeType.startsWith('image/')) return <Image size={size} />;
    if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return <FileText size={size} />;
    if (mimeType.startsWith('video/')) return <Film size={size} />;
    return <Archive size={size} />;
}

const FileAttachmentNodeView = ({ node }) => {
    const { fileId, fileName, mimeType } = node.attrs;

    const handleOpen = async (e) => {
        e.preventDefault();
        const record = await fileStorage.get(fileId);
        if (!record) return;
        openFileFromDataUrl(record.dataUrl, record.mimeType);
    };

    return (
        <NodeViewWrapper as="span" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <Box
                component="span"
                contentEditable={false}
                onClick={handleOpen}
                title={`Otevřít: ${fileName}`}
                sx={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: COLORS.blue08, color: COLORS.blue,
                    border: `1px solid ${COLORS.blue20}`,
                    borderRadius: '6px', px: '8px', py: '2px',
                    fontWeight: 600, fontSize: '0.88em', cursor: 'pointer',
                    userSelect: 'none', transition: 'all 0.15s',
                    '&:hover': { background: COLORS.blue20, boxShadow: `0 0 8px ${COLORS.blue}30` },
                }}
            >
                {getFileTypeIcon(mimeType)}
                {fileName}
            </Box>
        </NodeViewWrapper>
    );
};

export const FileAttachmentNode = Node.create({
    name: 'fileAttachment',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            fileId: { default: null },
            fileName: { default: '' },
            mimeType: { default: '' },
        };
    },

    parseHTML() {
        return [{
            tag: 'span[data-file-id]',
            getAttrs: el => ({
                fileId: el.getAttribute('data-file-id'),
                fileName: el.getAttribute('data-file-name'),
                mimeType: el.getAttribute('data-mime-type'),
            }),
        }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, {
            'data-file-id': HTMLAttributes.fileId,
            'data-file-name': HTMLAttributes.fileName,
            'data-mime-type': HTMLAttributes.mimeType,
            style: `display:inline-flex;align-items:center;gap:5px;background:${COLORS.blue08};color:${COLORS.blue};border:1px solid ${COLORS.blue20};border-radius:6px;padding:2px 8px;font-weight:600;cursor:pointer;`,
        }), HTMLAttributes.fileName || ''];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FileAttachmentNodeView);
    },
});
