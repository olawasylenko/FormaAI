import type { GenerationStep } from "@/lib/generation-steps";

interface GenerationProgressProps {
  progress: number;
  status?: string;
  currentStep?: GenerationStep;
  embedded?: boolean;
}

function getStatusText(
  status: string | undefined,
  progress: number,
  currentStep?: GenerationStep
) {
  if (currentStep) {
    return `${currentStep.emoji} ${currentStep.text}`;
  }

  if (status === "PENDING") return "✨ Zadanie oczekuje w kolejce Meshy";
  if (status === "IN_PROGRESS" && progress < 20) return "✨ Analiza zdjęcia";
  if (status === "IN_PROGRESS" && progress < 45) return "✨ Tworzenie geometrii";
  if (status === "IN_PROGRESS" && progress < 75) return "✨ Generowanie tekstur";
  if (status === "IN_PROGRESS") return "✨ Przygotowywanie plików";
  if (status === "SUCCEEDED") return "✨ Model jest gotowy";
  if (status === "FAILED") return "Generowanie nie powiodło się";

  return "✨ Uruchamianie generowania";
}

export function GenerationProgress({
  progress,
  status,
  currentStep,
  embedded = false,
}: GenerationProgressProps) {
  const wrapperClass = embedded
    ? ""
    : "mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8";

  const visibleProgress =
    status === "PENDING" && progress === 0 ? 2 : Math.max(0, progress);

  return (
    <div className={wrapperClass}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">
          {getStatusText(status, progress, currentStep)}
        </p>

        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
          {Math.round(visibleProgress)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-primary-light">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${visibleProgress}%` }}
        />
      </div>

      <div className="mt-5 flex justify-between gap-2">
        {["Analiza", "Geometria", "Tekstury", "Eksport", "Gotowe"].map(
          (label, index) => {
            const stepProgress = (index / 4) * 100;
            const isActive = visibleProgress >= stepProgress;

            return (
              <div
                key={label}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
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
          }
        )}
      </div>
    </div>
  );
}
