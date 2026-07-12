"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { auth } from "@/lib/firebase";

type VerificationStatus = "loading" | "success" | "error";

export default function EmailActionPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState(
    "Potwierdzamy Twój adres e-mail..."
  );

  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      if (mode !== "verifyEmail" || !oobCode) {
        setStatus("error");
        setMessage("Link potwierdzający jest nieprawidłowy.");
        return;
      }

      try {
        await checkActionCode(auth, oobCode);
        await applyActionCode(auth, oobCode);

        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        setStatus("success");
        setMessage("Adres e-mail został prawidłowo potwierdzony.");

        window.setTimeout(() => {
          if (auth.currentUser) {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/login";
          }
        }, 1800);
      } catch {
        setStatus("error");
        setMessage(
          "Nie udało się potwierdzić adresu. Link mógł wygasnąć lub zostać wcześniej otwarty."
        );
      }
    }

    void verifyEmail();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#d8d3c7] bg-white p-9 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9edde] text-[#505b39]">
          {status === "loading" && (
            <LoaderCircle className="animate-spin" size={34} />
          )}

          {status === "success" && <CheckCircle2 size={34} />}

          {status === "error" && (
            <CircleAlert className="text-red-700" size={34} />
          )}
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          {status === "loading" && "Potwierdzanie konta"}
          {status === "success" && "Konto zostało aktywowane"}
          {status === "error" && "Nie udało się aktywować konta"}
        </h1>

        <p className="mt-4 leading-7 text-[#64695e]">{message}</p>

        {status === "success" && (
          <p className="mt-4 text-sm text-[#74796e]">
            Za chwilę przejdziesz automatycznie do FormaAI.
          </p>
        )}

        {status === "error" && (
          <div className="mt-7 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#6c7c50] px-6 py-3 font-semibold text-white hover:bg-[#505b39]"
            >
              Przejdź do logowania
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-[#6c7c50] px-6 py-3 font-semibold text-[#505b39]"
            >
              Zarejestruj się ponownie
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
