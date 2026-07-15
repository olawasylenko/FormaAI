"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ImagePlus, Loader2, UploadCloud } from "lucide-react";

type ModelUrls = {
  glb?: string;
  fbx?: string;
  obj?: string;
  usdz?: string;
  stl?: string;
};

export function NewModelWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [modelUrls, setModelUrls] = useState<ModelUrls | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => {
    return !!imageDataUrl && !isGenerating;
  }, [imageDataUrl, isGenerating]);

  function handleFileChange(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Wybierz plik graficzny JPG, PNG lub WEBP.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setTaskId("");
    setStatus("");
    setProgress(0);
    setThumbnailUrl("");
    setModelUrls(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function startGeneration() {
    if (!imageDataUrl) return;

    setError("");
    setIsGenerating(true);
    setStatus("PENDING");
    setProgress(0);
    setThumbnailUrl("");
    setModelUrls(null);

    try {
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
        throw new Error(data?.error || "Nie udało się rozpocząć generowania.");
      }

      setTaskId(data.taskId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił błąd generowania."
      );
      setIsGenerating(false);
      setStatus("");
    }
  }

  useEffect(() => {
    if (!taskId) return;
    if (status === "SUCCEEDED" || status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/meshy/status/${taskId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Błąd pobierania statusu.");
        }

        setStatus(data.status || "");
        setProgress(data.progress || 0);

        if (data.thumbnailUrl) {
          setThumbnailUrl(data.thumbnailUrl);
        }

        if (data.status === "SUCCEEDED") {
          setModelUrls(data.modelUrls || null);
          setIsGenerating(false);
          clearInterval(interval);
        }

        if (data.status === "FAILED") {
          setError(data.taskError || "Generowanie modelu nie powiodło się.");
          setIsGenerating(false);
          clearInterval(interval);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Błąd pobierania statusu."
        );
        setIsGenerating(false);
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [taskId, status]);

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="rounded-[32px] border border-border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground">Nowy model 3D</h1>
        <p className="mt-2 text-muted">
          Dodaj zdjęcie produktu i wygeneruj model 3D przez Meshy.
        </p>

        <div className="mt-8">
          <label className="mb-4 block text-xl font-semibold text-foreground">
            Dodaj zdjęcie produktu
          </label>

          <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#b9bea8] bg-[#fbfbf7] px-6 py-10 text-center transition hover:bg-[#f6f7f0]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Podgląd zdjęcia"
                className="max-h-[260px] rounded-2xl object-contain shadow-sm"
              />
            ) : (
              <>
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#eef1e6]">
                  <UploadCloud className="h-12 w-12 text-[#6c7c50]" />
                </div>

                <p className="mt-8 text-2xl font-medium text-foreground">
                  Przeciągnij zdjęcie tutaj lub wybierz plik
                </p>
                <p className="mt-3 text-lg text-muted">
                  JPG, PNG i WEBP
                </p>
              </>
            )}

            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#7a8656] px-8 py-4 text-2xl font-semibold text-white">
              <ImagePlus className="h-6 w-6" />
              Wybierz zdjęcie
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={startGeneration}
          disabled={!canGenerate}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-[26px] bg-[#7a8656] px-6 py-6 text-2xl font-semibold text-white transition hover:bg-[#657149] disabled:cursor-not-allowed disabled:bg-[#c7ccba]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Trwa generowanie...
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              Utwórz model 3D
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {(status || taskId) && (
          <div className="mt-8 rounded-3xl border border-border bg-[#f8f8f3] p-6">
            <h2 className="text-xl font-semibold text-foreground">Status generowania</h2>

            <div className="mt-4 space-y-3 text-sm text-foreground">
              <p><strong>ID zadania:</strong> {taskId || "-"}</p>
              <p><strong>Status:</strong> {status || "-"}</p>
              <p><strong>Postęp:</strong> {progress}%</p>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#dfe3d3]">
              <div
                className="h-full rounded-full bg-[#7a8656] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {thumbnailUrl && (
          <div className="mt-8 rounded-3xl border border-border bg-[#f8f8f3] p-6">
            <h2 className="text-xl font-semibold text-foreground">Podgląd modelu</h2>
            <img
              src={thumbnailUrl}
              alt="Podgląd modelu 3D"
              className="mt-5 max-h-[420px] rounded-2xl border border-border bg-white object-contain"
            />
          </div>
        )}

        {modelUrls && (
          <div className="mt-8 rounded-3xl border border-border bg-[#f8f8f3] p-6">
            <h2 className="text-xl font-semibold text-foreground">Pobierz model</h2>

            <div className="mt-5 flex flex-wrap gap-4">
              {modelUrls.glb && (
                <a
                  href={modelUrls.glb}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7a8656] px-5 py-3 font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  Pobierz GLB
                </a>
              )}

              {modelUrls.fbx && (
                <a
                  href={modelUrls.fbx}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7a8656] px-5 py-3 font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  Pobierz FBX
                </a>
              )}

              {modelUrls.obj && (
                <a
                  href={modelUrls.obj}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7a8656] px-5 py-3 font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  Pobierz OBJ
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
