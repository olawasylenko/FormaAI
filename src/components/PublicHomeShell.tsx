"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Home,
  Library,
  LogIn,
  Menu,
  Plus,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const publicNavItems = [
  {
    id: "home",
    label: "Strona główna",
    icon: Home,
  },
  {
    id: "new-model",
    label: "Nowy model",
    icon: Plus,
  },
  {
    id: "library",
    label: "Biblioteka",
    icon: Library,
  },
  {
    id: "subscription",
    label: "Subskrypcja",
    icon: CreditCard,
  },
  {
    id: "history",
    label: "Historia",
    icon: Clock,
  },
  {
    id: "settings",
    label: "Ustawienia",
    icon: Settings,
  },
] as const;

type PublicNavId = (typeof publicNavItems)[number]["id"];

export function PublicHomeShell({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [activeView, setActiveView] =
    useState<PublicNavId>("home");

  const activeItem = publicNavItems.find(
    (item) => item.id === activeView
  );

  const ActiveViewIcon = activeItem?.icon;

  function handleNavigation(itemId: PublicNavId) {
    setActiveView(itemId);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-[60] hidden flex-col border-r border-[#d8d3c7] bg-white transition-all duration-300 md:flex ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <div
          className={`flex h-20 shrink-0 items-center border-b border-[#d8d3c7] ${
            collapsed
              ? "justify-center px-3"
              : "justify-between px-5"
          }`}
        >
          {!collapsed && (
            <div className="text-xl font-bold tracking-tight">
              Forma<span className="text-[#6c7c50]">AI</span>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setCollapsed((current) => !current)
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#686d62] transition hover:bg-[#eef0e7] hover:text-[#505b39]"
            aria-label={
              collapsed ? "Otwórz menu" : "Zamknij menu"
            }
            title={collapsed ? "Otwórz menu" : "Zamknij menu"}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {publicNavItems.map((item) => {
            const Icon = item.icon as LucideIcon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                title={collapsed ? item.label : undefined}
                onClick={() => handleNavigation(item.id)}
                className={`flex w-full items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed
                    ? "justify-center px-0 py-3"
                    : "gap-3 px-3 py-3"
                } ${
                  isActive
                    ? "bg-[#eef0e7] text-[#505b39] shadow-sm"
                    : "text-[#74796e] hover:bg-[#f7f5ef] hover:text-[#25291f]"
                }`}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={1.75}
                />

                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-t border-[#d8d3c7] px-5 py-5">
            <p className="text-xs text-[#74796e]">
              FormaAI
            </p>
          </div>
        )}
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "md:pl-[72px]" : "md:pl-[260px]"
        }`}
      >
        <div className="relative min-h-screen">
          {children}

          {activeView !== "home" && activeItem && (
            <div
              className={`fixed bottom-0 right-0 top-20 z-40 flex items-center justify-center overflow-y-auto bg-[#f7f5ef] px-6 py-10 ${
                collapsed ? "left-0 md:left-[72px]" : "left-0 md:left-[260px]"
              }`}
            >
              <div className="w-full max-w-2xl rounded-[28px] border border-[#d8d3c7] bg-white px-8 py-12 text-center shadow-xl shadow-[#505b39]/10 sm:px-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef0e7]">
                  {ActiveViewIcon && (
                    <ActiveViewIcon
                      className="h-8 w-8 text-[#6c7c50]"
                      strokeWidth={1.6}
                    />
                  )}
                </div>

                <p className="mt-6 text-sm font-semibold text-[#6c7c50]">
                  {activeItem.label}
                </p>

                <h1 className="mt-3 text-2xl font-bold text-[#25291f] sm:text-3xl">
                  Ta funkcja wymaga zalogowania
                </h1>

                <p className="mx-auto mt-4 max-w-lg leading-7 text-[#686d62]">
                  Zaloguj się, aby korzystać z tej
                  funkcji i uzyskać dostęp do swojego konta FormaAI.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6c7c50] px-6 py-3.5 font-semibold text-white transition hover:bg-[#505b39]"
                  >
                    <LogIn className="h-5 w-5" />
                    Zaloguj się
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleNavigation("home")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c8cdb9] bg-white px-6 py-3.5 font-semibold text-[#505b39] transition hover:bg-[#eef0e7]"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Wróć do strony głównej
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
