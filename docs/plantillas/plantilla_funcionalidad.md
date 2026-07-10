# FEAT-XXX - Nombre de la funcionalidad

## 1. Resumen

¿Qué se quiere construir?

## 2. Problema o necesidad

¿Qué problema resuelve?

## 3. Usuario afectado

¿Quién usará esta funcionalidad?

## 4. Requisitos relacionados

- RF-XXX
- RNF-XXX

## 5. Flujo esperado

1. El usuario hace...
2. El sistema responde...
3. El usuario confirma...
4. El sistema guarda...

## 6. Criterios de aceptación

Los criterios de aceptación **se definen en el requisito funcional (RF)** correspondiente, no aquí (ver `docs/03_requisitos.md`). Este FEAT solo los referencia:

- RF-XXX → criterios en `docs/03_requisitos.md`

Si al implementar detectas un criterio nuevo, agrégalo primero al RF (con su `TC-`) y luego continúa.

## 7. Reglas de negocio

Las reglas de negocio **viven en el RF** (`docs/03_requisitos.md`), no se reescriben aquí. Referencia:

- RF-XXX

## 8. Diseño técnico propuesto

### Frontend

¿Qué pantallas, componentes o formularios se necesitan?

### Backend

¿Qué endpoints, servicios o lógica se necesitan?

### Base de datos

¿Qué tablas, campos o cambios de esquema se necesitan?

### Seguridad

¿Qué permisos, validaciones o restricciones aplican?

## 9. Pruebas requeridas

| ID | Prueba | Tipo |
|---|---|---|
| TC-XXX | Usuario puede completar el flujo principal | Funcional |
| TC-XXX | Usuario no autorizado no puede acceder | Seguridad |
| TC-XXX | Campos obligatorios son validados | Validación |

## 10. Impacto en documentación

- [ ] Actualizar README.
- [ ] Actualizar requisitos.
- [ ] Actualizar API spec.
- [ ] Actualizar guía de usuario.
- [ ] No aplica.

## 11. Checklist antes de implementar

- [ ] La funcionalidad tiene objetivo claro.
- [ ] Está vinculada a requisitos.
- [ ] Tiene criterios de aceptación.
- [ ] Tiene pruebas definidas.
- [ ] Se entiende el impacto técnico.
- [ ] Se entiende el impacto en usuario.

## 12. Checklist antes de cerrar

- [ ] Código implementado.
- [ ] Pruebas ejecutadas.
- [ ] Criterios de aceptación cumplidos.
- [ ] Pull request revisado.
- [ ] Documentación actualizada.
- [ ] Release notes actualizadas.
