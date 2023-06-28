import React from "react";
import { cn } from "utils/cn";

type IconLinkedInProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const IconLinkedIn: React.FC<IconLinkedInProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("with-icon_icon__aLCKg", className)}
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      width="24"
      style={{
        color: "var(--geist-foreground)",
        fill: "currentColor",
        stroke: "var(--geist-background)",
        width: "26px",
        height: "26px",
      }}
      {...props}
    >
      <path
        fill="var(--geist-fill)"
        stroke="var(--geist-fill)"
        d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
      />
      <path
        fill="var(--geist-fill)"
        stroke="var(--geist-fill)"
        d="M2 9h4v12H2z"
      />
      <circle
        stroke="var(--geist-fill)"
        fill="var(--geist-fill)"
        cx="4"
        cy="4"
        r="2"
      />
    </svg>
  );
};

export default IconLinkedIn;
