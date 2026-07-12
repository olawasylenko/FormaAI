export const GENERATION_DURATION_MS = 8000;

export const GENERATION_STEPS = [
  { emoji: "📷", text: "Analizowanie zdjęcia..." },
  { emoji: "✂️", text: "Usuwanie tła..." },
  { emoji: "🧠", text: "Tworzenie geometrii 3D..." },
  { emoji: "🎨", text: "Nakładanie tekstur..." },
  { emoji: "📦", text: "Przygotowanie modelu..." },
  { emoji: "✅", text: "Gotowe" },
] as const;

export type GenerationStep = (typeof GENERATION_STEPS)[number];

export function getStepIndex(progress: number): number {
  const stepCount = GENERATION_STEPS.length;
  const index = Math.floor((progress / 100) * stepCount);
  return Math.min(index, stepCount - 1);
}
