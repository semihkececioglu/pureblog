"use client";

import { useEffect, useRef, useState } from "react";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";

interface Props {
  slug: string;
  initialViews: number;
}

export function ViewCounter({ slug, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch(`/api/posts/${slug}/view`, { method: "POST" }).then(() => {
      setViews((v) => v + 1);
    });
  }, [slug]);

  return (
    <span className="text-sm font-medium inline-flex">
      <SlidingNumber value={views} />
    </span>
  );
}
