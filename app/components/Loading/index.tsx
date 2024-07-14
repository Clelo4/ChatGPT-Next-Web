"use client";

import React, { PropsWithChildren } from "react";

interface IProps extends PropsWithChildren {
  isLoading?: boolean;
  size?: number;
  color?: string;
}

const Loading = ({
  size = 40,
  color = "#007bff",
  isLoading = true,
  children,
}: IProps) => {
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
    },
    svg: {
      animation: "rotate 1s linear infinite",
    },
    circle: {
      stroke: color,
      strokeLinecap: "round",
      animation: "dash 1.5s ease-in-out infinite",
    },
  };

  if (!isLoading) {
    return children;
  }

  return (
    <div style={styles.container}>
      <svg width={size} height={size} viewBox="0 0 50 50" style={styles.svg}>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          // @ts-ignore
          style={styles.circle}
        />
      </svg>
      <style jsx>{`
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
