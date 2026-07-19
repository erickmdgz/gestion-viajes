import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import {
  SEMESTER_OPTIONS,
  PASSPORT_STATUS_OPTIONS,
  VISA_STATUS_OPTIONS,
} from "@/lib/f1Registration";
import { registerParticipant } from "@/app/apply/[tripId]/actions";

// Public F1 intake form (FR-001) — no session, no board-only fields. Field
// labels and consent copy are the user-facing (ES) strings from
// docs_en/features/FEAT-001_f1_interest_registration.md, taken verbatim.
export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { tripId } = await params;
  const { error } = await searchParams;
  const trip = await getTripById(tripId);
  if (!trip) notFound();

  const registerForTrip = registerParticipant.bind(null, tripId);

  return (
    <main>
      <h1>{trip.name}</h1>
      <p>
        Registro de interés para la misión internacional. Completa este formulario si deseas recibir
        información detallada y comenzar tu proceso de aplicación. Este formulario no confirma tu
        lugar en la misión. La confirmación dependerá del cumplimiento de los siguientes pasos del
        proceso: revisión de información, firma de contrato, pago inicial y entrega de información
        complementaria cuando sea solicitada.
      </p>

      <form className="card" action={registerForTrip}>
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="firstName">Nombre(s)</label>
        <input id="firstName" name="firstName" type="text" required />

        <label htmlFor="lastName">Apellido(s)</label>
        <input id="lastName" name="lastName" type="text" required />

        <label htmlFor="preferredName">¿Cómo te gusta que te digan?</label>
        <input id="preferredName" name="preferredName" type="text" />

        <label htmlFor="studentId">Matrícula</label>
        <input id="studentId" name="studentId" type="text" placeholder="A12345678" required />

        <label htmlFor="age">Edad</label>
        <input id="age" name="age" type="number" min="18" required />

        <label htmlFor="career">Carrera</label>
        <input id="career" name="career" type="text" required />

        <label htmlFor="semester">Semestre actual</label>
        <select id="semester" name="semester" required defaultValue="">
          <option value="" disabled>
            Selecciona una opción
          </option>
          {SEMESTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="phone">Número de teléfono</label>
        <input id="phone" name="phone" type="text" placeholder="55########" required />

        <label htmlFor="instagram">Instagram</label>
        <input id="instagram" name="instagram" type="text" />

        <label htmlFor="nationality">Nacionalidad</label>
        <input id="nationality" name="nationality" type="text" required />

        <fieldset>
          <legend>¿Tu pasaporte tiene vigencia suficiente para el viaje?</legend>
          {PASSPORT_STATUS_OPTIONS.map((option) => (
            <label key={option} className="radio-option">
              <input type="radio" name="passportStatus" value={option} required /> {option}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>¿Tienes visa de Estados Unidos o puedes entrar a EE. UU. por otro medio?</legend>
          {VISA_STATUS_OPTIONS.map((option) => (
            <label key={option} className="radio-option">
              <input type="radio" name="visaStatus" value={option} required /> {option}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>¿Estás de acuerdo en ser agregado al grupo de WhatsApp de primera fase?</legend>
          <label className="radio-option">
            <input type="radio" name="whatsappGroupConsent" value="Sí" required /> Sí
          </label>
          <label className="radio-option">
            <input type="radio" name="whatsappGroupConsent" value="No" required /> No
          </label>
        </fieldset>

        <p>
          Los datos recopilados en este formulario serán utilizados únicamente para dar seguimiento a
          tu interés, coordinar tu proceso de inscripción y compartir información relacionada con la
          misión internacional. La información será tratada por el equipo organizador responsable del
          programa y no será compartida con terceros, salvo cuando sea necesario para fines logísticos
          relacionados con la misión. Al enviar este formulario, aceptas que tus datos sean utilizados
          para estos fines.
        </p>

        <label className="checkbox-option">
          <input type="checkbox" name="privacyConsent" required /> Acepto que mis datos sean
          utilizados por el equipo organizador para dar seguimiento a mi proceso de inscripción,
          compartir información sobre la misión y coordinar los siguientes pasos del programa.
        </label>

        <button type="submit">Enviar</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
