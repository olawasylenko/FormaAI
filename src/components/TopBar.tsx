interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
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
          🪙 245 kredytów
        </div>
        <button
          type="button"
          className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary-light"
        >
          👤 Moje konto
        </button>
      </div>
    </header>
  );
}
