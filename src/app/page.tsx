import Link from "next/link";
import { PublicHomeShell } from "@/components/PublicHomeShell";
import {
  ArrowRight,
  Box,
  Check,
  Download,
  ImagePlus,
  Library,
  MousePointer2,
  Palette,
  Rotate3D,
  Sparkles,
  Upload,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Dodaj zdjęcie",
    description:
      "Prześlij wyraźne zdjęcie mebla, lampy, dekoracji lub innego produktu.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Wygeneruj obiekt",
    description:
      "FormaAI analizuje zdjęcie i przygotowuje geometrię 3D, również z teksturą.",
  },
  {
    number: "03",
    icon: Download,
    title: "Obejrzyj i pobierz",
    description:
      "Obróć model, sprawdź geometrię, zapisz go w bibliotece i pobierz pliki.",
  },
];

const capabilities = [
  {
    icon: ImagePlus,
    title: "Model ze zdjęcia",
    description:
      "Utwórz obiekt 3D na podstawie pojedynczej fotografii produktu.",
  },
  {
    icon: Palette,
    title: "Generowanie z teksturą",
    description:
      "Dodaj kolory i materiały, aby model lepiej odpowiadał oryginałowi.",
  },
  {
    icon: Rotate3D,
    title: "Interaktywny podgląd",
    description:
      "Obracaj i przybliżaj wygenerowany obiekt bezpośrednio w przeglądarce.",
  },
  {
    icon: Library,
    title: "Własna biblioteka",
    description:
      "Zapisuj modele, edytuj ich dane i pobieraj je ponownie bez generowania od nowa.",
  },
];

const formats = [
  {
    name: "GLB",
    description: "Podgląd internetowy i wymiana modeli 3D",
  },
  {
    name: "FBX",
    description: "Popularny format do programów projektowych i graficznych",
  },
  {
    name: "OBJ",
    description: "Uniwersalny format geometrii 3D",
  },
];

const benefits = [
  "Bez instalowania dodatkowego programu",
  "Wszystkie modele dostępne w jednym miejscu",
  "Możliwość ponownego pobrania zapisanych plików",
  "Edycja nazwy, producenta, kategorii i wymiarów",
];

export default function HomePage() {
  return (
    <PublicHomeShell>
      <main className="min-h-screen bg-[#f7f5ef] text-[#25291f]">
      <header className="sticky top-0 z-50 border-b border-[#d8d3c7] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Forma<span className="text-[#6c7c50]">AI</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <a
              href="#jak-to-dziala"
              className="transition hover:text-[#6c7c50]"
            >
              Jak to działa
            </a>

            <a
              href="#mozliwosci"
              className="transition hover:text-[#6c7c50]"
            >
              Możliwości
            </a>

            <a
              href="#formaty"
              className="transition hover:text-[#6c7c50]"
            >
              Formaty
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#505b39] transition hover:bg-white sm:px-4"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#6c7c50] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#505b39] sm:px-4"
            >
              Załóż konto
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8cdb9] bg-white px-4 py-2 text-sm font-semibold text-[#505b39] shadow-sm">
            <Sparkles className="h-4 w-4" />
            Generator modeli 3D dla projektantów wnętrz
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Zamień zdjęcie produktu w gotowy obiekt 3D
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#62665d]">
            Dodaj zdjęcie mebla, lampy lub dekoracji. FormaAI wygeneruje model,
            który możesz obejrzeć, zapisać w bibliotece i pobrać do dalszej
            pracy.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6c7c50] px-7 py-4 font-semibold text-white shadow-sm transition hover:bg-[#505b39]"
            >
              Zacznij tworzyć
              <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href="#jak-to-dziala"
              className="inline-flex items-center justify-center rounded-2xl border border-[#bfc4b1] bg-white px-7 py-4 font-semibold text-[#505b39] transition hover:bg-[#eef0e7]"
            >
              Zobacz, jak to działa
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <HeroStat value="1" label="zdjęcie" />
            <HeroStat value="3" label="formaty plików" />
            <HeroStat value="360°" label="podgląd modelu" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-14 hidden h-36 w-36 rounded-full bg-[#dfe4d4] blur-3xl lg:block" />
          <div className="absolute -right-8 bottom-10 hidden h-44 w-44 rounded-full bg-[#c9d1b8] blur-3xl lg:block" />

          <div className="relative rounded-[32px] border border-[#d8d3c7] bg-white p-5 shadow-2xl shadow-[#505b39]/15 sm:p-7">
            <div className="rounded-3xl bg-[#eef0e7] p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#505b39]">
                    Nowy model 3D
                  </p>
                  <p className="mt-1 text-xs text-[#72776b]">
                    Zdjęcie produktu
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <ImagePlus className="h-5 w-5 text-[#6c7c50]" />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#aab39a] bg-white p-5 text-center">
                  <Upload className="h-9 w-9 text-[#6c7c50]" />
                  <p className="mt-4 text-sm font-semibold">
                    Dodaj zdjęcie
                  </p>
                  <p className="mt-1 text-xs text-[#72776b]">
                    JPG, PNG lub WEBP
                  </p>
                </div>

                <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#f7f5ef] p-6">
                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#505b39] shadow-sm">
                    Podgląd 3D
                  </div>

                  <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-[#dfe4d4] shadow-inner">
                    <Box
                      className="h-16 w-16 text-[#6c7c50]"
                      strokeWidth={1.25}
                    />
                  </div>

                  <div className="absolute bottom-4 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-medium text-[#62665d] shadow-sm">
                    <MousePointer2 className="h-3.5 w-3.5" />
                    Obróć obiekt
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#6c7c50] px-5 py-4 text-white">
                <div>
                  <p className="text-sm font-semibold">
                    Generowanie obiektu
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    Geometria i opcjonalna tekstura
                  </p>
                </div>

                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="jak-to-dziala"
        className="border-y border-[#d8d3c7] bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-[#6c7c50]">
              Prosty proces
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Od zdjęcia do modelu w trzech krokach
            </h2>

            <p className="mt-5 leading-7 text-[#686d62]">
              Cały proces odbywa się w przeglądarce i nie wymaga instalowania
              dodatkowego oprogramowania.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="rounded-3xl border border-[#d8d3c7] bg-[#f7f5ef] p-8 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6c7c50] text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-bold text-[#6c7c50]/60">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#686d62]">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="mozliwosci" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold text-[#6c7c50]">
            Wszystko w jednym miejscu
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Nie tylko generowanie modeli
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#686d62]">
            FormaAI pomaga utworzyć obiekt, sprawdzić jego geometrię,
            uporządkować dane i zachować pliki do ponownego wykorzystania.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <article
                key={capability.title}
                className="rounded-3xl border border-[#d8d3c7] bg-white p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfe4d4]">
                  <Icon className="h-6 w-6 text-[#505b39]" />
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {capability.title}
                </h3>

                <p className="mt-3 leading-7 text-[#686d62]">
                  {capability.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#eef0e7]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-[#6c7c50]">
              Biblioteka FormaAI
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Nie generuj tego samego obiektu ponownie
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#686d62]">
              Zapisany model pozostaje w Twojej bibliotece. Możesz wrócić do
              niego później, zmienić jego dane i ponownie pobrać dostępne pliki.
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6c7c50] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>

                  <p className="font-medium leading-6">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#d8d3c7] bg-white p-6 shadow-xl shadow-[#505b39]/10">
            <div className="flex items-center justify-between border-b border-[#e1ddd3] pb-5">
              <div>
                <p className="font-bold">Biblioteka modeli</p>
                <p className="mt-1 text-sm text-[#72776b]">
                  Twoje zapisane obiekty
                </p>
              </div>

              <Library className="h-6 w-6 text-[#6c7c50]" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {["Fotel", "Stolik", "Lampa", "Sofa"].map((name, index) => (
                <div
                  key={name}
                  className="rounded-2xl border border-[#e1ddd3] bg-[#f7f5ef] p-4"
                >
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-[#eef0e7]">
                    <Box
                      className="h-10 w-10 text-[#6c7c50]"
                      strokeWidth={1.25}
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    {name}
                  </p>

                  <p className="mt-1 text-xs text-[#72776b]">
                    Model {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="formaty" className="bg-[#505b39] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold text-[#dfe4d4]">
              Eksport modeli
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Pobierz plik w potrzebnym formacie
            </h2>

            <p className="mt-5 leading-7 text-white/75">
              Po wygenerowaniu obiektu możesz zapisać dostępne formaty w swojej
              bibliotece i pobrać je ponownie.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {formats.map((format) => (
              <article
                key={format.name}
                className="rounded-3xl border border-white/15 bg-white/10 p-7"
              >
                <div className="text-3xl font-bold text-[#dfe4d4]">
                  .{format.name.toLowerCase()}
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {format.name}
                </h3>

                <p className="mt-3 leading-7 text-white/70">
                  {format.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="rounded-[32px] bg-[#6c7c50] px-8 py-14 text-white shadow-xl shadow-[#505b39]/20 sm:px-12">
          <Sparkles className="mx-auto h-9 w-9" />

          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
            Utwórz swój pierwszy model 3D
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Załóż konto, dodaj zdjęcie produktu i zobacz wygenerowany obiekt
            bezpośrednio w przeglądarce.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-semibold text-[#505b39] transition hover:bg-[#f7f5ef]"
            >
              Załóż konto
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/40 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Mam już konto
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d8d3c7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[#696e63] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 FormaAI. Wszystkie prawa zastrzeżone.</p>

          <p>Ze zdjęcia do obiektu 3D.</p>
        </div>
      </footer>
      </main>
    </PublicHomeShell>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#d8d3c7] bg-white px-3 py-4 text-center shadow-sm">
      <p className="text-xl font-bold text-[#505b39]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#72776b]">
        {label}
      </p>
    </div>
  );
}
