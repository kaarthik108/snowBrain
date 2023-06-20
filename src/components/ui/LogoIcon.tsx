import React from 'react';
import { cn } from 'utils/cn';

type LogoIconProps = {
    color?: string,
    width?: string,
    height?: string,
    className?: string,
}

const LogoIcon: React.FC<LogoIconProps> = ({ color = '#999', width = '24px', height = '24px', className }) => {
    return (
        <svg
            className={cn("with-icon_icon__aLCKg", className)}
            data-testid="geist-icon"
            fill="none"
            height="24"
            shapeRendering="geometricPrecision"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="24"
            style={{ color, width, height }}
        >
            <path d="M8.75 6L2.75 12L8.75 18" />
            <path d="M16.75 18L22.75 12L16.75 6" />
        </svg>
    );
};

export default LogoIcon;