"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface CreditAccountSummary {
  plan: "free" | "standard" | "pro";
  monthlyCredits: number;
  bonusCredits: number;
  totalCredits: number;
  monthlyAllowance: number;
  nextResetAt: string;
}

export function useCreditAccount() {
  const [summary, setSummary] =
    useState<CreditAccountSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const refresh = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const idToken = await user.getIdToken();

      const response = await fetch("/api/credits", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Nie udało się pobrać kredytów."
        );
      }

      setSummary(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Nie udało się pobrać kredytów."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        void refresh();
      }
    );

    return unsubscribe;
  }, [refresh]);

  useEffect(() => {
    function handleCreditsUpdate() {
      void refresh();
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
  }, [refresh]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
