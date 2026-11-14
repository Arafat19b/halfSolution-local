import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "soft" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-olive text-paper hover:bg-olive-dark disabled:hover:bg-olive",
  secondary: "bg-paper text-charcoal border border-line hover:border-muted",
  soft: "bg-sage text-olive-dark hover:bg-[#E1EAD9]",
  ghost: "text-charcoal hover:bg-sage",
  danger: "bg-paper text-danger border border-line hover:border-danger",
};

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: Variant;
  href?: string;
  icon?: ReactNode;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
}

export function Button({ variant = "primary", href, icon, size = "md", className, children, ...rest }: Props) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    size === "md" ? "min-h-11 px-4 text-sm" : "min-h-9 px-3 text-sm",
    VARIANTS[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {icon}
      {children}
    </button>
  );
}
