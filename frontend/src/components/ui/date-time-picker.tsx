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

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const t = e.target.value;

    console.log(t)
    setTime(t);
    if (date) commit(date, t);
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-1 w-full">
        <Label htmlFor="date-picker">Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal w-full"
            >
              {/* {date ? date.toLocaleDateString() : "Sélectionner"} */}
              {date ? date.toLocaleDateString("fr-FR") : "Sélectionner"}

              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto w-full" align="start">
            <Calendar
              mode="single"
              required={false} 
              selected={date}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1  w-full ">
        <Label htmlFor="time-picker">Heure</Label>
        {/* <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={handleTimeChange}
          className="bg-background"
        /> */}
        <select
          id="time-picker"
          value={time}
          onChange={handleTimeChange}
          className="bg-background border rounded px-2 py-1 h-full"
        >
          <option value="">Choisir une heure</option>
          <option value="09:30:00">09:30</option>
          <option value="11:00:00">11:00</option>
          <option value="13:30:00">13:30</option>
          <option value="15:00:00">15:00</option>
          <option value="16:30:00">16:30</option>
          <option value="18:00:00">18:00</option>
        </select>

      </div>
    </div>
  )
}
