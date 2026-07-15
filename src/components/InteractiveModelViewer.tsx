"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";

interface InteractiveModelViewerProps {
  src: string;
}

export function InteractiveModelViewer({
  src,
}: InteractiveModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let viewer: HTMLElement | null = null;
    let objectUrl: string | null = null;

    async function loadModel() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(src, {
          cache: "no-store",
        });

        if (!response.ok) {
          let details = "";

          try {
            details = await response.text();
          } catch {
            details = "";
          }

          throw new Error(
            details || `Nie udało się pobrać modelu. Kod ${response.status}.`
          );
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Pobrany plik modelu jest pusty.");
        }

        objectUrl = URL.createObjectURL(blob);

        await import("@google/model-viewer");

        if (cancelled || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";

        viewer = document.createElement("model-viewer");

        viewer.setAttribute("src", objectUrl);
        viewer.setAttribute("alt", "Interaktywny podgląd obiektu 3D");
        viewer.setAttribute("camera-controls", "");
        viewer.setAttribute("touch-action", "pan-y");
        viewer.setAttribute("environment-image", "neutral");
        viewer.setAttribute("shadow-intensity", "1");
        viewer.setAttribute("shadow-softness", "0.8");
        viewer.setAttribute("exposure", "1");
        viewer.setAttribute("loading", "eager");
        viewer.setAttribute("reveal", "auto");

        viewer.style.width = "100%";
        viewer.style.height = "100%";
        viewer.style.minHeight = "360px";
        viewer.style.background = "transparent";
        viewer.style.borderRadius = "12px";
        viewer.style.setProperty("--poster-color", "transparent");

        viewer.addEventListener(
          "load",
          () => {
            setLoading(false);
            setError("");
          },
          { once: true }
        );

        viewer.addEventListener(
          "error",
          () => {
            setLoading(false);
            setError("Nie udało się wyświetlić pobranego modelu GLB.");
          },
          { once: true }
        );

        containerRef.current.appendChild(viewer);
      } catch (caughtError) {
        if (cancelled) return;

        setLoading(false);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Nie udało się wczytać obiektu 3D."
        );
      }
    }

    void loadModel();

    return () => {
      cancelled = true;

      if (viewer?.parentNode) {
        viewer.parentNode.removeChild(viewer);
      }

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-xl bg-[#f7f5ef]">
      <div ref={containerRef} className="h-full min-h-[360px] w-full" />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f7f5ef]">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />

          <p className="mt-4 text-sm text-muted">
            Wczytywanie obiektu 3D...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f7f5ef] px-8 text-center">
          <TriangleAlert className="h-10 w-10 text-red-700" />

          <p className="mt-4 text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-white/90 px-4 py-2 text-xs font-medium text-muted shadow-sm">
          Przeciągnij, aby obrócić • rolka, aby przybliżyć
        </div>
      )}
    </div>
  );
}
