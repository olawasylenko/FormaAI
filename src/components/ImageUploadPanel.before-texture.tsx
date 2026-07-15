"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import {
  ACCEPTED_TYPES,
  formatFileSize,
  validateImageFile,
} from "@/lib/image-validation";

interface ImageUploadPanelProps {
  onCreateModel?: () => void;
  onFileClear?: () => void;
  onFileSelect?: (file: File | null) => void;
  isGenerating?: boolean;
  isComplete?: boolean;
  embedded?: boolean;
}

export function ImageUploadPanel({
  onCreateModel,
  onFileClear,
  onFileSelect,
  isGenerating = false,
  isComplete = false,
  embedded = false,
}: ImageUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setFile(null);
    setError(null);

    onFileSelect?.(null);
    onFileClear?.();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [previewUrl, onFileClear, onFileSelect]);

  const handleFile = useCallback(
    (selectedFile: File) => {
      const validationError = validateImageFile(selectedFile);

      if (validationError) {
        setError(validationError);
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));

      onFileSelect?.(selectedFile);
    },
    [previewUrl, onFileSelect]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleCreateModel = () => {
    if (!file || isGenerating) return;
    onCreateModel?.();
  };

  const isCreateDisabled = !file || isGenerating;

  const wrapperClass = embedded
    ? ""
    : "rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8";

  return (
    <div className={wrapperClass}>
      <h2 className="mb-5 text-base font-semibold text-foreground">
        Dodaj zdjęcie produktu
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      {!previewUrl ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
            isDragging
              ? "border-primary bg-primary-light"
              : "border-border bg-background hover:border-primary/40 hover:bg-primary-light/50"
          }`}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <Upload className="h-6 w-6 text-primary" />
          </div>

          <p className="mb-2 text-center text-sm font-medium text-foreground">
            Przeciągnij zdjęcie tutaj lub wybierz plik
          </p>

          <p className="mb-6 text-center text-xs text-muted">
            JPG, PNG i WEBP · maks. 30 MB
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Wybierz zdjęcie
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <img
              src={previewUrl}
              alt="Podgląd wybranego zdjęcia"
              className="max-h-56 w-full object-contain"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {file?.name}
              </p>

              <p className="text-xs text-muted">
                {file ? formatFileSize(file.size) : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={clearPreview}
              disabled={isGenerating}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Usuń zdjęcie
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleCreateModel}
        disabled={isCreateDisabled}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/40 disabled:shadow-none"
      >
        <ImagePlus className="h-4 w-4" />

        {isGenerating ? "Trwa generowanie..." : "Utwórz model 3D"}
      </button>

      {isComplete && (
        <p className="mt-3 text-center text-xs font-medium text-primary">
          Model został wygenerowany.
        </p>
      )}
    </div>
  );
}
