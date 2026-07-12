const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 30 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Nieobsługiwany format. Dozwolone są pliki JPG, PNG i WEBP.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Plik jest za duży. Maksymalny rozmiar to 30 MB.";
  }

  return null;
}

export { ACCEPTED_TYPES, MAX_FILE_SIZE };
