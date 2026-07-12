"use client";

import { useState } from "react";
import { Box, Download } from "lucide-react";

const PLACEHOLDER_MESSAGE = "Ta funkcja zostanie podłączona do generatora AI.";

const modelFields = [
  { label: "Nazwa", key: "name" },
  { label: "Producent", key: "manufacturer" },
  { label: "Kategoria", key: "category" },
  { label: "Szerokość", key: "width" },
  { label: "Wysokość", key: "height" },
  { label: "Głębokość", key: "depth" },
] as const;

const downloadButtons = [
  { label: "Pobierz SKP", highlighted: true },
  { label: "Pobierz GLB", highlighted: false },
  { label: "Pobierz FBX", highlighted: false },
  { label: "Pobierz OBJ", highlighted: false },
] as const;

interface ModelPreviewPanelProps {
  isComplete: boolean;
}

export function ModelPreviewPanel({ isComplete }: ModelPreviewPanelProps) {
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const showPlaceholderInfo = () => {
    setInfoMessage(PLACEHOLDER_MESSAGE);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <h2 className="mb-5 text-base font-semibold text-foreground">
          Podgląd modelu 3D
        </h2>

        <div
          className={`flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-border bg-background p-8 ${
            isComplete ? "animate-fade-in-up" : ""
          }`}
        >
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light">
            <Box className="h-10 w-10 text-primary" strokeWidth={1.25} />
          </div>
          <p className="max-w-xs text-center text-sm text-muted">
            {isComplete
              ? "Tutaj pojawi się wygenerowany model 3D"
              : "Model pojawi się po zakończeniu generowania"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Informacje o modelu
        </h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {modelFields.map((field) => (
            <div
              key={field.key}
              className="rounded-lg border border-border bg-background px-4 py-3"
            >
              <dt className="text-xs text-muted">{field.label}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {isComplete ? "—" : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {downloadButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={showPlaceholderInfo}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              button.highlighted
                ? "bg-primary text-white shadow-sm hover:bg-primary-hover"
                : "border border-border bg-white text-foreground shadow-sm hover:border-primary/30 hover:bg-primary-light"
            }`}
          >
            <Download className="h-4 w-4" />
            {button.label}
          </button>
        ))}
      </div>

      {infoMessage && (
        <p className="animate-fade-in rounded-lg bg-primary-light px-4 py-3 text-center text-sm text-accent">
          {infoMessage}
        </p>
      )}
    </div>
  );
}
