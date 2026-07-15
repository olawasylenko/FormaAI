"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  Box,
  CalendarDays,
  Download,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import {
  deleteLibraryModel,
  getLibraryModels,
  updateLibraryModel,
  updateLibraryModelFiles,
  type LibraryModel,
} from "@/lib/model-library";
import { InteractiveModelViewer } from "@/components/InteractiveModelViewer";

type EditableModelData = Pick<
  LibraryModel,
  "name" | "manufacturer" | "category" | "width" | "height" | "depth"
>;

const emptyForm: EditableModelData = {
  name: "",
  manufacturer: "",
  category: "",
  width: "",
  height: "",
  depth: "",
};

export function LibraryPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [models, setModels] = useState<LibraryModel[]>([]);
  const [selectedModel, setSelectedModel] =
    useState<LibraryModel | null>(null);

  const [form, setForm] = useState<EditableModelData>(emptyForm);
  const [modelObjectUrl, setModelObjectUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoringFiles, setRestoringFiles] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadModels(currentUser.uid);
      } else {
        setModels([]);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedModel) {
      setModelObjectUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedModel.modelBlob);
    setModelObjectUrl(url);

    setForm({
      name: selectedModel.name,
      manufacturer: selectedModel.manufacturer,
      category: selectedModel.category,
      width: selectedModel.width,
      height: selectedModel.height,
      depth: selectedModel.depth,
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedModel]);

  async function loadModels(ownerUid: string) {
    setLoading(true);

    try {
      const result = await getLibraryModels(ownerUid);
      setModels(result);
    } catch {
      setError("Nie udało się wczytać biblioteki.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    if (!user || !selectedModel) return;

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      setError("Wpisz nazwę modelu.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedForm = {
        ...form,
        name: trimmedName,
      };

      await updateLibraryModel(
        selectedModel.id,
        user.uid,
        updatedForm
      );

      setSelectedModel({
        ...selectedModel,
        ...updatedForm,
        updatedAt: new Date().toISOString(),
      });

      await loadModels(user.uid);
      setMessage("Zmiany zostały zapisane.");
    } catch {
      setError("Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  }

  async function fetchStoredFormat(
    taskId: string,
    format: "fbx" | "obj"
  ): Promise<Blob> {
    const response = await fetch(
      `/api/meshy/file/${encodeURIComponent(taskId)}/${format}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Plik ${format.toUpperCase()} nie jest dostępny.`
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

  async function handleRestoreFiles() {
    if (!user || !selectedModel) return;

    setRestoringFiles(true);
    setError("");
    setMessage("");

    try {
      const updates: {
        fbxBlob?: Blob;
        objBlob?: Blob;
      } = {};

      if (!selectedModel.fbxBlob) {
        try {
          updates.fbxBlob = await fetchStoredFormat(
            selectedModel.taskId,
            "fbx"
          );
        } catch {
          // Format może nie być dostępny.
        }
      }

      if (!selectedModel.objBlob) {
        try {
          updates.objBlob = await fetchStoredFormat(
            selectedModel.taskId,
            "obj"
          );
        } catch {
          // Format może nie być dostępny.
        }
      }

      if (!updates.fbxBlob && !updates.objBlob) {
        throw new Error(
          "Nie udało się odzyskać brakujących formatów."
        );
      }

      await updateLibraryModelFiles(
        selectedModel.id,
        user.uid,
        updates
      );

      setSelectedModel({
        ...selectedModel,
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      await loadModels(user.uid);

      setMessage(
        "Brakujące pliki zostały zapisane w bibliotece."
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Nie udało się odzyskać plików."
      );
    } finally {
      setRestoringFiles(false);
    }
  }

  async function handleDelete(model: LibraryModel) {
    if (!user) return;

    const confirmed = window.confirm(
      `Czy na pewno usunąć model „${model.name}”?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteLibraryModel(model.id, user.uid);

      if (selectedModel?.id === model.id) {
        setSelectedModel(null);
      }

      await loadModels(user.uid);
    } catch {
      setError("Nie udało się usunąć modelu.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted">Wczytywanie biblioteki...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Biblioteka modeli
        </h1>

        <p className="mt-2 text-muted">
          Przeglądaj, obracaj i edytuj zapisane obiekty.
        </p>
      </div>

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </p>
      )}

      {models.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light">
            <Box className="h-10 w-10 text-primary" />
          </div>

          <h2 className="mt-6 text-xl font-semibold text-foreground">
            Biblioteka jest pusta
          </h2>

          <p className="mt-2 text-sm text-muted">
            Wygeneruj pierwszy obiekt i kliknij „Dodaj do biblioteki”.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <LibraryModelCard
              key={model.id}
              model={model}
              onEdit={() => {
                setMessage("");
                setError("");
                setSelectedModel(model);
              }}
              onDelete={() => void handleDelete(model)}
            />
          ))}
        </div>
      )}

      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-border bg-white p-6 shadow-2xl lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Edycja modelu
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Zmień dane albo obejrzyj geometrię.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="rounded-xl border border-border p-2.5 text-muted hover:bg-background"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-2">
              <div className="min-h-[460px] overflow-hidden rounded-2xl border border-border bg-[#f7f5ef]">
                {modelObjectUrl && (
                  <InteractiveModelViewer src={modelObjectUrl} />
                )}
              </div>

              <div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Nazwa"
                    value={form.name}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        name: value,
                      }))
                    }
                    fullWidth
                  />

                  <TextField
                    label="Producent"
                    value={form.manufacturer}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        manufacturer: value,
                      }))
                    }
                  />

                  <TextField
                    label="Kategoria"
                    value={form.category}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        category: value,
                      }))
                    }
                  />

                  <TextField
                    label="Szerokość"
                    value={form.width}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        width: value,
                      }))
                    }
                  />

                  <TextField
                    label="Wysokość"
                    value={form.height}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        height: value,
                      }))
                    }
                  />

                  <TextField
                    label="Głębokość"
                    value={form.depth}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        depth: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSaveChanges()}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(selectedModel)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń model
                  </button>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="text-base font-semibold text-foreground">
                    Pobierz zapisane pliki
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    Pliki są zapisane w bibliotece i nie wymagają ponownego generowania.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() =>
                        downloadStoredFile(
                          selectedModel.modelBlob,
                          createFileName(selectedModel.name, "glb")
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
                    >
                      <Download className="h-4 w-4" />
                      Pobierz GLB
                    </button>

                    <button
                      type="button"
                      disabled={!selectedModel.fbxBlob}
                      onClick={() => {
                        if (selectedModel.fbxBlob) {
                          downloadStoredFile(
                            selectedModel.fbxBlob,
                            createFileName(selectedModel.name, "fbx")
                          );
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download className="h-4 w-4" />
                      Pobierz FBX
                    </button>

                    <button
                      type="button"
                      disabled={!selectedModel.objBlob}
                      onClick={() => {
                        if (selectedModel.objBlob) {
                          downloadStoredFile(
                            selectedModel.objBlob,
                            createFileName(selectedModel.name, "obj")
                          );
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download className="h-4 w-4" />
                      Pobierz OBJ
                    </button>
                  </div>

                  {(!selectedModel.fbxBlob ||
                    !selectedModel.objBlob) && (
                    <button
                      type="button"
                      onClick={() => void handleRestoreFiles()}
                      disabled={restoringFiles}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary-light disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          restoringFiles ? "animate-spin" : ""
                        }`}
                      />

                      {restoringFiles
                        ? "Pobieranie brakujących plików..."
                        : "Uzupełnij brakujące pliki"}
                    </button>
                  )}
                </div>

                <p className="mt-6 break-all text-xs text-muted">
                  ID modelu: {selectedModel.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function createFileName(
  modelName: string,
  extension: string
) {
  const safeName =
    modelName
      .trim()
      .replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "model-3d";

  return `${safeName}.${extension}`;
}

function downloadStoredFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function LibraryModelCard({
  model,
  onEdit,
  onDelete,
}: {
  model: LibraryModel;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!model.previewBlob) return;

    const url = URL.createObjectURL(model.previewBlob);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [model.previewBlob]);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center bg-background">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={model.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <Box className="h-14 w-14 text-primary" />
        )}
      </div>

      <div className="p-5">
        <h2 className="truncate text-lg font-semibold text-foreground">
          {model.name}
        </h2>

        <p className="mt-1 text-sm text-muted">
          {model.category || "Bez kategorii"}
        </p>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <CalendarDays className="h-4 w-4" />
          {new Date(model.createdAt).toLocaleDateString("pl-PL")}
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Pencil className="h-4 w-4" />
            Otwórz i edytuj
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-200 p-2.5 text-red-700 hover:bg-red-50"
            aria-label="Usuń model"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function TextField({
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
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}
