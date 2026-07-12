"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function LoginRequired() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-[#d8d3c7] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f1e8] text-[#505b39]">
          <LockKeyhole size={30} />
        </div>

        <h1 className="text-3xl font-semibold text-[#2d3028]">
          Zaloguj się, aby kontynuować
        </h1>

        <p className="mt-4 text-base leading-7 text-[#6f7268]">
          Aby korzystać z tej funkcji FormaAI, zaloguj się lub utwórz bezpłatne konto.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-[#6c7c50] px-6 py-3 font-medium text-white transition hover:bg-[#505b39]"
          >
            Zaloguj się
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-[#6c7c50] px-6 py-3 font-medium text-[#505b39] transition hover:bg-[#f0f1e8]"
          >
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
}
