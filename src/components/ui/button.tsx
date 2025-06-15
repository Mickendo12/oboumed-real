
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 whitespace-nowrap rounded text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 xs:[&_svg]:size-3.5 sm:[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-6 xs:h-7 sm:h-8 lg:h-9 xl:h-10 px-2 xs:px-2.5 sm:px-3 lg:px-4 py-1 xs:py-1.5 sm:py-2",
        sm: "h-5 xs:h-6 sm:h-7 lg:h-8 rounded px-1.5 xs:px-2 sm:px-2.5 lg:px-3 text-[9px] xs:text-[10px] sm:text-xs",
        lg: "h-8 xs:h-9 sm:h-10 lg:h-11 xl:h-12 rounded px-4 xs:px-5 sm:px-6 lg:px-8",
        icon: "h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 xl:h-10 xl:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
