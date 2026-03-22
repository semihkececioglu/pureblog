"use client"

import * as React from "react"
import { DayPicker, useDayPicker } from "react-day-picker"
import type { CalendarMonth } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function MonthCaption({ calendarMonth }: { calendarMonth: CalendarMonth; displayIndex: number }) {
  const { previousMonth, nextMonth, goToMonth } = useDayPicker();

  return (
    <div className="flex items-center justify-between h-9 px-1">
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        aria-label="Previous month"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 bg-transparent opacity-50 hover:opacity-100 disabled:pointer-events-none disabled:opacity-25"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium">
        {format(calendarMonth.date, "MMMM yyyy")}
      </span>
      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        aria-label="Next month"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 bg-transparent opacity-50 hover:opacity-100 disabled:pointer-events-none disabled:opacity-25"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "",
        caption_label: "text-sm font-medium",
        nav: "hidden",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-8 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "rounded-md bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption: MonthCaption as React.ComponentType<{ calendarMonth: CalendarMonth; displayIndex: number }>,
      }}
      {...props}
    />
  )
}

export { Calendar }
