import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Common {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
}

const control = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-paper px-3.5 py-2.5 text-[15px] text-charcoal placeholder:text-muted/80 transition-colors focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20",
    error ? "border-danger" : "border-line hover:border-muted/60",
  );

function Wrapper({ id, label, required, hint, error, children }: Common & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-danger" aria-hidden>*</span> : <span className="ml-2 font-normal text-muted">facultatif</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

const aria = (id: string, hint: ReactNode, error?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

export function TextInput({ id, label, required, hint, error, ...rest }: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">) {
  return (
    <Wrapper {...{ id, label, required, hint, error }}>
      <input id={id} aria-required={required} className={control(error)} {...aria(id, hint, error)} {...rest} />
    </Wrapper>
  );
}

export function TextArea({ id, label, required, hint, error, ...rest }: Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">) {
  return (
    <Wrapper {...{ id, label, required, hint, error }}>
      <textarea id={id} aria-required={required} className={cn(control(error), "resize-y leading-relaxed")} {...aria(id, hint, error)} {...rest} />
    </Wrapper>
  );
}
