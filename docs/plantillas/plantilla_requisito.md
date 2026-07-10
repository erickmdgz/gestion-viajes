# Plantilla de requisito funcional (RF)

Copia el bloque de abajo en `docs/03_requisitos.md` por cada requisito nuevo.
Las **reglas de redacción** y la **escala de prioridad** están al inicio de `03_requisitos.md` (no se repiten aquí para no duplicar la guía).

---

## RF-XXX — <título corto de la capacidad>

**Actor:** <rol, o "Sistema (disparador)"> · **Prioridad:** Alta | Media | Baja · **Estado:** Propuesto | Aprobado | Obsoleto
**Origen:** HU-XXX / 01_vision_producto.md   <!-- por qué existe; usa [PENDIENTE: preguntar a cliente] si falta -->

### Descripción

El sistema deberá, cuando <disparador o acción del actor>, <capacidad con resultado observable>.

### Criterios de aceptación

<!-- Fuente normativa. Cada criterio es observable, sin ambigüedad y se mapea 1:1 a un TC- de 08_pruebas.md. Cubre el caso feliz y cada camino de error aplicable. -->

- [ ] Dado <contexto>, cuando <acción>, entonces <resultado observable con discriminador: estado / campo / código>. → TC-XXX
- [ ] Dado <precondición no cumplida>, cuando <acción>, entonces <rechazo con campo/estado señalado>. → TC-XXX

### Reglas de negocio

<!-- OPCIONAL: borra esta sección si no aplica. Solo invariantes/definiciones de dominio NO ejecutables; si una regla es comportamiento comprobable, va como criterio con su TC-. -->

- <invariante de dominio>

<!-- Opcional: enlaza un RNF solo si restringe específicamente a este RF -> RNF-XXX -->
