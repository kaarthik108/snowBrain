import React from 'react';
import { cn } from 'utils/cn';

type IconClipboardProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
};

const IconClipboard: React.FC<IconClipboardProps> = ({ className, ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={cn('with-icon_icon__aLCKg', className)}
            fill="none"
            height="24"
            shapeRendering="geometricPrecision"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            width="24"
            style={{ color: 'var(--geist-foreground)', width: '18px', height: '18px' }}
            {...props}
        >
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    );
};

export default IconClipboard;
