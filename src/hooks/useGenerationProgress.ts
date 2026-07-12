"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GENERATION_DURATION_MS,
  GENERATION_STEPS,
  getStepIndex,
} from "@/lib/generation-steps";

export function useGenerationProgress(onComplete: () => void) {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAnimation();
    setProgress(0);
    setIsRunning(false);
  }, [stopAnimation]);

  const start = useCallback(() => {
    stopAnimation();
    setProgress(0);
    setIsRunning(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const startTime = startTimeRef.current;
      if (startTime === null) return;

      const elapsed = now - startTime;
      const nextProgress = Math.min((elapsed / GENERATION_DURATION_MS) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      frameRef.current = null;
      setIsRunning(false);
      onCompleteRef.current();
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  useEffect(() => stopAnimation, [stopAnimation]);

  const stepIndex = getStepIndex(progress);
  const currentStep = GENERATION_STEPS[stepIndex];

  return {
    progress,
    currentStep,
    isRunning,
    start,
    reset,
  };
}
