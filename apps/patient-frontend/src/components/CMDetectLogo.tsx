import { type SVGProps } from "react";

interface CMDetectLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function CMDetectLogo({ size = 20, className, ...props }: CMDetectLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      role="img"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path
        d="M 12.013 3.8 L 15.9 1.5 L 28.4 8.716 L 28.4 23.148 L 15.9 30.365 L 3.4 23.148 L 3.4 8.716 L 7.712 6.27"
        style={{
          paintOrder: "stroke",
          strokeLinejoin: "round",
          fill: "transparent",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeWidth: "2.3px",
        }}
      />
      <path
        d="M 15.782 15.812 L 23.226 11.915 L 23.226 20.418 L 15.863 24.669 L 8.5 20.418 L 8.5 11.915 L 15.782 15.812 Z"
        style={{
          paintOrder: "stroke",
          strokeLinejoin: "round",
          fill: "transparent",
          stroke: "currentColor",
          strokeWidth: "2.3px",
        }}
      />
      <path
        d="M 11.25 9.248 C 13.95 6.457 17.776 6.873 20.363 9.458"
        style={{
          stroke: "currentColor",
          fill: "transparent",
          strokeLinecap: "round",
          strokeWidth: "2.3px",
        }}
      />
    </svg>
  );
}
