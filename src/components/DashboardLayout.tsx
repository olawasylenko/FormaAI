"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { LoaderCircle } from "lucide-react";

import { auth } from "@/lib/firebase";
import { NewModelWorkspace } from "@/components/NewModelWorkspace";
import { Sidebar, type NavItemId, navItems } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import LoginRequired from "@/components/auth/LoginRequired";

function HomeTab({ user }: { user: User | null }) {
  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm lg:p-12">
        <p className="font-semibold text-primary">
          Narzędzie dla architektów i projektantów wnętrz
        </p>

        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-foreground lg:text-5xl">
          Twórz, porządkuj i wykorzystuj modele 3D w swoich projektach
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-muted lg:text-lg">
          FormaAI pozwala tworzyć modele 3D na podstawie zdjęć produktów,
          zapisywać je w bibliotece i przygotowywać do wykorzystania między
          innymi w SketchUpie, Archicadzie, Blenderze i innych programach.
        </p>

        {!user ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-primary px-6 py-3 text-center font-semibold text-white transition hover:bg-accent"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-primary px-6 py-3 text-center font-semibold text-accent transition hover:bg-primary-light"
            >
              Zarejestruj się
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-primary-light p-5 text-accent">
            <p className="font-semibold">Jesteś zalogowany.</p>
            <p className="mt-1 text-sm">
              Wybierz zakładkę z menu po lewej stronie, aby rozpocząć pracę.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-3 text-sm text-muted">
          Ta sekcja będzie dostępna wkrótce.
        </p>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<NavItemId>("home");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const activeLabel =
    navItems.find((item) => item.id === activeTab)?.label ?? "FormaAI";

  function renderContent() {
    if (authLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center text-accent">
            <LoaderCircle className="mx-auto animate-spin" size={34} />
            <p className="mt-4 text-sm text-muted">
              Sprawdzamy stan logowania...
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === "home") {
      return <HomeTab user={user} />;
    }

    if (!user) {
      return <LoginRequired />;
    }

    if (activeTab === "new-model") {
      return <NewModelWorkspace />;
    }

    return <PlaceholderTab title={activeLabel} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        activeId={activeTab}
        onActiveChange={setActiveTab}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuToggle={() => setCollapsed((value) => !value)} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 lg:px-10 lg:py-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
