"use client";

import { useId } from "react";
import { Alert, cn } from "@heroui/react";

/*
 * Formularfelder fuer Server Actions.
 *
 * Bewusst native <input>, <textarea> und <select> mit HeroUIs Klassen
 * (`input`, `textarea`, `label`, `description`): Sie landen ohne Umweg im
 * FormData, das die Server Actions erwarten, und Browser-Pruefungen wie
 * `required` greifen. Label und Hinweis haengen ueber eine gemeinsame ID am
 * Feld (`htmlFor` bzw. `aria-describedby`).
 */

type Shared = {
  label: React.ReactNode;
  /** Hinweis unter dem Feld. */
  description?: React.ReactNode;
  /** Fehlermeldung unter dem Feld; markiert das Feld als ungueltig. */
  error?: string;
  className?: string;
};

/** Label, Feld und Hinweis mit gemeinsamer ID. */
function FieldShell({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: Shared & { id: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("label", required && "label--required")}>
        {label}
      </label>
      {children}
      {description && (
        <p id={`${id}-hint`} className="description">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, description: unknown, error: unknown): string | undefined {
  const ids = [description ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function TextField({
  label,
  description,
  error,
  className,
  id: givenId,
  ...input
}: Shared & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={input.required}
      className={className}
    >
      <input
        id={id}
        className="input w-full"
        aria-describedby={describedBy(id, description, error)}
        aria-invalid={error ? true : undefined}
        data-invalid={error ? "true" : undefined}
        {...input}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  description,
  error,
  className,
  id: givenId,
  ...textarea
}: Shared & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={textarea.required}
      className={className}
    >
      <textarea
        id={id}
        className="textarea w-full leading-relaxed"
        aria-describedby={describedBy(id, description, error)}
        aria-invalid={error ? true : undefined}
        data-invalid={error ? "true" : undefined}
        {...textarea}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  description,
  error,
  className,
  options,
  id: givenId,
  ...select
}: Shared &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
    options: { value: string; label: string }[];
  }) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={select.required}
      className={className}
    >
      <div className="relative">
        <select
          id={id}
          className="input w-full appearance-none pr-9"
          aria-describedby={describedBy(id, description, error)}
          aria-invalid={error ? true : undefined}
          {...select}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </FieldShell>
  );
}

/** Ein Haekchen mit Text daneben — der ganze Text ist anklickbar. */
export function CheckboxField({
  label,
  description,
  className,
  id: givenId,
  ...input
}: Omit<Shared, "error"> & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "type">) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer rounded accent-[var(--volt)]"
        aria-describedby={description ? `${id}-hint` : undefined}
        {...input}
      />
      <div className="min-w-0">
        <label htmlFor={id} className="label cursor-pointer">
          {label}
        </label>
        {description && (
          <p id={`${id}-hint`} className="description mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Rueckmeldung einer Server Action ueber dem Formular. `role` ist "alert"
 * bei Fehlern, sonst "status" — so sagt ein Screenreader beides an.
 */
export function FormMessage({
  status,
  children,
  className,
}: {
  status: "success" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Alert
      status={status === "success" ? "success" : status === "error" ? "danger" : "default"}
      role={status === "error" ? "alert" : "status"}
      className={className}
    >
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
