import { Mark, mergeAttributes } from '@tiptap/core';
import { COLORS } from '../../../styles';

// A mark (not a node) that wraps selected text and links it to a stored file.
// Clicking the styled text opens the file from IndexedDB.
export const FileLinkMark = Mark.create({
    name: 'fileLink',

    addAttributes() {
        return {
            fileId:   { default: null },
            fileName: { default: '' },
            mimeType: { default: '' },
        };
    },

    parseHTML() {
        return [{
            tag: 'span[data-file-link-id]',
            getAttrs: el => ({
                fileId:   el.getAttribute('data-file-link-id'),
                fileName: el.getAttribute('data-file-link-name'),
                mimeType: el.getAttribute('data-file-link-type'),
            }),
        }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, {
            'data-file-link-id':   HTMLAttributes.fileId,
            'data-file-link-name': HTMLAttributes.fileName,
            'data-file-link-type': HTMLAttributes.mimeType,
            style: [
                `color:${COLORS.blue}`,
                `border-bottom:1.5px dashed ${COLORS.blue}`,
                `cursor:pointer`,
                `font-weight:600`,
                `padding-bottom:1px`,
                `transition:opacity 0.15s`,
            ].join(';'),
        }), 0];
    },
});
