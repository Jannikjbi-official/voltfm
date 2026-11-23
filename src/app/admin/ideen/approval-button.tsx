"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import type { EntityFormState } from "@/components/admin/entity-types";
import type { IdeaKind } from "@/lib/ideas";
import { Icon, CheckIcon, CloseIcon, LoadingIcon } from "@/lib/icons";
import { setIdeaApproval } from "./actions";

const initialState: EntityFormState = { status: "idle" };

/** Freigeben bzw. zurücknehmen — ein Knopf je Eintrag. */
export function ApprovalButton({ id, kind, approved }: { id: string; kind: IdeaKind; approved: boolean }) {
  const [state, formAction, pending] = useActionState(setIdeaApproval, initialState);

  return (
    <form action={formAction} className="flex shrink-0 flex-col items-end gap-1">
      <input type="hidden" name="messageId" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="approve" value={approved ? "0" : "1"} />
      <Button type="submit" size="sm" variant={approved ? "tertiary" : "primary"} isDisabled={pending}>
        <Icon icon={pending ? LoadingIcon : approved ? CloseIcon : CheckIcon} spin={pending} />
        {approved ? "Von der Seite nehmen" : "Auf der Seite zeigen"}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-xs text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
