import React from "react";
import { MotionConfig } from "framer-motion";

export function TestProviders({ children }: { children: React.ReactNode }) {
  // Kill all animations in tests to avoid flake
  return <MotionConfig reducedMotion="always">{children}</MotionConfig>;
}