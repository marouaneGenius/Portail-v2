// components/DaysCalendar.tsx
"use client"

import * as React from "react"
import {DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

// shadcn/ui popover primitives
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon } from "lucide-react"

interface DaysCalendarProps {
  value?: Date
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
}

export function DaysCalendar({
  value,
  onChange,
  label = "Sélectionnez une date",
  placeholder = "— Choisir —",
}: DaysCalendarProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-40 justify-between font-normal",
              !value && "text-gray-400"
            )}
          >
            {value
              ? value.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
              : placeholder}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChange(date)
                setOpen(false)
              }
            }}
            showOutsideDays
            className="p-4"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
