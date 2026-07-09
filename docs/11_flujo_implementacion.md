# Flujo de implementación con Claude

## Propósito

Este documento define **cómo debe trabajar Claude (Claude Code) cuando el equipo le pide implementar algo**. El objetivo es que primero **planee**, luego **identifique qué documentación toca el cambio** y solo entonces **desarrolle**, manteniendo la trazabilidad que exige `guia_documentacion_desarrollo_saludable_ia.md`.

Extiende (no reemplaza) la sección "Flujo para crear una nueva funcionalidad" de la guía madre, agregando dos pasos obligatorios: **planear con aprobación humana** e **identificar el impacto en documentación antes de programar**.

Regla de oro: **ningún cambio de código empieza sin un plan aprobado por una persona.**

El modelo de ramas de este repo es **`main` + `develop`** (definido en `CLAUDE.md`, sección 4): el trabajo diario sale de `develop` y vuelve a `develop`; `main` se reserva para releases.

---

## Paso 0 — Entender y planear (plan mode)

Antes de escribir una sola línea de código:

1. Entra en **plan mode**: en una sesión de Claude Code presiona `Shift+Tab` para alternar a plan mode (o inicia con `claude --permission-mode plan`). En este modo Claude lee archivos y propone un plan sin editar nada hasta que apruebes.
2. Produce un plan que responda:
   - Qué se va a construir y qué problema resuelve.
   - A qué requisito(s) se conecta (`RF-`/`RNF-`) o cuál hay que crear.
   - Qué archivos y módulos se tocarán.
   - Qué documentación se verá afectada (ver Paso 2).
   - Qué pruebas (`TC-`) lo validarán.
   - Riesgos y qué queda fuera de alcance.
3. **Espera la aprobación explícita de una persona.** No salgas de plan mode a ejecución sin ese visto bueno.

## Paso 1 — Registrar la necesidad

- Abre un **GitHub Issue** con la plantilla correspondiente (`feature` o `bug`) y asígnale un ID (`FEAT-XXX` / `BUG-XXX`).
- Agrégalo a `/docs/05_backlog.md` con su tipo, prioridad, estado y requisito relacionado.

## Paso 2 — Identificar la documentación impactada (antes de programar)

Revisa esta lista y marca qué archivos de `/docs` tendrás que **crear o actualizar** por este cambio. Este paso es obligatorio y debe quedar reflejado en el plan y en el PR.

- [ ] `01_vision_producto.md` — ¿cambia alcance, objetivo o "fuera de alcance"?
- [ ] `02_arquitectura.md` — ¿nuevo módulo, stack o regla de arquitectura?
- [ ] `03_requisitos.md` — ¿nuevo requisito funcional o cambio de criterios de aceptación?
- [ ] `04_requisitos_no_funcionales.md` — ¿impacto en seguridad, rendimiento, usabilidad, etc.?
- [ ] `05_backlog.md` — casi siempre sí (alta/estado del ítem).
- [ ] `06_api.md` — ¿nuevos endpoints o cambios de contrato?
- [ ] `07_modelo_datos.md` — ¿nuevas entidades, campos o relaciones?
- [ ] `08_pruebas.md` — casi siempre sí (nuevos `TC-`).
- [ ] `09_uso_ia.md` — solo si cambian las reglas de uso de IA.
- [ ] `/docs/decisiones/ADR-XXX_*.md` — ¿hay una decisión técnica importante que registrar?
- [ ] `10_release_notes.md` — al cerrar, siempre.
- [ ] `/docs/funcionalidades/FEAT-XXX_*.md` — el doc de la funcionalidad (Paso 3).

## Paso 3 — Crear el documento de funcionalidad

- Copia `/docs/plantillas/plantilla_funcionalidad.md` a `/docs/funcionalidades/FEAT-XXX_nombre.md` y complétalo.
- Si hay una decisión técnica relevante, crea un ADR desde `/docs/plantillas/plantilla_adr.md` en `/docs/decisiones/`.

## Paso 4 — Rama y desarrollo

- Crea la rama **partiendo de `develop`**: `feature/FEAT-XXX-descripcion` (o `fix/BUG-XXX-...`).
- Desarrolla en commits atómicos con el ID al frente: `FEAT-XXX: <descripción en imperativo>`.
- Respeta las reglas de Git de `CLAUDE.md` (nada directo a `main` ni `develop`, sin secretos, sin dependencias injustificadas).
- Explica tu enfoque antes de generar código y no entregues nada que no entiendas.

## Paso 5 — Probar

- Agrega los casos de prueba en `/docs/08_pruebas.md` (caso feliz, errores comunes y seguridad básica).
- Ejecuta las pruebas antes de dar por terminada la funcionalidad.

## Paso 6 — Actualizar la documentación impactada

- Actualiza **todos** los archivos que marcaste en el Paso 2.
- Verifica que la funcionalidad quede conectada a su requisito, prueba y doc.

## Paso 7 — Pull Request

- Abre el PR **apuntando a `develop`** usando `.github/PULL_REQUEST_TEMPLATE.md`.
- Enlaza y cierra el Issue con `Closes #<número>` (se cierra al integrar a `develop`, que es la rama por defecto).
- En PR a `develop` la revisión es recomendada, no obligatoria; en PR a `main` (release/hotfix) se requiere **al menos 1 aprobación**.

## Paso 8 — Merge, release y cierre

- Integra el PR a `develop` con **merge commit** (estrategia definida para este repo).
- Tras fusionar, **borra la rama** de la funcionalidad/fix (las ramas de trabajo son de corta vida y se eliminan al integrarse).
- **Release:** cuando `develop` acumule cambios listos, abre un PR `develop → main`; al fusionarlo (con 1 revisión), crea el tag SemVer `vX.Y.Z` y actualiza `/docs/10_release_notes.md`.
- **Hotfix:** para urgencias de producción, crea `hotfix/...` desde `main`, PR a `main`, y luego integra ese mismo arreglo a `develop`.
- Una funcionalidad solo está cerrada si: está implementada, probada, cumple criterios de aceptación, tiene PR revisado, la documentación fue actualizada y aparece en release notes.

---

## Trazabilidad mínima obligatoria

```txt
FEAT-XXX
  ├── RF-XXX / RNF-XXX
  ├── Documento de funcionalidad (/docs/funcionalidades/)
  ├── Issue de GitHub
  ├── Rama desde develop (feature/FEAT-XXX-...)
  ├── Commits (FEAT-XXX: ...)
  ├── Pull Request (con revisión)
  ├── Casos de prueba (TC-XXX)
  └── Release notes (vX.Y.Z)
```

## Recordatorio para el Claude que implementa

- Planea y **espera aprobación** antes de programar.
- Identifica el impacto en documentación **antes**, no después.
- No decides producto ni arquitectura: propones; la persona decide.
- No aceptes código que no entiendas y marca siempre tus supuestos.
