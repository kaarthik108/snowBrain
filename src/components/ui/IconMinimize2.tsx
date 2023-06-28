import React from "react";
import { cn } from "utils/cn";

type IconMinimize2Props = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const IconMinimize2: React.FC<IconMinimize2Props> = ({
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("with-icon_icon__aLCKg", className)}
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
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="M14 10l7-7" />
      <path d="M3 21l7-7" />
    </svg>
  );
};

export default IconMinimize2;
