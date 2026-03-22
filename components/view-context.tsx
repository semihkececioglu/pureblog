"use client";

import { createContext, useContext, useState } from "react";

interface ViewContextValue {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}

const ViewContext = createContext<ViewContextValue>({
  view: "grid",
  setView: () => {},
});

export function ViewProvider({
  children,
  initialView,
}: {
  children: React.ReactNode;
  initialView: "grid" | "list";
}) {
  const [view, setView] = useState<"grid" | "list">(initialView);
  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}
