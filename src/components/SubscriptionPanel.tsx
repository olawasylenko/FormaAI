"use client";

import {
  Check,
  Coins,
  Crown,
  GraduationCap,
  PackagePlus,
  Sparkles,
} from "lucide-react";
import { useCreditAccount } from "@/hooks/useCreditAccount";


const plans = [
  {
    id: "free",
    name: "Bezpłatny",
    credits: 100,
    price: "0 zł",
    priceSuffix: "/ miesiąc",
    description:
      "Dla osób, które chcą poznać możliwości FormaAI.",
    icon: Sparkles,
    features: [
      "100 kredytów co miesiąc",
      "Generowanie modeli 3D",
      "Generowanie z teksturą",
      "Biblioteka modeli",
      "Eksport GLB, FBX i OBJ",
    ],
    current: true,
  },
  {
    id: "standard",
    name: "Standard",
    credits: 300,
    price: "29 zł",
    priceSuffix: "/ miesiąc",
    description:
      "Najlepszy dla studentów i hobbystów.",
    icon: GraduationCap,
    features: [
      "300 kredytów co miesiąc",
      "Wszystkie funkcje planu bezpłatnego",
      "Więcej generowanych modeli",
      "Biblioteka modeli",
      "Ponowne pobieranie zapisanych plików",
    ],
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 1000,
    price: "49 zł",
    priceSuffix: "/ miesiąc",
    description:
      "Dla projektantów i osób regularnie pracujących z modelami 3D.",
    icon: Crown,
    features: [
      "1000 kredytów co miesiąc",
      "Wszystkie funkcje planu Standard",
      "Duży miesięczny limit",
      "Biblioteka modeli",
      "Ponowne pobieranie zapisanych plików",
    ],
  },
];

const creditPackages = [
  {
    credits: 100,
    price: "15 zł",
    conversion: "1,50 zł za 10 kredytów",
  },
  {
    credits: 250,
    price: "32 zł",
    conversion: "1,28 zł za 10 kredytów",
  },
  {
    credits: 1000,
    price: "99 zł",
    conversion: "0,99 zł za 10 kredytów",
  },
];

function showPaymentsMessage() {
  window.alert(
    "Płatności zostaną podłączone w kolejnym etapie."
  );
}

export function SubscriptionPanel() {
  const {
    summary: creditSummary,
  } = useCreditAccount();

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div>
        <p className="text-sm font-semibold text-primary">
          Plany i kredyty
        </p>

        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Subskrypcja
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Wybierz miesięczny plan dopasowany do liczby tworzonych
          modeli. Kredyty odnawiają się automatycznie każdego
          miesiąca.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-muted">
              Twój aktualny plan
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">
                Bezpłatny
              </h2>

              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-accent">
                Aktywny
              </span>
            </div>

            <p className="mt-3 text-sm text-muted">
              100 kredytów odnawianych co miesiąc
            </p>

            <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-sm leading-6 text-muted">
                Podczas generowania najpierw wykorzystywane są kredyty
                dostępne w miesięcznym planie, a następnie dodatkowo
                zakupione kredyty.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-background px-6 py-4 text-center">
            <p className="text-sm text-muted">
              Dostępne kredyty
            </p>

            <p className="mt-1 text-3xl font-bold text-primary">
              {creditSummary?.totalCredits ?? 100}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Wybierz plan
          </h2>

          <p className="mt-2 text-muted">
            Plan możesz później zmienić lub anulować.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                  plan.recommended
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white">
                    Najlepszy dla studentów i hobbystów
                  </div>
                )}

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-4 text-xl font-bold text-foreground">
                  {plan.name}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-5 text-muted">
                  {plan.description}
                </p>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>

                  <span className="ml-2 text-sm text-muted">
                    {plan.priceSuffix}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-background px-3 py-2.5">
                  <Coins className="h-5 w-5 text-primary" />

                  <span className="font-semibold text-foreground">
                    {plan.credits} kredytów miesięcznie
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light">
                        <Check className="h-3 w-3 text-primary" />
                      </div>

                      <p className="text-sm leading-6 text-muted">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={plan.current}
                  onClick={showPaymentsMessage}
                  className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    plan.current
                      ? "cursor-default border border-border bg-background text-muted"
                      : plan.recommended
                        ? "bg-primary text-white hover:bg-accent"
                        : "border border-primary text-primary hover:bg-primary-light"
                  }`}
                >
                  {plan.current
                    ? "Twój aktualny plan"
                    : `Wybierz plan ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Dodatkowe kredyty
          </h2>

          <p className="mt-2 text-muted">
            Jednorazowy zakup. Dodatkowe kredyty nie odnawiają się
            automatycznie.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {creditPackages.map((creditPackage) => (
            <article
              key={creditPackage.credits}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
                  <PackagePlus className="h-5 w-5 text-primary" />
                </div>

                <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
                  Jednorazowo
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold text-foreground">
                {creditPackage.credits}
              </p>

              <p className="mt-1 text-sm text-muted">
                dodatkowych kredytów
              </p>

              <div className="mt-4">
                <p className="text-xl font-bold text-primary">
                  {creditPackage.price}
                </p>

                <p className="mt-1 text-xs text-muted">
                  ({creditPackage.conversion})
                </p>
              </div>

              <button
                type="button"
                onClick={showPaymentsMessage}
                className="mt-4 w-full rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-light"
              >
                Kup kredyty
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-7 rounded-2xl border border-border bg-background px-5 py-3 text-sm leading-6 text-muted">
        Niewykorzystane kredyty z miesięcznego planu odnawiają się
        wraz z rozpoczęciem kolejnego okresu rozliczeniowego.
        Dodatkowo zakupione kredyty pozostają na koncie do momentu
        wykorzystania.
      </div>
    </div>
  );
}
