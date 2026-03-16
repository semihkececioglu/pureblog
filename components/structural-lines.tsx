const ARM = 10; // px — her yönde kol uzunluğu

const cornerStyles: Record<string, React.CSSProperties> = {
  "top-left":     { top: "-0.5px",    left: "-0.5px",   transform: "translate(-50%, -50%)" },
  "top-right":    { top: "-0.5px",    right: "-0.5px",  transform: "translate(50%, -50%)" },
  "bottom-left":  { bottom: "-0.5px", left: "-0.5px",   transform: "translate(-50%, 50%)" },
  "bottom-right": { bottom: "-0.5px", right: "-0.5px",  transform: "translate(50%, 50%)" },
};

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
  const size = ARM * 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute pointer-events-none text-muted-foreground/60"
      style={cornerStyles[position]}
      aria-hidden="true"
    >
      {/* dikey kol */}
      <line x1={ARM} y1={0} x2={ARM} y2={size} stroke="currentColor" strokeWidth={1} />
      {/* yatay kol */}
      <line x1={0} y1={ARM} x2={size} y2={ARM} stroke="currentColor" strokeWidth={1} />
    </svg>
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
