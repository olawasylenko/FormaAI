"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await result.user.reload();

      if (!result.user.emailVerified) {
        setError(
          "Adres e-mail nie został jeszcze potwierdzony. Sprawdź również folder Spam."
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6c7c50] px-5 py-3 font-semibold text-white hover:bg-[#505b39] disabled:opacity-60"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

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
