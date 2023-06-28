import React from "react";

type IconMessageSquareProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const IconMessageSquare: React.FC<IconMessageSquareProps> = ({
  className,
  ...props
}) => {
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
      style={{
        color: "var(--geist-foreground)",
        width: "18px",
        height: "18px",
      }}
      {...props}
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
};

export default IconMessageSquare;
