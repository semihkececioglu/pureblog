export function BlogPostsSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-row border border-border animate-pulse">
            <div className="w-36 shrink-0 bg-muted" />
            <div className="p-4 flex flex-col justify-between flex-1 min-w-0" style={{ minHeight: 96 }}>
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-3/4 rounded-full bg-muted" />
                <div className="h-3 w-full rounded-full bg-muted" />
                <div className="h-3 w-2/3 rounded-full bg-muted" />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="h-3 w-28 rounded-full bg-muted" />
                <div className="h-4 w-4 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-border animate-pulse flex flex-col">
          <div className="h-40 bg-muted" />
          <div className="p-5 flex flex-col flex-1">
            <div className="h-5 w-3/4 rounded-full bg-muted mb-2" />
            <div className="h-5 w-1/2 rounded-full bg-muted mb-4" />
            <div className="h-3 w-full rounded-full bg-muted mb-1.5" />
            <div className="h-3 w-5/6 rounded-full bg-muted mb-4" />
            <div className="flex items-center justify-between mt-auto">
              <div className="h-3 w-28 rounded-full bg-muted" />
              <div className="h-4 w-4 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
