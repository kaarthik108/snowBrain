import React from 'react';

type IconTrash2Props = React.SVGProps<SVGSVGElement> & {
    className?: string;
};

const IconTrash2: React.FC<IconTrash2Props> = ({ className, ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
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
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    );
};

export default IconTrash2;
