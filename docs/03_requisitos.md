# Requisitos funcionales

Este documento cataloga lo que el sistema debe hacer. Cada requisito funcional (RF) es una capacidad **atómica y verificable**. Para agregar uno, copia el bloque de `docs/plantillas/plantilla_requisito.md` y pégalo debajo del índice.

> **Distinción:** el RF define **qué** debe hacer el sistema; el **cómo** (diseño, pantallas, esquema de datos, pasos) vive en el documento de funcionalidad (`docs/plantillas/plantilla_funcionalidad.md`). El avance del trabajo, la estimación y el responsable viven en `05_backlog.md`.

## Cómo escribir un RF

1. **Atómico:** un RF = una capacidad. Si unes dos funciones con "y", divídelo en dos RF.
2. **Datos ≠ funciones:** los campos van agrupados dentro de la función que los usa, no un RF por campo.
3. **Patrón fijo:** "El sistema deberá, cuando [disparador/actor], [resultado observable]". Prohibido el diseño (tecnología, pantallas, esquema de datos) y la vaguedad ("rápido", "amigable", "fácil").
4. **Resultado observable (neutral al canal):** estado persistido, registro creado/modificado, valor o código devuelto, evento emitido o salida en pantalla. No exige interfaz gráfica.
5. **Discriminador siempre:** todo resultado (feliz o de error) debe ser distinguible: estado resultante, campo señalado o código. Nunca "muestra un error" a secas.
6. **Camino de error:** obligatorio si el RF acepta entrada del usuario, depende de precondiciones o requiere permisos/estado. Va como criterio con su TC-.
7. **Verificable:** cada criterio de aceptación se mapea 1:1 a un TC- de `08_pruebas.md` (la aserción vive en "Resultado esperado" del TC). Cobertura: todo camino descrito tiene ≥1 criterio; ningún criterio sin comportamiento descrito.
8. **Prioridad = criticidad del requisito** (ver escala), no urgencia del trabajo (esa la gestiona `05_backlog.md`).
9. **No inventes:** lo no confirmado se marca `[PENDIENTE: preguntar a cliente]`.
10. **Frontera RF ↔ FEAT:** los criterios y reglas se escriben en el RF; el documento de funcionalidad (FEAT) los **referencia** ("Criterios: ver RF-XXX"), no los reescribe.

**Escala de prioridad:**

| Prioridad | Significado |
|---|---|
| Alta | Sin este requisito el sistema no cumple su propósito. |
| Media | Aporta valor; su ausencia degrada el sistema pero puede diferirse. |
| Baja | Deseable; sin impacto en el valor central. |

**Estado (vigencia del requisito):** `Propuesto` / `Aprobado` / `Obsoleto`. El avance de implementación no se registra aquí; se lee en `05_backlog.md`.

## Índice de requisitos

<!-- Catálogo de un vistazo; el detalle vive en cada bloque RF-XXX de abajo. -->

| ID | Requisito | Prioridad |
|---|---|---|
| RF-XXX | … | Alta / Media / Baja |

<!-- Pega aquí cada RF usando docs/plantillas/plantilla_requisito.md -->

---

## Convención de identificadores

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Requisito funcional | RF | RF-001 |
| Requisito no funcional | RNF | RNF-001 |
| Historia de usuario | HU | HU-001 |
| Decisión técnica | ADR | ADR-001 |
| Prueba | TC | TC-001 |
| Funcionalidad | FEAT | FEAT-001 |
| Bug | BUG | BUG-001 |
