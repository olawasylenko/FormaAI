import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
} from "idb";

export interface LibraryModel {
  id: string;
  ownerUid: string;
  taskId: string;

  name: string;
  manufacturer: string;
  category: string;
  width: string;
  height: string;
  depth: string;

  modelBlob: Blob;
  fbxBlob?: Blob;
  objBlob?: Blob;
  previewBlob?: Blob;

  createdAt: string;
  updatedAt: string;
}

interface FormaAILibraryDatabase extends DBSchema {
  models: {
    key: string;
    value: LibraryModel;
    indexes: {
      "by-owner": string;
    };
  };
}

let databasePromise:
  | Promise<IDBPDatabase<FormaAILibraryDatabase>>
  | null = null;

function getDatabase() {
  if (typeof window === "undefined") {
    throw new Error(
      "Biblioteka modeli jest dostępna tylko w przeglądarce."
    );
  }

  if (!databasePromise) {
    databasePromise = openDB<FormaAILibraryDatabase>(
      "formaai-model-library",
      1,
      {
        upgrade(database) {
          if (!database.objectStoreNames.contains("models")) {
            const store = database.createObjectStore("models", {
              keyPath: "id",
            });

            store.createIndex("by-owner", "ownerUid");
          }
        },
      }
    );
  }

  return databasePromise;
}

export async function addLibraryModel(
  input: Omit<LibraryModel, "id" | "createdAt" | "updatedAt">
): Promise<LibraryModel> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  const model: LibraryModel = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await database.put("models", model);

  return model;
}

export async function getLibraryModels(
  ownerUid: string
): Promise<LibraryModel[]> {
  const database = await getDatabase();

  const models = await database.getAllFromIndex(
    "models",
    "by-owner",
    ownerUid
  );

  return models.sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  );
}

export async function updateLibraryModel(
  modelId: string,
  ownerUid: string,
  updates: Pick<
    LibraryModel,
    "name" | "manufacturer" | "category" | "width" | "height" | "depth"
  >
): Promise<void> {
  const database = await getDatabase();
  const currentModel = await database.get("models", modelId);

  if (!currentModel || currentModel.ownerUid !== ownerUid) {
    throw new Error("Nie znaleziono modelu.");
  }

  await database.put("models", {
    ...currentModel,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateLibraryModelFiles(
  modelId: string,
  ownerUid: string,
  files: {
    modelBlob?: Blob;
    fbxBlob?: Blob;
    objBlob?: Blob;
  }
): Promise<void> {
  const database = await getDatabase();
  const currentModel = await database.get("models", modelId);

  if (!currentModel || currentModel.ownerUid !== ownerUid) {
    throw new Error("Nie znaleziono modelu.");
  }

  await database.put("models", {
    ...currentModel,
    ...files,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteLibraryModel(
  modelId: string,
  ownerUid: string
): Promise<void> {
  const database = await getDatabase();
  const currentModel = await database.get("models", modelId);

  if (!currentModel || currentModel.ownerUid !== ownerUid) {
    throw new Error("Nie znaleziono modelu.");
  }

  await database.delete("models", modelId);
}
