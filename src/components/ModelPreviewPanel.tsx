"use client";

import { useEffect, useState } from "react";
import {
  BookPlus,
  Box,
  CheckCircle2,
  Download,
  LoaderCircle,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import { addLibraryModel } from "@/lib/model-library";
import { InteractiveModelViewer } from "@/components/InteractiveModelViewer";

type ModelUrls = {
  glb?: string;
  fbx?: string;
  obj?: string;
  usdz?: string;
  stl?: string;
};

interface ModelPreviewPanelProps {
  isComplete: boolean;
  isGenerating: boolean;
  thumbnailUrl: string | null;
  modelUrls: ModelUrls | null;
  taskId: string;
  sourceImage?: File | null;
}

export function ModelPreviewPanel({
  isComplete,
  isGenerating,
  thumbnailUrl,
  modelUrls,
  taskId,
  sourceImage,
}: ModelPreviewPanelProps) {
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");

  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState("");

  const interactiveGlbUrl =
    isComplete && modelUrls?.glb && taskId
      ? `/api/meshy/model/${encodeURIComponent(taskId)}`
      : undefined;

  useEffect(() => {
    setSavedToLibrary(false);
    setLibraryError("");
  }, [taskId]);

  async function handleAddToLibrary() {
    const user = auth.currentUser;

    if (!user) {
      setLibraryError("Musisz być zalogowana.");
      return;
    }

    if (!taskId || !isComplete) {
      setLibraryError("Najpierw wygeneruj obiekt.");
      return;
    }

    const modelName = name.trim();

    if (!modelName) {
      setLibraryError("Wpisz nazwę modelu.");
      return;
    }

    setSavingToLibrary(true);
    setLibraryError("");

    try {
      async function fetchModelFormat(
        format: "glb" | "fbx" | "obj"
      ): Promise<Blob> {
        const response = await fetch(
          `/api/meshy/file/${encodeURIComponent(taskId)}/${format}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Nie udało się pobrać pliku ${format.toUpperCase()}.`
          );
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error(
            `Plik ${format.toUpperCase()} jest pusty.`
          );
        }

        return blob;
      }

      const modelBlob = await fetchModelFormat("glb");

      const [fbxResult, objResult] = await Promise.allSettled([
        fetchModelFormat("fbx"),
        fetchModelFormat("obj"),
      ]);

      const fbxBlob =
        fbxResult.status === "fulfilled"
          ? fbxResult.value
          : undefined;

      const objBlob =
        objResult.status === "fulfilled"
          ? objResult.value
          : undefined;

      const previewBlob = sourceImage
        ? sourceImage.slice(
            0,
            sourceImage.size,
            sourceImage.type
          )
        : undefined;

      await addLibraryModel({
        ownerUid: user.uid,
        taskId,
        name: modelName,
        manufacturer: manufacturer.trim(),
        category: category.trim(),
        width: width.trim(),
        height: height.trim(),
        depth: depth.trim(),
        modelBlob,
        fbxBlob,
        objBlob,
        previewBlob,
      });

      setSavedToLibrary(true);
    } catch (caughtError) {
      setLibraryError(
        caughtError instanceof Error
          ? caughtError.message
          : "Nie udało się dodać modelu do biblioteki."
      );
    } finally {
      setSavingToLibrary(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <h2 className="mb-5 text-base font-semibold text-foreground">
          Podgląd modelu 3D
        </h2>

        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-[#f7f5ef]">
          {interactiveGlbUrl ? (
            <InteractiveModelViewer src={interactiveGlbUrl} />
          ) : thumbnailUrl && isComplete ? (
            <img
              src={thumbnailUrl}
              alt="Podgląd modelu 3D"
              className="h-full w-full object-contain"
            />
          ) : isGenerating ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />

              <p className="mt-5 text-sm text-muted">
                Generowanie obiektu
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center p-8">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light">
                <Box className="h-10 w-10 text-primary" />
              </div>

              <p className="text-center text-sm text-muted">
                Model pojawi się po zakończeniu generowania
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Informacje o modelu
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <ModelInput
            label="Nazwa"
            value={name}
            onChange={setName}
            fullWidth
          />

          <ModelInput
            label="Producent"
            value={manufacturer}
            onChange={setManufacturer}
          />

          <ModelInput
            label="Kategoria"
            value={category}
            onChange={setCategory}
          />

          <ModelInput
            label="Szerokość"
            value={width}
            onChange={setWidth}
          />

          <ModelInput
            label="Wysokość"
            value={height}
            onChange={setHeight}
          />

          <ModelInput
            label="Głębokość"
            value={depth}
            onChange={setDepth}
          />
        </div>

        {libraryError && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {libraryError}
          </p>
        )}

        {savedToLibrary && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            Model został dodany do biblioteki.
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleAddToLibrary()}
          disabled={
            !isComplete ||
            savingToLibrary ||
            savedToLibrary
          }
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savedToLibrary ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Dodano do biblioteki
            </>
          ) : (
            <>
              <BookPlus className="h-5 w-5" />
              {savingToLibrary
                ? "Zapisywanie modelu..."
                : "Dodaj do biblioteki"}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          type="button"
          disabled
          className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary/40 px-4 py-3 text-sm font-medium text-white"
        >
          <Download className="h-4 w-4" />
          Pobierz SKP
        </button>

        <DownloadLink label="Pobierz GLB" url={modelUrls?.glb} />
        <DownloadLink label="Pobierz FBX" url={modelUrls?.fbx} />
        <DownloadLink label="Pobierz OBJ" url={modelUrls?.obj} />
      </div>
    </div>
  );
}

function ModelInput({
  label,
  value,
  onChange,
  fullWidth = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="mb-2 block text-xs text-muted">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}

function DownloadLink({
  label,
  url,
}: {
  label: string;
  url?: string;
}) {
  if (!url) {
    return (
      <button
        type="button"
        disabled
        className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-muted opacity-50"
      >
        <Download className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm hover:bg-primary-light"
    >
      <Download className="h-4 w-4" />
      {label}
    </a>
  );
}
