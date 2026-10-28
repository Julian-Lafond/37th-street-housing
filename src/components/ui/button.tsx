import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ink" | "primary-dark" | "secondary-dark";
type Size = "md" | "lg";

// A fill rises through the pill on hover (::before, transform only); presses
// scale down slightly for tactile feedback.
const base =
  "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-[0.01em] select-none " +
  "transition-[color,border-color,transform] duration-(--dur-micro) ease-(--ease-transition) active:scale-[0.97] " +
  "before:absolute before:inset-0 before:-z-10 before:translate-y-[101%] before:rounded-[inherit] before:transition-transform before:duration-(--dur-ui) before:ease-(--ease-transition) hover:before:translate-y-0";

const variants: Record<Variant, string> = {
  primary: "bg-terracotta text-plaster before:bg-terracotta-deep",
  secondary: "border border-ink/80 text-ink before:bg-ink hover:text-plaster",
  ink: "bg-ink text-plaster before:bg-dusk",
  "primary-dark": "bg-sunset text-ink before:bg-peach",
  "secondary-dark": "border border-plaster/70 text-plaster before:bg-plaster hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
