"use client";

import {
  Clock,
  CreditCard,
  Home,
  Plus,
  Settings,
  Library,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const navItems = [
  { id: "home", label: "Strona główna", icon: Home },
  { id: "new-model", label: "Nowy model", icon: Plus },
  { id: "library", label: "Biblioteka", icon: Library },
  { id: "subscription", label: "Subskrypcja", icon: CreditCard },
  { id: "history", label: "Historia", icon: Clock },
  { id: "settings", label: "Ustawienia", icon: Settings },
] as const;

export type NavItemId = (typeof navItems)[number]["id"];

interface SidebarProps {
  collapsed: boolean;
  activeId: NavItemId;
  onActiveChange: (id: NavItemId) => void;
}

export function Sidebar({ collapsed, activeId, onActiveChange }: SidebarProps) {
  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-border bg-white transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {navItems.map((item) => {
          const isActive =
            item.id !== "home" && activeId === item.id;
          const Icon = item.icon as LucideIcon;

          return (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => {
                if (item.id === "home") {
                  window.location.href = "/";
                  return;
                }

                onActiveChange(item.id);
              }}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary-light text-accent shadow-sm"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div
        className={`border-t border-border py-5 ${
          collapsed ? "px-3 text-center" : "px-5"
        }`}
      >
        {collapsed ? (
          <div className="text-sm font-semibold text-accent">F</div>
        ) : (
          <>
            <div className="text-base font-semibold tracking-tight">
              <span className="text-foreground">Forma</span>
              <span className="text-primary">AI</span>
            </div>
            <p className="mt-1 text-xs text-muted">v0.1.0 Alpha</p>
          </>
        )}
      </div>
    </aside>
  );
}
