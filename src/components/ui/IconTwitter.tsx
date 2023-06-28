import React from "react";
import { cn } from "utils/cn";

type IconTwitterProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const IconTwitter: React.FC<IconTwitterProps> = ({ className, ...props }) => {
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
        width: "26px",
        height: "26px",
      }}
      {...props}
    >
      <path
        fill="var(--geist-fill)"
        d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
      />
    </svg>
  );
};

export default IconTwitter;
