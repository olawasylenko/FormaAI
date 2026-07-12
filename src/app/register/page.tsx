"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (password !== repeatPassword) {
      setError("Hasła nie są takie same.");
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków.");
      return;
    }

    setLoading(true);

    try {
      auth.languageCode = "pl";

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false,
      });

      setRegistered(true);
    } catch {
      setError(
        "Nie udało się utworzyć konta. Ten adres e-mail może być już używany."
      );
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6">
        <div className="w-full max-w-lg rounded-3xl border border-[#d8d3c7] bg-white p-9 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9edde] text-[#505b39]">
            <MailCheck size={32} />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Sprawdź swoją skrzynkę e-mail
          </h1>

          <p className="mt-4 leading-7 text-[#64695e]">
            Wysłaliśmy wiadomość z linkiem potwierdzającym na adres:
          </p>

          <p className="mt-2 font-semibold text-[#505b39]">{email}</p>

          <div className="mt-6 rounded-2xl bg-[#f7f5ef] p-5 text-left text-sm leading-6 text-[#5f6459]">
            <strong>Nie widzisz wiadomości?</strong>
            <br />
            Sprawdź folder <strong>Spam</strong>, <strong>Oferty</strong> lub
            <strong> Inne</strong>. Dostarczenie wiadomości może potrwać kilka
            minut.
          </div>

          <p className="mt-6 text-sm leading-6 text-[#6b7064]">
            Po kliknięciu linku w wiadomości wrócisz do FormaAI i zostaniesz
            automatycznie przeniesiony do aplikacji.
          </p>

          <Link
            href="/"
            className="mt-7 inline-block rounded-xl border border-[#6c7c50] px-6 py-3 font-semibold text-[#505b39] hover:bg-[#f0f2e9]"
          >
            Wróć na stronę główną
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#d8d3c7] bg-white p-8 shadow-lg">
        <Link href="/" className="text-2xl font-bold">
          Forma<span className="text-[#6c7c50]">AI</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Utwórz konto</h1>

        <p className="mt-2 text-[#6b7064]">
          Zacznij tworzyć własną bibliotekę modeli 3D.
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
                autoComplete="new-password"
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

          <div>
            <label className="mb-2 block text-sm font-medium">
              Powtórz hasło
            </label>

            <div className="relative">
              <input
                type={showRepeatPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full rounded-xl border border-[#d8d3c7] py-3 pl-4 pr-12 outline-none focus:border-[#6c7c50]"
              />

              <button
                type="button"
                onClick={() => setShowRepeatPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#6b7064] hover:bg-[#f1f0e9]"
                aria-label={
                  showRepeatPassword ? "Ukryj hasło" : "Pokaż hasło"
                }
              >
                {showRepeatPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6c7c50] px-5 py-3 font-semibold text-white hover:bg-[#505b39] disabled:opacity-60"
          >
            {loading ? "Tworzenie konta..." : "Zarejestruj się"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7064]">
          Masz już konto?{" "}
          <Link href="/login" className="font-semibold text-[#505b39]">
            Zaloguj się
          </Link>
        </p>
      </div>
    </main>
  );
}
