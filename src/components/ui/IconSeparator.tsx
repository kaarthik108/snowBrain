import React from 'react';
import { cn } from 'utils/cn';

type IconSeparatorProps = React.SVGProps<SVGSVGElement>;

const IconSeparator: React.FC<IconSeparatorProps> = ({ className, ...props }) => {
    return (
        <svg
            fill="none"
            shapeRendering="geometricPrecision"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn('h-6 w-6', className)}
            {...props}
        >
            <path d="M16.88 3.549L7.12 20.451"></path>
        </svg>
    );
};

export default IconSeparator;
