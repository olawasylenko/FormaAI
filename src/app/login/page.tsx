"use client";

import Link from "next/link";
import { useState } from "react";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");
    setUnverified(false);
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await result.user.reload();

      if (!result.user.emailVerified) {
        setUnverified(true);
        setError(
          "Adres e-mail nie został jeszcze potwierdzony. Możesz wysłać nowy link."
        );
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Nieprawidłowy e-mail lub hasło.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (!auth.currentUser) {
      setError("Najpierw wpisz dane i kliknij „Zaloguj się”.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    try {
      auth.languageCode = "pl";

      await sendEmailVerification(auth.currentUser, {
        url: "https://forma-ai-alpha.vercel.app/login",
        handleCodeInApp: false,
      });

      setMessage(
        "Nowy link został wysłany. Otwórz najnowszą wiadomość i sprawdź również folder Spam."
      );
    } catch {
      setError(
        "Nie udało się wysłać nowego linku. Odczekaj chwilę i spróbuj ponownie."
      );
    } finally {
      setResending(false);
    }
  }

  async function checkVerification() {
    if (!auth.currentUser) {
      setError("Najpierw wpisz dane i kliknij „Zaloguj się”.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        router.push("/dashboard");
        return;
      }

      setError(
        "Adres nadal nie jest potwierdzony. Kliknij link z najnowszej wiadomości."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#d8d3c7] bg-white p-8 shadow-lg">
        <Link href="/" className="text-2xl font-bold">
          Forma<span className="text-[#6c7c50]">AI</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Zaloguj się</h1>

        <p className="mt-2 text-[#6b7064]">
          Uzyskaj dostęp do swoich projektów i modeli.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">E-mail</label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d8d3c7] px-4 py-3 outline-none focus:border-[#6c7c50]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Hasło</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#d8d3c7] py-3 pl-4 pr-12 outline-none focus:border-[#6c7c50]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#6b7064] hover:bg-[#f1f0e9]"
                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6c7c50] px-5 py-3 font-semibold text-white hover:bg-[#505b39] disabled:opacity-60"
          >
            {loading ? "Sprawdzanie..." : "Zaloguj się"}
          </button>
        </form>

        {unverified && (
          <div className="mt-5 rounded-2xl border border-[#d8d3c7] bg-[#f7f5ef] p-5">
            <div className="flex items-start gap-3">
              <MailCheck className="mt-0.5 shrink-0 text-[#505b39]" size={22} />

              <div>
                <p className="font-semibold">Potwierdź adres e-mail</p>
                <p className="mt-1 text-sm leading-6 text-[#6b7064]">
                  Wyślij nową wiadomość albo sprawdź status po kliknięciu linku.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={resendVerification}
                disabled={resending}
                className="rounded-xl border border-[#6c7c50] px-4 py-3 text-sm font-semibold text-[#505b39] hover:bg-white disabled:opacity-60"
              >
                {resending ? "Wysyłanie..." : "Wyślij nowy link"}
              </button>

              <button
                type="button"
                onClick={checkVerification}
                disabled={loading}
                className="rounded-xl bg-[#6c7c50] px-4 py-3 text-sm font-semibold text-white hover:bg-[#505b39] disabled:opacity-60"
              >
                Sprawdź potwierdzenie
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 text-center text-sm">
          <Link href="/reset-password" className="text-[#505b39] underline">
            Nie pamiętasz hasła?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-[#6b7064]">
          Nie masz konta?{" "}
          <Link href="/register" className="font-semibold text-[#505b39]">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </main>
  );
}
