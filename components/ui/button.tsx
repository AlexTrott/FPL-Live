import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-pl-purple to-pl-pink text-white hover:from-pl-pink hover:to-pl-purple shadow-lg",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg",
        outline:
          "glass-dark border border-white/20 text-white hover:bg-white/10",
        secondary:
          "bg-gradient-to-r from-pl-green to-emerald-400 text-black hover:from-emerald-400 hover:to-pl-green shadow-lg",
        ghost: "text-white/80 hover:text-white hover:bg-white/10",
        link: "text-pl-green underline-offset-4 hover:underline hover:text-pl-cyan",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
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