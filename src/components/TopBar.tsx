"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useCreditAccount } from "@/hooks/useCreditAccount";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const {
    summary: creditSummary,
    loading: creditsLoading,
  } = useCreditAccount();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload();
        setUser(auth.currentUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function handleLogout() {
    await signOut(auth);
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  }

  const accountName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Moje konto";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-white px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Zwiń lub rozwiń menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-foreground transition-colors hover:bg-primary-light"
        >
          ☰
        </button>

        <div className="truncate text-lg font-semibold tracking-tight">
          <span className="text-foreground">Forma</span>
          <span className="text-primary">AI</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="whitespace-nowrap rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm">
          🪙{" "}
          {creditsLoading
            ? "..."
            : `${creditSummary?.totalCredits ?? 0} kredytów`}
        </div>

        {loading ? (
          <div className="h-10 w-32 animate-pulse rounded-full bg-background" />
        ) : user ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary-light"
              aria-expanded={profileOpen}
            >
              <UserRound size={17} />
              <span className="max-w-[160px] truncate">{accountName}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
                <div className="border-b border-border px-4 py-4">
                  <p className="truncate font-semibold text-foreground">
                    {accountName}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted">
                    {user.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Wyloguj się
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-accent hover:bg-primary-light"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
            >
              Zarejestruj się
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
