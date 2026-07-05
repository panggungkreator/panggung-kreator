"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-zinc-950 group-[.toaster]:text-zinc-900 dark:group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-200 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg rounded-[1.25rem] font-sans font-bold text-xs border p-4 flex items-center gap-3",
          success: "!bg-emerald-50 !text-emerald-800 !border-emerald-250 dark:!bg-emerald-950/20 dark:!text-emerald-400 dark:!border-emerald-900/30",
          error: "!bg-red-50 !text-red-800 !border-red-250 dark:!bg-red-950/20 dark:!text-red-400 dark:!border-red-900/30",
          info: "!bg-sky-50 !text-sky-800 !border-sky-250 dark:!bg-sky-950/20 dark:!text-sky-400 dark:!border-sky-900/30",
          warning: "!bg-amber-50 !text-amber-800 !border-amber-250 dark:!bg-amber-950/20 dark:!text-amber-450 dark:!border-amber-900/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
