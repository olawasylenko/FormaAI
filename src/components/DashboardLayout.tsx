"use client";

import { useState } from "react";

import { LibraryPanel } from "@/components/LibraryPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { NewModelWorkspace } from "@/components/NewModelWorkspace";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SubscriptionPanel } from "@/components/SubscriptionPanel";
import {
  Sidebar,
  type NavItemId,
  navItems,
} from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          {title}
        </h1>

        <p className="mt-3 text-sm text-muted">
          Ta sekcja będzie dostępna wkrótce.
        </p>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] =
    useState<NavItemId>("new-model");

  const activeLabel =
    navItems.find((item) => item.id === activeTab)?.label ??
    "FormaAI";

  function renderContent() {
    if (activeTab === "new-model") {
      return <NewModelWorkspace />;
    }

    if (activeTab === "library") {
      return <LibraryPanel />;
    }

    if (activeTab === "subscription") {
      return <SubscriptionPanel />;
    }

    if (activeTab === "history") {
      return <HistoryPanel />;
    }

    if (activeTab === "settings") {
      return <SettingsPanel />;
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
        <TopBar
          onMenuToggle={() =>
            setCollapsed((current) => !current)
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 lg:px-10 lg:py-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
