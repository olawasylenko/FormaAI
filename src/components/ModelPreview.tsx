"use client";

import { useState } from "react";
import { Box, Download, RotateCcw } from "lucide-react";

const PLACEHOLDER_MESSAGE = "Ta funkcja zostanie podłączona do generatora AI.";

interface ModelPreviewProps {
  onNewModel: () => void;
  embedded?: boolean;
}

export function ModelPreview({ onNewModel, embedded = false }: ModelPreviewProps) {
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const showPlaceholderInfo = () => {
    setInfoMessage(PLACEHOLDER_MESSAGE);
  };

  const content = (
    <>
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
        Podgląd modelu 3D
      </h2>

      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-border bg-background p-8">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-burgundy-light">
          <Box className="h-12 w-12 text-burgundy" strokeWidth={1.25} />
        </div>
        <p className="max-w-xs text-center text-sm text-muted sm:text-base">
          Tutaj pojawi się wygenerowany model 3D
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={showPlaceholderInfo}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-burgundy/30 hover:bg-burgundy-light"
        >
          <Download className="h-4 w-4" />
          Pobierz GLB
        </button>
        <button
          type="button"
          onClick={showPlaceholderInfo}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-burgundy/30 hover:bg-burgundy-light"
        >
          <Download className="h-4 w-4" />
          Pobierz OBJ
        </button>
        <button
          type="button"
          onClick={() => {
            setInfoMessage(null);
            onNewModel();
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-burgundy-hover"
        >
          <RotateCcw className="h-4 w-4" />
          Nowy model
        </button>
      </div>

      {infoMessage && (
        <p className="mt-4 rounded-lg bg-burgundy-light px-4 py-3 text-center text-sm text-burgundy">
          {infoMessage}
        </p>
      )}
    </>
  );

  if (embedded) {
    return (
      <section className="animate-fade-in-up rounded-2xl border border-border bg-white p-8 shadow-sm lg:p-10">
        {content}
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Podgląd modelu 3D
      </h2>
      <div className="mx-auto max-w-2xl">{content}</div>
    </section>
  );
}
