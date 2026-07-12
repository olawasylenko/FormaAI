"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Wysłaliśmy link do ustawienia nowego hasła.");
    } catch {
      setError("Nie udało się wysłać wiadomości. Sprawdź adres e-mail.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#d8d3c7] bg-white p-8 shadow-lg">
        <Link href="/" className="text-2xl font-bold">
          Forma<span className="text-[#6c7c50]">AI</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Reset hasła</h1>
        <p className="mt-2 text-[#6b7064]">
          Wpisz e-mail przypisany do konta.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#d8d3c7] px-4 py-3 outline-none focus:border-[#6c7c50]"
          />

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
            className="w-full rounded-xl bg-[#6c7c50] px-5 py-3 font-semibold text-white hover:bg-[#505b39]"
          >
            Wyślij link
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-[#505b39]"
        >
          Wróć do logowania
        </Link>
      </div>
    </main>
  );
}
