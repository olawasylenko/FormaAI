"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Sprawdzamy potwierdzenie adresu e-mail...");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMessage(
          "Adres został potwierdzony. Zaloguj się, aby przejść do aplikacji."
        );

        window.setTimeout(() => {
          router.replace("/login");
        }, 2000);

        return;
      }

      async function checkVerification() {
        if (!auth.currentUser) return;

        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {
          setVerified(true);
          setMessage("Adres e-mail został potwierdzony.");

          if (interval) {
            clearInterval(interval);
          }

          window.setTimeout(() => {
            router.replace("/dashboard");
          }, 1200);
        }
      }

      await checkVerification();

      interval = setInterval(checkVerification, 1500);
    });

    return () => {
      unsubscribe();

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#d8d3c7] bg-white p-9 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9edde] text-[#505b39]">
          {verified ? (
            <CheckCircle2 size={34} />
          ) : (
            <LoaderCircle className="animate-spin" size={34} />
          )}
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          {verified ? "Konto aktywne" : "Potwierdzanie konta"}
        </h1>

        <p className="mt-4 leading-7 text-[#64695e]">{message}</p>

        {!verified && (
          <p className="mt-4 text-sm text-[#777b72]">
            Za chwilę nastąpi automatyczne przekierowanie.
          </p>
        )}
      </div>
    </main>
  );
}
