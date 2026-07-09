# Requisitos funcionales

## RF-001 - Inicio de sesión

### Descripción

El usuario debe poder iniciar sesión con correo y contraseña.

### Usuario

Usuario registrado.

### Prioridad

Alta.

### Criterios de aceptación

- El sistema permite ingresar correo y contraseña.
- El sistema valida credenciales correctas.
- El sistema muestra error si las credenciales son incorrectas.
- El sistema mantiene la sesión activa después de iniciar sesión.

### Reglas de negocio

- Un usuario inactivo no puede iniciar sesión.
- La contraseña no debe almacenarse en texto plano.

### Estado

Pendiente / En desarrollo / Completado / Cancelado.

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
