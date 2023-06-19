import React from 'react';
import { cn } from 'utils/cn';

type IconMenuProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
};

const IconMenu: React.FC<IconMenuProps> = ({ className, ...props }) => {
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
            <path d="M3 12h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
        </svg>
    );
};

export default IconMenu;
