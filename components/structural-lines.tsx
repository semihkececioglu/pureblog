export function VerticalLines() {
  return (
    <>
      <span
        className="fixed top-0 bottom-0 w-px bg-border opacity-40 pointer-events-none z-10"
        style={{ left: "max(1rem, calc(50% - 24rem))" }}
        aria-hidden="true"
      />
      <span
        className="fixed top-0 bottom-0 w-px bg-border opacity-40 pointer-events-none z-10"
        style={{ right: "max(1rem, calc(50% - 24rem))" }}
        aria-hidden="true"
      />
    </>
  );
}

export function CornerMark({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const positionStyles = {
    "top-left": { top: -1, left: -1 },
    "top-right": { top: -1, right: -1 },
    "bottom-left": { bottom: -1, left: -1 },
    "bottom-right": { bottom: -1, right: -1 },
  };

  return (
    <span
      className="absolute w-3 h-3 pointer-events-none"
      style={positionStyles[position]}
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground opacity-60" />
      <span className="absolute top-1/2 left-0 right-0 h-px bg-muted-foreground opacity-60" />
    </span>
  );
}

export function CardWithCorners({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative border border-border ${className}`}>
      <CornerMark position="top-left" />
      <CornerMark position="top-right" />
      <CornerMark position="bottom-left" />
      <CornerMark position="bottom-right" />
      {children}
    </div>
  );
}
