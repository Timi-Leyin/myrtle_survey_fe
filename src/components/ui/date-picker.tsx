"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  fromYear?: number
  toYear?: number
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  fromYear,
  toYear,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-11 rounded-xl border-slate-300 hover:border-[#27DC85] hover:bg-[#27DC85]/5 transition-all",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) {
              // Set to noon UTC to avoid timezone issues
              const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
              onChange?.(utcDate)
            } else {
              onChange?.(undefined)
            }
            setOpen(false)
          }}
          disabled={(date) => {
            // Disable future dates
            return date > new Date()
          }}
          initialFocus
          fromYear={fromYear}
          toYear={toYear}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}

