import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-card",
        navy: "bg-navy text-navy-foreground hover:bg-navy/90",
        outline: "border-2 border-navy/20 bg-card text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        whatsapp: "bg-success text-success-foreground hover:bg-success/90 shadow-card",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-[0.95rem]",
        lg: "h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof buttonStyles>;

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"a"> & ButtonVariants) {
  return <a className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

export function ButtonRoute({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return <Link className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-2xl border bg-card p-6 text-card-foreground shadow-card", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint && !error ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      {error ? (
        <span role="alert" className="block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border bg-card px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25",
        className,
      )}
      {...props}
    />
  );
}
