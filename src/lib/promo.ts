// Pure promotional content generator (FEAT-010, FR-016). No Prisma/Next
// imports here, same convention as funnel.ts/reminders.ts. Local,
// deterministic templates -- no LLM API call, no new dependency, no
// network call, no cost. Draft copy is [PROPOSED — confirm], same
// treatment as FEAT-005's reminder templates: a first pass for the team
// to review, not final marketing copy.
//
// Captions are Spanish (the actual social-copy deliverable, same audience
// as F1's user-facing strings). Image prompts are English -- the
// conventional lingua franca for text-to-image tools (Midjourney/
// DALL-E-style) the board would paste them into.

export type PromoIdea = {
  angle: string;
  caption: string;
  imagePrompt: string;
};

const SPANISH_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDeadlineEs(deadline: Date): string {
  return `${deadline.getUTCDate()} de ${SPANISH_MONTHS[deadline.getUTCMonth()]}`;
}

type Angle = {
  angle: string;
  caption: (tripName: string, registrationClose: Date | null) => string;
  imagePrompt: (tripName: string) => string;
};

const ANGLES: Angle[] = [
  {
    angle: "Countdown / urgency",
    caption: (name, deadline) =>
      deadline
        ? `¡${name} ya viene! Las inscripciones cierran el ${formatDeadlineEs(deadline)}. No te quedes fuera, aplica hoy mismo.`
        : `¡${name} ya viene! Las inscripciones están abiertas por tiempo limitado, aplica hoy mismo.`,
    imagePrompt: (name) =>
      `A vibrant, energetic photo of college students packing suitcases and excitedly looking at a world map, warm golden-hour lighting, bold poster-style text overlay space at the top, promotional flyer for "${name}"`,
  },
  {
    angle: "Teamwork / experience",
    caption: (name) =>
      `${name} se vive mejor en equipo. Conoce nuevos lugares, nuevas ideas y compañeros que se convertirán en amigos para toda la vida.`,
    imagePrompt: (name) =>
      `A candid, joyful group photo of diverse university students laughing together outdoors, backpacks and travel gear visible, bright natural light, authentic travel-brochure style, related to "${name}"`,
  },
  {
    angle: "Behind the scenes",
    caption: (name) =>
      `Así se está armando ${name}: reuniones, planeación y mucho entusiasmo. Síguenos para ver cómo va tomando forma.`,
    imagePrompt: (name) =>
      `A behind-the-scenes flat-lay photo of a trip-planning desk: an open notebook with itinerary sketches, a passport, a boarding pass mockup, a cup of coffee, soft top-down natural lighting, for a mission called "${name}"`,
  },
  {
    angle: "Testimonial style",
    caption: (name) =>
      `"Fue la mejor experiencia de mi carrera." Así describen ${name} los participantes de generaciones anteriores. ¿Tú serás el/la siguiente en contarlo?`,
    imagePrompt: (name) =>
      `A warm, quote-card style image: a smiling university student in the foreground with a blurred travel destination behind them, clean space reserved for a text quote overlay, promotional social-media template for "${name}"`,
  },
  {
    angle: "FOMO / scarcity",
    caption: (name) =>
      `Los lugares para ${name} son limitados y se están llenando rápido. No dejes que esta oportunidad se te escape.`,
    imagePrompt: (name) =>
      `A dynamic, high-contrast photo of an airport departure board or boarding gate, motion blur suggesting urgency, bold accent color, promotional social-media graphic for "${name}"`,
  },
];

export function generatePromoIdeas(
  tripName: string,
  registrationClose: Date | null = null,
): PromoIdea[] {
  return ANGLES.map((a) => ({
    angle: a.angle,
    caption: a.caption(tripName, registrationClose),
    imagePrompt: a.imagePrompt(tripName),
  }));
}
