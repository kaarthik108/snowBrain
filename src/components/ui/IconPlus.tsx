import React from 'react';
import { cn } from 'utils/cn';

type IconPlusProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
};

const IconPlus: React.FC<IconPlusProps> = ({ className, ...props }) => {
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
};

export default IconPlus;
