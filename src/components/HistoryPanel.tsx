"use client";

import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Box,
  Clock3,
  Coins,
  PackagePlus,
  Palette,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { auth } from "@/lib/firebase";

type HistoryItem = {
  id: string;
  type: "generation" | "purchase" | "refund";
  amount: number;
  monthlyUsed: number;
  freeUsed: number;
  bonusUsed: number;
  balanceAfter: number | null;
  shouldTexture: boolean | null;
  purchaseType: string | null;
  reason: string | null;
  createdAt: string | null;
};

type HistoryFilter =
  | "all"
  | "generation"
  | "purchase"
  | "refund";

export function HistoryPanel() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] =
    useState<HistoryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(
    async (showRefreshing = false) => {
      const user = auth.currentUser;

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const idToken = await user.getIdToken();

        const response = await fetch(
          "/api/credits/history",
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Nie udało się pobrać historii."
          );
        }

        setItems(
          Array.isArray(data.items)
            ? data.items
            : []
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Nie udało się pobrać historii."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        void loadHistory();
      }
    );

    return unsubscribe;
  }, [loadHistory]);

  useEffect(() => {
    function handleCreditsUpdate() {
      void loadHistory(true);
    }

    window.addEventListener(
      "formaai-credits-updated",
      handleCreditsUpdate
    );

    return () => {
      window.removeEventListener(
        "formaai-credits-updated",
        handleCreditsUpdate
      );
    };
  }, [loadHistory]);

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return items;
    }

    return items.filter(
      (item) => item.type === filter
    );
  }, [filter, items]);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">
            Operacje na koncie
          </p>

          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Historia
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Sprawdź wykorzystanie, zakupy oraz zwroty
            kredytów.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadHistory(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-primary-light disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Odśwież
        </button>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Wszystkie
        </FilterButton>

        <FilterButton
          active={filter === "generation"}
          onClick={() => setFilter("generation")}
        >
          Wykorzystane
        </FilterButton>

        <FilterButton
          active={filter === "purchase"}
          onClick={() => setFilter("purchase")}
        >
          Zakupy
        </FilterButton>

        <FilterButton
          active={filter === "refund"}
          onClick={() => setFilter("refund")}
        >
          Zwroty
        </FilterButton>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-7 rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted">
            Wczytywanie historii...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
            <Clock3 className="h-7 w-7 text-primary" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-foreground">
            Brak operacji
          </h2>

          <p className="mt-2 text-sm text-muted">
            Operacje pojawią się po wykorzystaniu lub
            zakupie kredytów.
          </p>
        </div>
      ) : (
        <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {filteredItems.map((item, index) => (
            <HistoryRow
              key={item.id}
              item={item}
              last={
                index === filteredItems.length - 1
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-primary text-white"
          : "border border-border bg-white text-muted hover:bg-primary-light hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function HistoryRow({
  item,
  last,
}: {
  item: HistoryItem;
  last: boolean;
}) {
  const isRefund = item.type === "refund";
  const isPurchase = item.type === "purchase";
  const isPositive = isRefund || isPurchase;

  const title = isPurchase
    ? `Zakup ${Math.abs(item.amount)} kredytów`
    : isRefund
      ? "Zwrot kredytów"
      : item.shouldTexture
        ? "Model 3D z teksturą"
        : "Model 3D bez tekstury";

  const description = isPurchase
    ? "Jednorazowy pakiet dodatkowych kredytów został dodany do konta."
    : isRefund
      ? item.reason ||
        "Kredyty zostały zwrócone na konto."
      : item.shouldTexture
        ? "Generowanie geometrii, kolorów i materiałów."
        : "Generowanie geometrii modelu 3D.";

  return (
    <article
      className={`flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isPositive
              ? "bg-green-50 text-green-700"
              : "bg-primary-light text-primary"
          }`}
        >
          {isPurchase ? (
            <PackagePlus className="h-5 w-5" />
          ) : isRefund ? (
            <RotateCcw className="h-5 w-5" />
          ) : item.shouldTexture ? (
            <Palette className="h-5 w-5" />
          ) : (
            <Box className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-foreground">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted">
            {description}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDate(item.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-6 sm:justify-end">
        {item.balanceAfter !== null && (
          <div className="text-right">
            <p className="text-xs text-muted">
              Saldo po operacji
            </p>

            <p className="mt-1 flex items-center justify-end gap-1 font-semibold text-foreground">
              <Coins className="h-4 w-4 text-primary" />
              {item.balanceAfter}
            </p>
          </div>
        )}

        <div
          className={`min-w-20 rounded-xl px-3 py-2 text-center font-bold ${
            isPositive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {item.amount > 0 ? "+" : ""}
          {item.amount}
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
