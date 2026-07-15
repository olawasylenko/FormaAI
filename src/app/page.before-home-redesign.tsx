import Link from "next/link";

const programs = [
  "SketchUp",
  "Archicad",
  "Revit",
  "Blender",
  "3ds Max",
  "Twinmotion",
];

const benefits = [
  "Modele przygotowane do wykorzystania w programach architektonicznych",
  "Eksport do formatów SKP, GLB, FBX i OBJ",
  "Automatyczna optymalizacja geometrii",
  "Biblioteka modeli i projektów klientów",
  "Rozpoznawanie materiałów, kolorów i kategorii",
  "Tworzenie modelu ze zdjęcia lub linku do produktu",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#25291f]">
      <header className="sticky top-0 z-50 border-b border-[#d8d3c7] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Forma<span className="text-[#6c7c50]">AI</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#jak-to-dziala" className="hover:text-[#6c7c50]">
              Jak to działa
            </a>
            <a href="#mozliwosci" className="hover:text-[#6c7c50]">
              Możliwości
            </a>
            <a href="#programy" className="hover:text-[#6c7c50]">
              Programy
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#505b39] transition hover:bg-white"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#6c7c50] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#505b39]"
            >
              Zarejestruj się
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-[#c8cdb9] bg-white px-4 py-2 text-sm font-semibold text-[#505b39]">
            Narzędzie AI dla architektów i projektantów wnętrz
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Zamień zdjęcie produktu w profesjonalny model 3D
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#62665d]">
            Twórz modele mebli, lamp i dekoracji, zapisuj je w projektach
            klientów i pobieraj w formatach gotowych do pracy w programach
            architektonicznych.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-2xl bg-[#6c7c50] px-7 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-[#505b39]"
            >
              Zacznij bezpłatnie
            </Link>

            <a
              href="#jak-to-dziala"
              className="rounded-2xl border border-[#bfc4b1] bg-white px-7 py-4 text-center font-semibold text-[#505b39] transition hover:bg-[#eef0e7]"
            >
              Zobacz, jak to działa
            </a>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#d8d3c7] bg-white p-6 shadow-xl shadow-[#505b39]/10">
          <div className="rounded-3xl bg-[#eef0e7] p-8">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="text-4xl">📷</div>
                <p className="mt-3 font-semibold">Zdjęcie</p>
              </div>

              <div className="rounded-2xl bg-[#6c7c50] p-5 text-center text-white shadow-sm">
                <div className="text-4xl">✨</div>
                <p className="mt-3 font-semibold">FormaAI</p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="text-4xl">🧊</div>
                <p className="mt-3 font-semibold">Model 3D</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[#9ca68a] bg-[#f7f5ef] px-6 py-10 text-center">
              <p className="text-lg font-semibold text-[#505b39]">
                Zdjęcie → analiza AI → gotowy model
              </p>
              <p className="mt-2 text-sm text-[#72776b]">
                SKP, GLB, FBX i OBJ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="jak-to-dziala" className="border-y border-[#d8d3c7] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="font-semibold text-[#6c7c50]">Prosty proces</p>
            <h2 className="mt-3 text-4xl font-bold">Jak działa FormaAI?</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["1", "Dodaj zdjęcie", "Prześlij fotografię produktu lub wklej link do sklepu."],
              ["2", "FormaAI tworzy model", "System analizuje produkt i przygotowuje geometrię oraz tekstury."],
              ["3", "Pobierz i projektuj", "Wybierz format odpowiedni do programu, w którym pracujesz."],
            ].map(([number, title, description]) => (
              <article
                key={number}
                className="rounded-3xl border border-[#d8d3c7] bg-[#f7f5ef] p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6c7c50] text-lg font-bold text-white">
                  {number}
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[#686d62]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="mozliwosci" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-[#6c7c50]">
              Więcej niż generator 3D
            </p>
            <h2 className="mt-3 text-4xl font-bold">
              Jedno miejsce do pracy nad modelami i projektami
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#686d62]">
              FormaAI pomaga nie tylko utworzyć model, ale również uporządkować
              go w bibliotece, przypisać do projektu klienta i przygotować do
              dalszej pracy.
            </p>
          </div>

          <div className="grid gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-4 rounded-2xl border border-[#d8d3c7] bg-white p-5"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dfe4d4] font-bold text-[#505b39]">
                  ✓
                </div>
                <p className="font-medium leading-7">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programy" className="bg-[#505b39] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="font-semibold text-[#dfe4d4]">
            Pracuj w swoim ulubionym programie
          </p>
          <h2 className="mt-3 text-4xl font-bold">
            Modele przygotowane do dalszej pracy
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {programs.map((program) => (
              <div
                key={program}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-5 font-semibold"
              >
                {program}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="rounded-[32px] bg-[#6c7c50] px-8 py-14 text-white shadow-xl shadow-[#505b39]/20">
          <h2 className="text-4xl font-bold">
            Zacznij tworzyć własną bibliotekę modeli 3D
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Załóż konto i przygotuj swoje pierwsze modele do wykorzystania
            w projektach wnętrz.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-7 py-4 font-semibold text-[#505b39] transition hover:bg-[#f7f5ef]"
            >
              Zarejestruj się
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
          <p>Ze zdjęcia do modelu 3D.</p>
        </div>
      </footer>
    </main>
  );
}
