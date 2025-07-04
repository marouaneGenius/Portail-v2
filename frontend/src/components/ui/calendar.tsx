import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { fr } from "date-fns/locale"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 min-w-[350px] min-h-[400px]", className)}
      classNames={{
        ...classNames,
        table: "w-full text-base",
        head_row: "text-sm",
        cell: "h-12 w-12", // cases plus grandes
        day: "rounded-lg text-base px-4 py-2 hover:bg-blue-100 focus:bg-blue-200 transition",

      }}
      {...props}
      locale={fr}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
