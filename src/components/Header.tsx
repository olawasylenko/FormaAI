import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          <span className="text-foreground">Forma</span>
          <span className="text-burgundy">AI</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <a
            href="#jak-to-dziala"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline-block"
          >
            Jak to działa
          </a>
          <button
            type="button"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline-block"
          >
            Moje modele
          </button>
          <button
            type="button"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-burgundy/30 hover:bg-burgundy-light"
          >
            Zaloguj się
          </button>
        </nav>
      </div>
    </header>
  );
}
