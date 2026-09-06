import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base transition-[background-color,border-color,color] duration-150 ease-out motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
