import type { GenerationStep } from "@/lib/generation-steps";

interface GenerationProgressProps {
  progress: number;
  currentStep: GenerationStep;
  embedded?: boolean;
}

export function GenerationProgress({
  progress,
  currentStep,
  embedded = false,
}: GenerationProgressProps) {
  const wrapperClass = embedded
    ? ""
    : "mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8";

  return (
    <div className={wrapperClass}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">
          <span className="mr-2">{currentStep.emoji}</span>
          {currentStep.text}
        </p>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-primary-light">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 flex justify-between gap-2">
        {["Analiza", "Tło", "Geometria", "Tekstury", "Eksport", "Gotowe"].map(
          (label, index) => {
            const stepProgress = (index / 5) * 100;
            const isActive = progress >= stepProgress;

            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                    isActive ? "bg-primary" : "bg-primary-light"
                  }`}
                />
                <span
                  className={`hidden text-center text-[10px] font-medium sm:block ${
                    isActive ? "text-primary" : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
