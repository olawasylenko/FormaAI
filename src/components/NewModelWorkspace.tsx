"use client";

import { useCallback, useState } from "react";
import { GenerationProgress } from "@/components/GenerationProgress";
import { ImageUploadPanel } from "@/components/ImageUploadPanel";
import { ModelPreviewPanel } from "@/components/ModelPreviewPanel";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";

type GenerationPhase = "idle" | "generating" | "complete";

export function NewModelWorkspace() {
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

  const handleFileClear = () => {
    if (phase === "complete") {
      reset();
      setPhase("idle");
      setWorkflowKey((key) => key + 1);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-6xl">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
          <h1 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
            Nowy model 3D
          </h1>

          <ImageUploadPanel
            key={workflowKey}
            embedded
            onCreateModel={handleCreateModel}
            onFileClear={handleFileClear}
            isGenerating={phase === "generating"}
            isComplete={phase === "complete"}
          />

          {phase === "generating" && (
            <div className="animate-fade-in-up mt-6 border-t border-border pt-6">
              <GenerationProgress
                embedded
                progress={progress}
                currentStep={currentStep}
              />
            </div>
          )}
        </div>

        <ModelPreviewPanel isComplete={phase === "complete"} />
      </div>
    </div>
  );
}
