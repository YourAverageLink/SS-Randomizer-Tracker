import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { followCursor as followCursorPlugin } from 'tippy.js';

export default function Tooltip({
    content,
    children,
    placement,
    followCursor,
    disabled,
}: {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: 'bottom' | 'top';
    followCursor?: boolean;
    disabled?: boolean;
}) {
    return (
        <Tippy
            disabled={disabled}
            placement={placement}
            content={content}
            {...(followCursor
                ? { followCursor, plugins: [followCursorPlugin], offset: [0, placement === 'bottom' ? 20 : 0] }
                : {})}
        >
            {children}
        </Tippy>
    );
}
