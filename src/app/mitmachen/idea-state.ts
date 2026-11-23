/** Rückmeldung des Ideen-Formulars (Nachbardatei, weil "use server" nur Funktionen exportieren darf). */
export type IdeaState = {
  status: "idle" | "success" | "info" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};
