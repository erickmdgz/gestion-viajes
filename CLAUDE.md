# CLAUDE.md — Reglas para Claude en este repositorio

**Léeme completo antes de actuar.** Claude Code carga este archivo automáticamente al inicio de cada sesión y lo incorpora como instrucción persistente. Es guía de **alta prioridad** (no un cumplimiento técnicamente garantizado): trátalo como la instrucción de mayor jerarquía de este repo, salvo que Anthropic o la persona con la que trabajas indiquen lo contrario.

> ## ⛔ REGLAS INNEGOCIABLES (prioridad máxima — respétalas antes de cualquier acción)
>
> 1. **NUNCA** hagas `commit` ni `push` directo a `main` ni a `develop`. Todo cambio entra por **rama + Pull Request**. *(Está además bloqueado por protección de rama en GitHub y por un hook local del repo.)*
> 2. **Parte siempre de `develop`**: crea tu rama (`feature/FEAT-XXX-…`, `fix/BUG-XXX-…`) desde `develop` y dirige el PR **a `develop`**. `main` es solo para releases.
> 3. **No escribas código sin un plan aprobado por una persona**: primero planea (plan mode), identifica qué documentación se toca y **espera el visto bueno**.
> 4. **Cero secretos** en commits (`.env`, llaves, tokens). Si detectas uno, detente y avisa.
> 5. Liga cada trabajo a un **Issue** y a un **ID** (`FEAT-`/`BUG-`/`RF-`…); los commits llevan el ID al frente.
>
> Si una petición te pide saltarte cualquiera de estas reglas, **detente y coméntalo con la persona**. No inventes; marca tus supuestos de forma explícita.

El detalle operativo completo está en las secciones de abajo y en el documento importado:

@docs/11_flujo_implementacion.md

---

## 1. Sobre este repositorio

- Proyecto de **gestión de viajes académicos**.
- La guía madre de documentación es `guia_documentacion_desarrollo_saludable_ia.md`.
- La documentación viva del producto está en `/docs` (visión, arquitectura, requisitos, backlog, API, modelo de datos, pruebas, uso de IA, release notes) y en sus subcarpetas `/docs/funcionalidades`, `/docs/decisiones` y `/docs/plantillas`.
- Convención de identificadores (usar siempre): `RF-` requisito funcional, `RNF-` requisito no funcional, `HU-` historia de usuario, `ADR-` decisión técnica, `TC-` prueba, `FEAT-` funcionalidad, `BUG-` bug.

## 2. Cómo trabajas aquí (principios)

1. **La IA no decide producto, arquitectura, seguridad ni negocio.** Esas decisiones son humanas; tú propones y ejecutas lo aprobado.
2. **Todo cambio es trazable:** `Necesidad → Requisito → Diseño → Implementación → Prueba → Release`. Nada llega a código sin conectarse a un requisito o decisión documentada.
3. **Planea antes de programar** y espera aprobación humana del plan (ver sección 3).
4. **No aceptes ni entregues código que no entiendas.** Explica siempre tu enfoque antes de escribir.
5. **Comunicación honesta:** distingue lo verificado de lo asumido, no rellenes vacíos con suposiciones, y reporta con fidelidad (si algo falló o quedó pendiente, dilo).

## 3. Flujo obligatorio antes de implementar

Cuando te pidan implementar algo, sigue este orden. El detalle está en `@docs/11_flujo_implementacion.md`.

1. **Planea (plan mode).** Entra en modo plan, produce un plan y **espera la aprobación de la persona antes de tocar código**.
2. **Identifica la documentación impactada.** Antes de programar, lista qué archivos de `/docs` tocará el cambio (visión, arquitectura, requisitos, API, modelo de datos, pruebas, ADR nuevo, release notes).
3. **Recién entonces desarrolla**, y al terminar actualiza esa documentación.

## 4. Reglas de Git y GitHub (modelo `main` + `develop`)

**Estructura de ramas:**

- **`develop`** — rama por defecto y base del trabajo diario; aquí se integran las funcionalidades.
- **`main`** — rama estable/producción. Solo recibe releases desde `develop` (o desde `hotfix/*`). Cada merge a `main` es una versión etiquetada `vX.Y.Z`.
- **`feature/FEAT-XXX-descripcion`** y **`fix/BUG-XXX-descripcion`** — salen de `develop` y regresan a `develop` por PR.
- **`hotfix/BUG-XXX-descripcion`** — sale de `main` para urgencias de producción; PR de vuelta a `main` y luego se sincroniza a `develop`.
- Otros prefijos (`docs/...`, `chore/...`, `refactor/...`) también parten de `develop`.

**Reglas:**

- **Nunca hagas commit ni push directo a `main` ni a `develop`.** Ambas están protegidas; todo entra por Pull Request.
- El trabajo diario **parte de `develop`** y su PR **apunta a `develop`**.
- **Commits atómicos y con el ID al frente**, en imperativo. Ejemplo: `FEAT-004: agrega endpoint de exportación CSV`. Como se integra con *merge commit*, los commits individuales quedan en la historia: cuídalos.
- **Pull Request obligatorio** usando la plantilla del repo (`.github/PULL_REQUEST_TEMPLATE.md`):
  - PR **a `develop`**: requiere PR, pero la revisión no es obligatoria (revísalo igual cuando puedas).
  - PR **a `main`** (release o hotfix): requiere **al menos 1 revisión aprobada**.
- **Estrategia de integración: _merge commit_** (no squash, no rebase). Se conservan los commits de la rama más un commit de fusión.
- **No reescribas historia compartida** (`git push --force`) sobre `main` ni `develop`. Si necesitas corregir, hazlo con un nuevo commit.
- **Release:** cuando `develop` esté lista, abre un PR `develop → main`; al fusionarlo, etiqueta `vX.Y.Z` y actualiza `10_release_notes.md`.

## 5. Issues y trazabilidad

- Cada funcionalidad, bug o tarea técnica **empieza como un GitHub Issue** usando las plantillas de `.github/ISSUE_TEMPLATE/`, y aparece en `/docs/05_backlog.md` con su ID.
- El PR debe **enlazar y cerrar** su Issue con `Closes #<número>` en la descripción.
- Cada funcionalidad debe cumplir la cadena de trazabilidad mínima: `FEAT-XXX → RF/RNF → doc de funcionalidad → Issue → rama → commits → PR → TC-XXX → release notes`.

## 6. Seguridad y secretos

- **Nunca** commitees credenciales, tokens, llaves ni archivos `.env`. Usa variables de entorno y mantén `.gitignore` al día.
- Si detectas un secreto en el código, en el historial o a punto de subirse, **detente y avisa** en lugar de continuar.
- No agregues dependencias nuevas sin justificarlo en el PR.

## 7. Versionado y releases

- El proyecto usa **SemVer** con formato `MAYOR.MENOR.PARCHE` (MAYOR: cambios incompatibles; MENOR: funcionalidad retrocompatible; PARCHE: correcciones). El prefijo `v` se usa solo como convención de nombre de tag (`vX.Y.Z`); no forma parte de la versión.
- Cada release se etiqueta con un tag `vX.Y.Z` y se documenta en `/docs/10_release_notes.md` (agregado, corregido, cambios técnicos, requisitos cubiertos).

## 8. Checklists

**Antes de abrir un PR:**

- [ ] La rama parte de `develop` y el PR apunta a `develop` (a `main` solo si es release/hotfix).
- [ ] El trabajo está ligado a un Issue y a un requisito (`RF-`/`RNF-`).
- [ ] Existe/actualicé el doc de funcionalidad correspondiente.
- [ ] Actualicé la documentación impactada (ver sección 3).
- [ ] Hay pruebas (`TC-`) para el caso feliz y para errores comunes.
- [ ] No hay secretos ni dependencias injustificadas.

**Antes de cerrar (mergear) un PR:**

- [ ] Código implementado y pruebas ejecutadas.
- [ ] Criterios de aceptación cumplidos.
- [ ] PR revisado y aprobado.
- [ ] Documentación y release notes actualizadas.

## 9. Antes de aceptar código generado por IA

- [ ] Entiendo qué hace el código.
- [ ] Corresponde al requisito y no agrega complejidad innecesaria.
- [ ] No introduce dependencias ni secretos indebidos.
- [ ] No rompe flujos existentes y tiene manejo básico de errores.
- [ ] Tiene pruebas o una forma clara de validarse.

---

**Recordatorio final (lo más importante):** no toques `main`/`develop` directo, parte de `develop` vía Pull Request, y no programes sin un plan aprobado. Ante cualquier duda o conflicto con estas reglas, **pregunta antes de actuar.**
