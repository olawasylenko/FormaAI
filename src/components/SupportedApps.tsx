const programs = [
  "SketchUp",
  "Archicad",
  "Blender",
  "3ds Max",
  "Twinmotion",
  "Revit",
];

export function SupportedApps() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Obsługiwane programy
          </h2>
          <p className="mt-3 text-muted">
            Eksportuj modele bezpośrednio do swojego ulubionego narzędzia
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {programs.map((program) => (
            <div
              key={program}
              className="flex items-center justify-center rounded-xl border border-border bg-white px-4 py-6 text-sm font-semibold text-foreground shadow-sm transition-shadow hover:shadow-md"
            >
              {program}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
