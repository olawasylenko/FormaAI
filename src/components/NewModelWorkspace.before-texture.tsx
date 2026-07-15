"use client";

import { useEffect, useState } from "react";
import { GenerationProgress } from "@/components/GenerationProgress";
import { ImageUploadPanel } from "@/components/ImageUploadPanel";
import { ModelPreviewPanel } from "@/components/ModelPreviewPanel";

type GenerationPhase = "idle" | "generating" | "complete" | "failed";

type ModelUrls = {
  glb?: string;
  fbx?: string;
  obj?: string;
  usdz?: string;
  stl?: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Nie udało się odczytać zdjęcia."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Nie udało się odczytać zdjęcia."));
    };

    reader.readAsDataURL(file);
  });
}

export function NewModelWorkspace() {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [modelUrls, setModelUrls] = useState<ModelUrls | null>(null);

  const [error, setError] = useState("");

  async function handleCreateModel() {
    if (!selectedFile || phase === "generating") return;

    setError("");
    setPhase("generating");
    setTaskId("");
    setStatus("PENDING");
    setProgress(0);
    setThumbnailUrl(null);
    setModelUrls(null);

    try {
      const imageDataUrl = await fileToDataUrl(selectedFile);

      const response = await fetch("/api/meshy/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Nie udało się rozpocząć generowania modelu."
        );
      }

      if (!data.taskId) {
        throw new Error("Meshy nie zwróciło identyfikatora zadania.");
      }

      setTaskId(data.taskId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Wystąpił nieznany błąd."
      );

      setPhase("failed");
    }
  }

  useEffect(() => {
    if (!taskId || phase !== "generating") return;

    let stopped = false;

    async function checkTask() {
      try {
        const response = await fetch(`/api/meshy/status/${taskId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Nie udało się pobrać statusu zadania."
          );
        }

        if (stopped) return;

        setStatus(data.status || "");
        setProgress(data.progress ?? 0);

        if (data.thumbnailUrl) {
          setThumbnailUrl(data.thumbnailUrl);
        }

        if (data.status === "SUCCEEDED") {
          setProgress(100);
          setModelUrls(data.modelUrls || null);
          setPhase("complete");
          return;
        }

        if (data.status === "FAILED") {
          setError(
            data.taskError || "Generowanie modelu nie powiodło się."
          );
          setPhase("failed");
          return;
        }

        window.setTimeout(checkTask, 4000);
      } catch (caughtError) {
        if (stopped) return;

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Błąd pobierania statusu."
        );

        setPhase("failed");
      }
    }

    void checkTask();

    return () => {
      stopped = true;
    };
  }, [taskId, phase]);

  function handleFileClear() {
    setSelectedFile(null);
    setPhase("idle");
    setTaskId("");
    setStatus("");
    setProgress(0);
    setThumbnailUrl(null);
    setModelUrls(null);
    setError("");
  }

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);

    if (file) {
      setPhase("idle");
      setTaskId("");
      setStatus("");
      setProgress(0);
      setThumbnailUrl(null);
      setModelUrls(null);
      setError("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
          <h1 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
            Nowy model 3D
          </h1>

          <ImageUploadPanel
            embedded
            onFileSelect={handleFileSelect}
            onCreateModel={handleCreateModel}
            onFileClear={handleFileClear}
            isGenerating={phase === "generating"}
            isComplete={phase === "complete"}
          />

          {phase === "generating" && (
            <div className="mt-6 animate-fade-in-up border-t border-border pt-6">
              <GenerationProgress
                embedded
                progress={progress}
                status={status}
              />
            </div>
          )}

          {phase === "complete" && (
            <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              Model 3D został wygenerowany.
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <ModelPreviewPanel
          isComplete={phase === "complete"}
          isGenerating={phase === "generating"}
          thumbnailUrl={thumbnailUrl}
          modelUrls={modelUrls}
          taskId={taskId}
        />
      </div>
    </div>
  );
}
