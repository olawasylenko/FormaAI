"use client";

import { useCallback, useState } from "react";
import { GenerationProgress } from "@/components/GenerationProgress";
import { ImageUploadPanel } from "@/components/ImageUploadPanel";
import { ModelPreview } from "@/components/ModelPreview";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";

type GenerationPhase = "idle" | "generating" | "complete";

export function HeroSection() {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [workflowKey, setWorkflowKey] = useState(0);

  const handleGenerationComplete = useCallback(() => {
    setPhase("complete");
  }, []);

  const { progress, currentStep, start, reset } = useGenerationProgress(
    handleGenerationComplete,
  );

  const handleCreateModel = () => {
    setPhase("generating");
    start();
  };

  const handleNewModel = () => {
    reset();
    setPhase("idle");
    setWorkflowKey((key) => key + 1);
  };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-burgundy">
              Generator modeli 3D dla architektów
            </p>
            <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Zmień zdjęcie produktu w gotowy model 3D
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Dodaj zdjęcie mebla, lampy lub dekoracji. FormaAI przygotuje model
              3D gotowy do wykorzystania w projektach wnętrz.
            </p>
          </div>

          <ImageUploadPanel
            key={workflowKey}
            onCreateModel={handleCreateModel}
            isGenerating={phase === "generating"}
            isComplete={phase === "complete"}
          />
        </div>

        {phase === "generating" && (
          <div className="mt-12">
            <GenerationProgress progress={progress} currentStep={currentStep} />
          </div>
        )}
      </section>

      {phase === "complete" && (
        <div className="pb-16 sm:pb-20">
          <ModelPreview onNewModel={handleNewModel} />
        </div>
      )}
    </>
  );
}
