"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ICategory } from "@/types";
import AnimatedTabs from "@/components/forgeui/animated-tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, LayoutGrid, List, Search } from "lucide-react";
import { motion } from "motion/react";

interface BlogFiltersProps {
  categories: ICategory[];
  currentCategory: string;
  currentSort: string;
  currentView: "grid" | "list";
  currentSearch: string;
}

const ALL_TAB = "All";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Popular" },
];

export function BlogFilters({
  categories,
  currentCategory,
  currentSort,
  currentView,
  currentSearch,
}: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tabs = [ALL_TAB, ...categories.map((c) => c.name)];
  const activeTabName = currentCategory
    ? (categories.find((c) => c.slug === currentCategory)?.name ?? ALL_TAB)
    : ALL_TAB;

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Newest";

  function buildParams(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    for (const [key, val] of Object.entries(overrides)) {
      if (val === null) params.delete(key);
      else params.set(key, val);
    }
    return params.toString();
  }

  function handleTabChange(tabName: string) {
    const slug =
      tabName === ALL_TAB
        ? null
        : (categories.find((c) => c.name === tabName)?.slug ?? null);
    router.push(`/blog?${buildParams({ category: slug })}`);
  }

  function handleSort(value: string) {
    router.push(`/blog?${buildParams({ sort: value })}`);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const val = e.target.value.trim();
      router.push(`/blog?${buildParams({ search: val || null })}`);
    }, 400);
  }

  function handleView(v: "grid" | "list") {
    router.push(`/blog?${buildParams({ view: v === "grid" ? null : v })}`);
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search posts…"
          defaultValue={currentSearch}
          onChange={handleSearch}
          className="w-full rounded-none border border-border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground hover:bg-accent focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Scrollable tabs — single row, swipeable */}
        <div className="flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatedTabs
            tabs={tabs}
            variant="default"
            activeTab={activeTabName}
            onTabChange={handleTabChange}
          />
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none">
              {activeSortLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className="flex items-center justify-between gap-4"
                >
                  {opt.label}
                  {currentSort === opt.value && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="flex items-center rounded-none border border-border bg-background p-0.5">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => handleView(v)}
                className={`relative flex cursor-pointer items-center justify-center w-7 h-7 rounded-none transition-colors ${
                  currentView === v
                    ? "text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                aria-label={`${v} view`}
              >
                {currentView === v && (
                  <motion.div
                    layoutId="view-toggle-bg"
                    className="absolute inset-0 rounded-none bg-foreground"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {v === "grid" ? (
                    <LayoutGrid className="w-3.5 h-3.5" />
                  ) : (
                    <List className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
