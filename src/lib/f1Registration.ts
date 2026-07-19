// Pure validation for the F1 public intake form (FEAT-001, FR-001). This is
// the app's first genuinely public write surface — a real trust boundary —
// so the schema is extracted and unit-tested directly, unlike the simpler
// board-only forms (createTrip, addParticipant) whose zod schemas live
// inline in their Server Actions.

import { z } from "zod";

// One of the options listed in docs_en/features/FEAT-001_f1_interest_registration.md.
export const SEMESTER_OPTIONS = ["0º", "2º", "4º", "6º", "8º", "Otro"] as const;
export const PASSPORT_STATUS_OPTIONS = [
  "Sí",
  "No",
  "No tengo pasaporte todavía",
  "En proceso de renovación",
] as const;
export const VISA_STATUS_OPTIONS = ["Sí", "No", "En proceso", "No aplica"] as const;

export const f1RegistrationSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  firstName: z.string().min(1, "Nombre(s) requerido"),
  lastName: z.string().min(1, "Apellido(s) requerido"),
  preferredName: z.string().optional(),
  studentId: z
    .string()
    .regex(/^A\d{8}$/, "La matrícula debe tener el formato A########"),
  age: z.coerce.number().int().min(18, "Debes ser mayor o igual a 18 años"),
  career: z.string().min(1, "Carrera requerida"),
  semester: z.enum(SEMESTER_OPTIONS, { message: "Semestre inválido" }),
  phone: z
    .string()
    .regex(/^55\d{8}$/, "El teléfono debe tener el formato 55########"),
  instagram: z.string().optional(),
  nationality: z.string().min(1, "Nacionalidad requerida"),
  passportStatus: z.enum(PASSPORT_STATUS_OPTIONS, { message: "Selecciona una opción válida" }),
  visaStatus: z.enum(VISA_STATUS_OPTIONS, { message: "Selecciona una opción válida" }),
  // A Sí/No radio question (field 15), not a raw checkbox — transformed to
  // boolean here rather than z.coerce.boolean(), which would incorrectly
  // treat the non-empty string "No" as truthy.
  whatsappGroupConsent: z
    .enum(["Sí", "No"], { message: "Selecciona una opción válida" })
    .transform((v) => v === "Sí"),
  // A checkbox that must be checked (field 16). The Server Action converts
  // checkbox presence to an actual boolean before this schema runs.
  // z.literal(true, { message }) does not surface a custom message in this
  // zod version (a literal-specific quirk) — refine() does.
  privacyConsent: z.boolean().refine((v) => v === true, "Debes aceptar el aviso de privacidad"),
});

export type F1RegistrationInput = z.infer<typeof f1RegistrationSchema>;

export type F1ValidationResult =
  | { success: true; data: F1RegistrationInput }
  | { success: false; error: string };

// Wraps zod's result into a single flagged-field error message (TC-002,
// TC-003) — the F1 form has no client-side JS, so validation errors are
// rendered server-side after a redirect, one message at a time.
export function validateF1Registration(input: unknown): F1ValidationResult {
  const parsed = f1RegistrationSchema.safeParse(input);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return { success: false, error: firstIssue?.message ?? "Datos inválidos" };
  }
  return { success: true, data: parsed.data };
}
