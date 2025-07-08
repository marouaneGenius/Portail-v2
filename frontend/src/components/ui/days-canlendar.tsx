// components/DaysCalendar.tsx
"use client"

import * as React from "react"
import {DayPicker } from "react-day-picker"
import { fr } from "react-day-picker/locale";
import { cn } from "@/lib/utils"
import "react-day-picker/style.css";
import { Calendar } from "lucide-react"

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
  buttonClassName = "w-full min-h-[48px]", // Ajouté
}: DaysCalendarProps & { buttonClassName?: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col">
      <label className="mb-2 font-medium flex items-center gap-2">
        <Calendar className="w-5 h-5 text-crazy-magenta" />
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              buttonClassName,
              "justify-between font-normal rounded-xl border-2 border-fading-grey bg-white text-mister-anthracite px-4 py-3 shadow-sm transition-all focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow",
              !value && "text-mister-anthracite/40"
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
            locale={fr}
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChange(date)
                setOpen(false)
              }
            }}
            className="p-4"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
