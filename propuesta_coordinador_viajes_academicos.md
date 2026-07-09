# Coordinador de Viajes Académicos — Propuesta de solución y puntos por aclarar

> Documento de trabajo, versión 2. Sintetiza la iteración de escenarios sobre la idea original ("Intermediary Trip Coordinator") tras tres actualizaciones: el rol acotado del CCA, el descubrimiento del segmento de viajes de Semana Tec, y el mapeo del proceso operativo real de LEAD (v2). Distingue explícitamente entre lo verificado, lo inferido y lo desconocido. Las probabilidades mencionadas son estimaciones subjetivas del análisis, no datos.
>
> **Cambios de v1 a v2:** se agrega la sección 2 (proceso operativo real); el core del producto se reordena alrededor de la máquina de estados del participante y la capa de documentos de agencia; se añaden los riesgos de adyacencia con SquadTrip y de no-transferibilidad del embudo al segmento profesor; se añaden las preguntas #12–#16 y nuevos supuestos.

---

## 1. Tesis de la solución

**Una herramienta de coordinación para quien organiza un viaje académico grupal sin ser agencia de viajes** — hoy un profesor de Semana Tec o la mesa directiva de un grupo estudiantil — que estructura el trabajo que actualmente vive en WhatsApp, Excel y correo: el embudo de participantes, los documentos que van y vienen con la agencia, la coordinación de visitas y los recordatorios.

La iteración de escenarios produjo un hallazgo central que esta propuesta adopta: **el intermediario es el usuario en todos los escenarios viables, pero no es el cliente en ninguno.** El modelo coherente reparte los papeles así:

| Papel | Quién | Qué hace respecto al producto |
|---|---|---|
| **Usuario de diseño** | El profesor de Semana Tec (una persona, saturada, sin estructura) | Define el listón de simplicidad. Si él no lo adopta voluntariamente, nadie lo hará. |
| **Power user / laboratorio** | LEAD (mesa de 3, con estructura y know-how superior) | Estresa el sistema, aporta el playbook y el proceso mapeado (sección 2), y provee la misión de enero 2027 como prueba de campo. |
| **Cliente eventual** | La institución (dirección de Semana Tec del campus → escuelas → vicerrectorías) | Es quien tiene presupuesto y dolor agregado. Venta a mediano plazo, condicionada a tracción bottom-up. |
| **Receptor de outputs** | La agencia de viajes | Nunca inicia sesión. Recibe briefs de visitas y datos limpios; entrega itinerarios y presupuestos. (Camino paralelo: la agencia como cliente B2B2C sigue abierto.) |

### Por qué este segmento y no los anteriores

El segmento Semana Tec resuelve simultáneamente las tres debilidades que mataban o herían los escenarios previos:

1. **Recurrencia:** institucionalizada en el calendario académico — ocurre varias veces al año, todos los años, por diseño del modelo Tec21.
2. **Volumen y homogeneidad:** muchos organizadores ejecutando el mismo flujo bajo la misma institución.
3. **Comprador identificable:** el profesor no paga, pero el Tec sí tiene presupuesto y un dueño institucional del proceso.

**Evidencia verificada (fuentes públicas del Tec):** en la Semana i de 2018, solo campus Monterrey tuvo 323 actividades, de las cuales 15 fueron viajes nacionales o internacionales, organizados y dirigidos por profesores (~300+ alumnos viajando al extranjero en un solo periodo). Fuentes: conecta.tec.mx / tec.mx (notas de sept–oct 2018).
**Extrapolación (no verificada):** con varios periodos de Semana Tec al año y ~26 campus, el sistema plausiblemente genera cientos de viajes dirigidos por profesores al año. El número real es el punto por aclarar #1.
**Observación de primera mano (del equipo):** el profesor hace solo, y con menos estructura, lo que en LEAD hacen tres personas.
**Dato adicional (aportado por el equipo, refuerza el ángulo institucional):** es obligatorio que en los viajes del Tec haya un profesor presente — incluso en viajes organizados por grupos estudiantiles. Los dos segmentos comparten actor.

### Validación externa del techo comercial

La categoría "software de gestión de viajes académicos" existe y monetiza en EE. UU.: Terra Dotta gestiona programas faculty-led, riesgo y cumplimiento para universidades, con precios enterprise reportados desde ~$20,000 USD anuales. Esto prueba que las instituciones pagan por resolver este problema — y a la vez introduce el riesgo de que el Tec compre un incumbente o construya internamente (punto #5).

---

## 2. Proceso operativo real (mapeado por el equipo, caso LEAD)

Tres perspectivas sobre la misma línea de tiempo. Este mapeo es la primera evidencia a nivel proceso de toda la iteración; lo que sigue en la sección 3 se deriva de él.

### 2.1 Intermediario ↔ participante

| Paso | Actividad | Dónde vive hoy |
|---|---|---|
| 1 | Crear materiales de difusión: brochure PDF, esquema de pagos PDF, historias IG/TikTok, mp4 para pantallas | Herramientas de diseño |
| 2 | Difundir | WhatsApp, Instagram |
| 3 | Registro en dos fases: F1 sin datos sensibles (captación), F2 con datos sensibles (confirmados) | Formularios (ver formularios_LEAD.md) |
| 4 | Grupo de WhatsApp de interesados: contrato, fecha de primer pago, sesión informativa; **persecución individual manual** ("contrato → pago = confirmado") | WhatsApp, mensajes uno a uno |
| 5 | Grupo de confirmados: se comparte el itinerario que produce la agencia (pptx → pdf → reenvío) y se recuerdan fechas de planes de pago | WhatsApp |
| 6 | Se ejecuta el viaje | — |

### 2.2 Intermediario ↔ agencia

| Paso | Actividad |
|---|---|
| 0 | Planeación: el intermediario boceta ciudades → la agencia refina → documentos **desestandarizados en PDF no actualizables** (itinerario, presupuesto con costos por tamaño de grupo) → se itera → el intermediario termina con *n* versiones de los mismos archivos |
| 1–4 | Sin interacción |
| 5 | Se comparten los pasaportes de los confirmados para que la agencia compre vuelos |
| 6 | (Fuera de alcance por decisión del equipo: se asume que el intermediario no gestiona dinero; los participantes pagan directamente a la agencia) |

### 2.3 Interno del intermediario

Decisión del sobreprecio del viaje para cubrir el costo del profesor acompañante (obligatorio) y, en su caso, un porcentaje del costo de la mesa directiva. Con la suposición "sin gestión de dinero", esto se reduce a una decisión de precio tomada contra los tiers de la cotización de la agencia.

### 2.4 La lectura del proceso: una máquina de estados perseguida a mano

El trabajo dominante de los pasos 1–5 no es gestión de tareas: es un **embudo de conversión**. Cada participante atraviesa estados discretos:

`interesado → registrado (F1) → contrato enviado → contrato firmado → pago inicial confirmado → confirmado → datos F2 completos → listo para vuelos`

Cada transición tiene un documento o una acción asociada, y hoy la mesa la empuja con mensajes individuales de recordatorio. Esa persecución manual de estados es el dolor más concreto, frecuente y automatizable de todo el proceso — y por eso pasa al centro del producto.

---

## 3. Forma del producto: core + módulos

El principio arquitectónico se conserva: **un core genérico y módulos opcionales**, donde el core no contiene nada específico del Tec. Lo que cambia en v2 es el contenido del core, ahora derivado del proceso real.

### Core (reordenado por prioridad)

1. **Máquina de estados del participante + generador de recordatorios.** El tracker del embudo de la sección 2.4: en qué estado está cada persona, qué transición está vencida, y el mensaje de recordatorio listo para enviarse por el canal que ya usan (WhatsApp). El producto no envía por sí solo en v1; produce la lista de "a quién empujar hoy y con qué mensaje".
2. **Capa de documentos de agencia.** Registro de versiones de los PDFs que la agencia entrega (cuál es la vigente, qué cambió, qué quedó obsoleto) y **vínculo entre el conteo de confirmados y el tier de precio de la cotización** — la herramienta muestra en tiempo real en qué escenario de costo está el grupo conforme avanza el embudo. Nota de honestidad: esto *administra* el infierno de versiones; eliminarlo exigiría que la agencia cambie su forma de trabajar, lo cual viola el principio de agencia-como-receptora (ver pregunta #15).
3. **Distribución hacia participantes.** El itinerario y los avisos que hoy se reenvían a mano al grupo de confirmados salen de la herramienta como links/archivos listos para compartir.
4. **Coordinación de visitas** (empresas, instituciones): pipeline de contacto → confirmación → día/hora, con el brief hacia la agencia como output.
5. **Roster operativo** sin datos sensibles (ver restricción 1).

### Módulos (activables por contexto)

- **Módulo de servicio social (caso LEAD):** proyecto → aceptación externa como vía de acreditación (CCA/Dante) → registro en formulario oficial → acreditación de horas. Trámite paralelo que no toca la planeación ni la ejecución del viaje.
- **Módulo de cumplimiento institucional (caso Tec, hipotético):** los requisitos que el Tec impone a un viaje con alumnos. Primer contenido confirmado: la obligación del profesor acompañante. El resto es desconocido (pregunta #4).
- **Módulo de captación (posible, ver riesgo de asimetría):** si el embudo resulta ser específico de grupos estudiantiles y no del profesor de Semana Tec (pregunta #12), los componentes 1 y 3 del core podrían reempaquetarse como módulo en lugar de core. Decisión pendiente de esa respuesta.

### Restricciones de diseño para v1

1. **Datos sensibles: fuera del v1, con conflicto reconocido.** El proceso real muestra que compartir pasaportes con la agencia (paso 5) es un paso obligatorio, no periférico. Decisión v1: la herramienta rastrea el *estatus* ("datos F2 completos: sí/no") pero los documentos sensibles siguen fluyendo por el canal actual de LEAD. Manejarlos dentro del producto queda condicionado a resolver la pregunta #4 (política de datos del Tec) y a un diseño de seguridad serio. Esta es una decisión explícita, no un descuido.
2. **Sin pagos.** El producto rastrea el estatus de pago como estado del embudo; nunca procesa dinero. Los participantes pagan directamente a la agencia (suposición de trabajo fijada por el equipo).
3. **Sin creación de materiales de difusión.** Brochures, mp4 e historias (paso 1) son otra categoría de producto (ahí vive Canva) y son la trampa de scope más clara del proceso. Posible versión futura ligera: una página pública del viaje autogenerada con los datos que ya viven en la herramienta — pero eso es territorio SquadTrip/WeTravel y no entra en v1.
4. **Sin reemplazo del chat grupal.** La superficie del alumno es mínima y push-based.
5. **Diseñado para el usuario más simple.** El v1 debe funcionar para un profesor solo; LEAD lo usa como configuración avanzada.
6. **Preparado para handoff.** Mínimas partes móviles, hosting barato, documentado.

### Qué se abandona explícitamente

- El mercado de grupos de amigos (saturado de productos gratuitos, sin disposición a pagar).
- La apuesta por el CCA como cliente (rol de Dante acotado; queda como pregunta secundaria #7).
- "AI-developed" como propuesta de valor externa.
- La gestión de dinero en cualquier forma.

---

## 4. Riesgos actualizados en v2

**R-A (nuevo): adyacencia con SquadTrip.** Con el embudo al centro, el producto se acerca al territorio de SquadTrip (trip pages, registro, seguimiento de participantes) y parcialmente WeTravel. Diferenciadores que quedan y hay que defender: (a) sin procesamiento de pagos — el dinero fluye directo a la agencia, mientras SquadTrip está construido alrededor de cobrar; (b) la capa de relación con agencia (versiones, tiers de precio, briefs de visitas), que ninguno de los dos tiene; (c) el cumplimiento institucional. Si el v1 termina siendo solo el embudo, no hay diferenciación suficiente.

**R-B (nuevo): asimetría de segmentos.** Es plausible — inferencia, no verificada — que la inscripción del alumno a un viaje de Semana Tec pase por el sistema oficial del Tec, en cuyo caso el profesor **no corre un embudo de captación** como el de LEAD y su dolor se concentra en la coordinación con agencia, el cumplimiento y la distribución de información. Si es así, el proceso mapeado en la sección 2 enriquece el caso LEAD pero no transfiere 1:1 al usuario de diseño. La pregunta #12 resuelve esto y condiciona qué es core y qué es módulo.

**R-C (heredado): generalizar antes de validar; fake modularity; adopción del profesor; handoff.** Siguen vigentes tal como se plantearon en el documento original y en v1.

---

## 5. Secuencia propuesta

**Fase 0 — Sondas (ahora, costo ≈ una–dos semanas de conversaciones):** cerrar el Bloque A de preguntas antes de escribir código de producto.

**Fase 1 — v1 (verano 2026):** construir el core de la sección 3 con el profesor como usuario de diseño y el playbook/proceso de LEAD como plantillas iniciales. Un módulo (servicio social) para probar la abstracción.

**Fase 2 — Piloto doble (otoño 2026 – enero 2027):** 1–2 profesores en una Semana Tec de otoño y la misión de Asia de LEAD en enero 2027. Dos pruebas de campo en un año.

**Fase 3 — Decisión (feb 2027):** con datos de ambos pilotos: (a) buscar a la institución como cliente, (b) explorar el canal agencia, o (c) cerrar el proyecto chico, documentado y entregable a la mesa 2028. El diseño garantiza que (c) ya es una victoria.

---

## 6. Puntos por aclarar

Ordenados por cuánto cambia el proyecto la respuesta.

### Bloque A — Determinan si el camino principal existe

**1. ¿Cuántos viajes de Semana Tec ocurren hoy, por periodo y por campus?**
*Por qué importa:* el caso de volumen descansa en una extrapolación de datos de 2018.
*Cómo:* dirección de Semana Tec / vinculación de CSF; contar los viajes en la oferta publicada del próximo periodo.

**2. ¿Cómo gestiona hoy un profesor su viaje de Semana Tec, paso a paso?**
*Por qué importa:* validación directa del dolor del usuario de diseño.
*Cómo:* entrevistas con 3–5 profesores de CSF que hayan dirigido viajes. Preguntas guía: herramientas, horas invertidas, dónde se atora, qué exige el Tec sin ayudarles a cumplirlo.

**3. ¿Qué cubre ya el sistema oficial del Tec y dónde está la brecha?**
*Por qué importa:* si el Tec ya cubre la coordinación operativa, el escenario muere; si la brecha existe, define el alcance del v1.
*Cómo:* mismas entrevistas + conversación con quien administra Semana Tec en el campus.

**4. ¿Qué requisitos administrativos y de datos impone el Tec a un viaje con alumnos?**
*Por qué importa:* contenido del módulo de cumplimiento y riesgo de bloqueo por manejo de datos de estudiantes. Primer requisito ya confirmado por el equipo: profesor acompañante obligatorio.
*Cómo:* entrevistas del punto 2 + reglamentos de viajes estudiantiles del Tec.

**12. (Nueva) ¿El profesor de Semana Tec corre un embudo de captación propio, o la inscripción y el cobro pasan por el sistema oficial del Tec?**
*Por qué importa:* decide si la máquina de estados del participante es core universal o módulo del caso "grupo estudiantil" (riesgo R-B). Es la pregunta que más afecta la arquitectura del v1.
*Cómo:* las mismas entrevistas del punto 2; una pregunta directa lo resuelve.

### Bloque B — Determinan la estrategia

**5. ¿El Tec ya tiene, usa o planea un sistema para esto?**
*Cómo:* preguntar en la dirección de Semana Tec / Vicerrectoría cuando haya piloto que mostrar.

**6. ¿Quién es la agencia de LEAD, qué tamaño tiene y le interesaría el canal B2B2C?**
*Cómo:* una reunión, gestionable por el director de vinculación (Imanol).

**7. ¿Cuántos proyectos/grupos gestiona el CCA al año?**
*Cómo:* conversación con Dante (Erick tiene la relación). Prioridad baja tras el acotamiento de su rol.

**15. (Nueva) ¿La agencia aceptaría un intake estructurado (aunque sea mínimo), o su flujo de PDFs es innegociable?**
*Por qué importa:* define el techo de la capa de documentos: registro de versiones (si los PDFs son innegociables) versus fuente única de verdad compartida (si aceptan estructura). También alimenta el escenario agencia-como-cliente.
*Cómo:* en la misma reunión del punto 6.

**16. (Nueva) ¿De qué normativa viene la obligación del profesor acompañante y qué más exige esa normativa?**
*Por qué importa:* es el hilo del que se jala para reconstruir el módulo de cumplimiento completo (seguros, responsivas, ratios profesor/alumno, autorizaciones).
*Cómo:* reglamentos del Tec + entrevistas del punto 2.

### Bloque C — Determinan el diseño y la supervivencia

**8. ¿Cuánto cuesta hoy la coordinación a LEAD, en horas y en fallas concretas?**
*Cómo:* la mesa reconstruye la última misión.

**14. (Nueva) Números del embudo de LEAD: ¿cuántos interesados entran, cuántos confirman, cuántos recordatorios individuales requiere una misión?**
*Por qué importa:* cuantifica el dolor del componente central del producto. Si son 25 interesados y 20 confirmados, la persecución manual es molesta pero barata; si son 150 → 20, el tracker se paga solo.
*Cómo:* datos de la última captación (formularios y chats existentes).

**9. ¿Qué no puede hacer un template de Notion bien armado?**
*Nota v2:* candidatas con mejor respuesta tras el mapeo del proceso: el generador de recordatorios ligado a estados, el vínculo confirmados↔tier de precio, y el registro de versiones de agencia. Sigue debiendo validarse, no asumirse.

**13. (Nueva) El contrato de participantes: ¿quién lo emite, con qué personalidad jurídica, y cómo se firma hoy?**
*Por qué importa:* la transición "contrato firmado" es un estado central del embudo; cómo se firma (papel, foto por WhatsApp, firma electrónica) define si la herramienta puede registrarla automáticamente o solo como palomita manual. La cuestión de la personalidad jurídica excede al software pero conviene tenerla clara antes de sistematizar el paso.
*Cómo:* respuesta interna del equipo; en su caso, consultar con el área correspondiente del Tec.

**10. ¿Quién es dueño de esto en 2028?**
*Cómo:* decisión interna antes de la Fase 1.

**11. Criterios de éxito y de cierre (kill criteria).**
Propuesta a discutir: el piloto de otoño es éxito si el profesor completa su viaje usando la herramienta sin soporte constante y la volvería a usar; la misión de enero es éxito si la mesa la usó como fuente de verdad (no como espejo de un Excel paralelo), si la persecución de estados tomó medible­mente menos tiempo que en la misión anterior (baseline: pregunta #14) y si la agencia valoró los briefs. Si ambos fallan, se ejecuta el cierre de Fase 3(c).
*Cómo:* acuerdo del equipo, por escrito, antes de la Fase 2.

---

## 7. Registro de supuestos vigentes

1. El volumen actual de viajes de Semana Tec es comparable o mayor al documentado en 2018 (extrapolación).
2. Existe una brecha entre lo que el sistema oficial del Tec cubre y lo que el organizador necesita (hipótesis central; preguntas #2, #3, #12).
3. El profesor adoptaría voluntariamente una herramienta que le ahorre tiempo neto desde el primer uso.
4. El Tec no tiene un proyecto interno o proveedor contratado para este proceso.
5. El dolor de coordinación de LEAD justifica software y no solo una plantilla mejor (preguntas #8, #9, #14).
6. **(Nuevo)** El embudo de captación mapeado en la sección 2 es representativo del caso "grupo estudiantil", pero su transferibilidad al profesor de Semana Tec es incierta (riesgo R-B, pregunta #12).
7. **(Nuevo)** La agencia no cambiará su forma de trabajar (PDFs); el producto se diseña alrededor de ese comportamiento, no contra él (pregunta #15 puede relajar este supuesto).
8. **(Nuevo)** Los participantes pagan directamente a la agencia y el intermediario no gestiona dinero (suposición fijada por el equipo para simplificar; si en la práctica LEAD sí intermedia dinero, ese flujo queda deliberadamente fuera del producto).
9. Las estimaciones de probabilidad usadas en la iteración de escenarios son juicios subjetivos del análisis, no mediciones.

El criterio general se mantiene: **ninguna línea de código de producto antes de cerrar el Bloque A** (preguntas #1–#4 y #12). Todas se responden con conversaciones que el equipo puede tener en una o dos semanas.
