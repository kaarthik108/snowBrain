import React from "react";
import { cn } from "utils/cn";

type IconCheckProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const IconCheck: React.FC<IconCheckProps> = ({ className, ...props }) => {
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
        width: "24px",
        height: "24px",
      }}
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
};

export default IconCheck;
