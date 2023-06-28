import React from "react";
import { cn } from "utils/cn";

type IconSendProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const IconSend: React.FC<IconSendProps> = ({ className, ...props }) => {
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
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
};

export default IconSend;
