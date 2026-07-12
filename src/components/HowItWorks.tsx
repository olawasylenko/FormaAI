import { Box, Download, Upload } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Dodaj zdjęcie",
    description:
      "Prześlij zdjęcie mebla, lampy lub dekoracji w formacie JPG, PNG lub WEBP.",
  },
  {
    number: "02",
    icon: Box,
    title: "FormaAI tworzy model",
    description:
      "Sztuczna inteligencja analizuje zdjęcie i generuje precyzyjny model 3D.",
  },
  {
    number: "03",
    icon: Download,
    title: "Pobierz do swojego programu",
    description:
      "Eksportuj model do SketchUp, Archicad, Blender i innych narzędzi projektowych.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="jak-to-dziala"
      className="border-t border-border bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Jak to działa
          </h2>
          <p className="mt-3 text-muted">
            Trzy proste kroki od zdjęcia do gotowego modelu 3D
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy-light">
                  <step.icon className="h-5 w-5 text-burgundy" />
                </div>
                <span className="text-sm font-semibold text-burgundy/60">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
