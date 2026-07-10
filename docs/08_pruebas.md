# Plan de pruebas

## Estrategia

Se probarán los flujos principales del sistema antes de cerrar cada funcionalidad.

## Tipos de prueba

- Pruebas funcionales.
- Pruebas de validación.
- Pruebas de seguridad básicas.
- Pruebas de regresión simples.
- Pruebas manuales de usuario.

## Casos de prueba

| ID | Funcionalidad | Requisito | Caso | Resultado esperado | Estado |
|---|---|---|---|---|---|
| TC-001 | Login | RF-001 | Usuario inicia sesión con credenciales válidas | Accede al sistema | Pendiente |
| TC-002 | Login | RF-001 | Usuario usa contraseña incorrecta | Muestra error | Pendiente |
| TC-003 | Login | RNF-002 | Usuario no autenticado entra a ruta privada | Acceso bloqueado | Pendiente |
| TC-004 | Login | RF-001 | Usuario inactivo con credenciales válidas intenta iniciar sesión | Acceso rechazado con mensaje "usuario inactivo" | Pendiente |
