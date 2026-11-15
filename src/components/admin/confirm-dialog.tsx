"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertDialog, Button } from "@heroui/react";
import { Icon, DeleteIcon, LoadingIcon } from "@/lib/icons";

type FormAction = (formData: FormData) => void | Promise<void>;

/**
 * Rueckfrage vor einer Aktion, die sich nicht rueckgaengig machen laesst.
 *
 * Der Dialog enthaelt ein eigenes <form>, das die Server Action mit echtem
 * FormData aufruft (`fields` als versteckte Felder, `children` fuer weitere
 * Eingaben wie einen Sperrgrund). Er liegt in einem Portal, also nie in einem
 * anderen Formular verschachtelt.
 */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  action,
  fields,
  confirmLabel,
  pending = false,
  status = "danger",
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  action: FormAction;
  fields: Record<string, string>;
  confirmLabel: string;
  pending?: boolean;
  status?: "danger" | "warning" | "accent";
  children?: React.ReactNode;
}) {
  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-[28rem]">
          <form action={action} className="contents">
            {Object.entries(fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <AlertDialog.Header>
              <AlertDialog.Icon status={status} />
              <AlertDialog.Heading className="font-wide">{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-4 text-sm leading-relaxed">
              {description && <div>{description}</div>}
              {children}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button type="button" variant="tertiary" onPress={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <ConfirmButton
                label={confirmLabel}
                pending={pending}
                variant={status === "danger" ? "danger" : "primary"}
              />
            </AlertDialog.Footer>
          </form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}

/** Der Bestaetigungsknopf kennt den Zustand seines Formulars selbst. */
function ConfirmButton({
  label,
  pending,
  variant,
}: {
  label: string;
  pending: boolean;
  variant: "danger" | "primary";
}) {
  const status = useFormStatus();
  const busy = pending || status.pending;
  return (
    <Button type="submit" variant={variant} isPending={busy}>
      <Icon icon={busy ? LoadingIcon : DeleteIcon} spin={busy} />
      {label}
    </Button>
  );
}

/**
 * Ein "Löschen"-Knopf mit Rueckfrage, fuer Server-Seiten (z. B. den Artikel
 * im Editor), deren Action nach dem Loeschen selbst weiterleitet.
 */
export function ConfirmDeleteButton({
  action,
  fields,
  title,
  description,
  label = "Löschen",
}: {
  action: FormAction;
  fields: Record<string, string>;
  title: string;
  description?: React.ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="danger-soft" size="sm" onPress={() => setOpen(true)}>
        <Icon icon={DeleteIcon} />
        {label}
      </Button>
      <ConfirmDialog
        isOpen={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        fields={fields}
        confirmLabel={label}
        action={action}
      />
    </>
  );
}
