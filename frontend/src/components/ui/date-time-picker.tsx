"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Initialisation à partir de la prop (UTC → locale)
  const { initDate, initTime } = React.useMemo(() => {
    if (!value) return { initDate: undefined, initTime: "10:30:00" }
    const local = new Date(value.getTime() + value.getTimezoneOffset() * 60000)
    return {
      initDate: local,
      initTime: local.toTimeString().slice(0, 8),
    }
  }, [value])

  const [date, setDate] = React.useState<Date|undefined>(initDate)
  const [time, setTime] = React.useState<string>(initTime)

  // Fonction de commit date+time en UTC
  const commit = React.useCallback((d: Date, t: string) => {
    const [h, m, s] = t.split(":").map(Number)
    const combined = new Date(d)
    combined.setHours(h, m, s, 0)
    const utc = new Date(combined.getTime() - combined.getTimezoneOffset() * 60000)
    onChange(utc)
  }, [onChange])

  // Handlers qui appellent commit **une seule fois**
  const handleDateChange = (d: Date) => {
    setDate(d)
    setOpen(false)
    if (time) commit(d, time)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value
    setTime(t)
    if (date) commit(date, t)
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="date-picker">Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Sélectionner"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start">
            <Calendar
              mode="single"
              required={false} 
              selected={date}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="time-picker">Heure</Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={handleTimeChange}
          className="bg-background"
        />
      </div>
    </div>
  )
}
