"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DollarSign, Minus, Plus, Percent } from "lucide-react"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string
  onChange: (value: number) => void
  showControls?: boolean
  step?: number
  prefix?: 'dollar' | 'percent' | 'none'
}

export function CurrencyInput({ 
  value, 
  onChange, 
  showControls = false,
  step = 1000,
  prefix = 'dollar',
  className,
  disabled,
  ...props 
}: CurrencyInputProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value

  const increment = () => {
    if (!disabled) onChange(numValue + step)
  }

  const decrement = () => {
    if (!disabled) onChange(Math.max(0, numValue - step))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, '')
    onChange(parseFloat(raw) || 0)
  }

  const formatDisplay = (num: number) => {
    if (isNaN(num)) return ''
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Prefix Icon */}
      {prefix === 'dollar' && (
        <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
          <DollarSign className="h-4 w-4" />
        </div>
      )}
      {prefix === 'percent' && (
        <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
          <Percent className="h-4 w-4" />
        </div>
      )}

      {/* Decrement Button */}
      {showControls && (
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || numValue <= 0}
          className="absolute left-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-md border-r border-input transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
      )}

      {/* Input */}
      <input
        type="text"
        inputMode="decimal"
        value={formatDisplay(numValue)}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30",
          prefix === 'dollar' && "pl-8 pr-3",
          prefix === 'percent' && "pl-3 pr-8",
          prefix === 'none' && "px-3",
          showControls && "pl-12 pr-12 text-center"
        )}
        {...props}
      />

      {/* Increment Button */}
      {showControls && (
        <button
          type="button"
          onClick={increment}
          disabled={disabled}
          className="absolute right-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-md border-l border-input transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// Simple number input without currency formatting
interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string
  onChange: (value: number) => void
  showControls?: boolean
  step?: number
}

export function NumberInput({ 
  value, 
  onChange, 
  showControls = true,
  step = 1,
  className,
  disabled,
  min,
  max,
  ...props 
}: NumberInputProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  const minVal = typeof min === 'number' ? min : -Infinity
  const maxVal = typeof max === 'number' ? max : Infinity

  const increment = () => {
    if (!disabled) {
      const newVal = numValue + step
      if (newVal <= maxVal) onChange(newVal)
    }
  }

  const decrement = () => {
    if (!disabled) {
      const newVal = numValue - step
      if (newVal >= minVal) onChange(newVal)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(raw) || 0
    onChange(Math.max(minVal, Math.min(maxVal, parsed)))
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Decrement Button */}
      {showControls && (
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || numValue <= minVal}
          className="absolute left-0 h-full px-2.5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-md border-r border-input transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Input */}
      <input
        type="text"
        inputMode="numeric"
        value={numValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30",
          showControls ? "px-10 text-center" : "px-3"
        )}
        {...props}
      />

      {/* Increment Button */}
      {showControls && (
        <button
          type="button"
          onClick={increment}
          disabled={disabled || numValue >= maxVal}
          className="absolute right-0 h-full px-2.5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-md border-l border-input transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
