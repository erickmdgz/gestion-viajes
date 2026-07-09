# Arquitectura del sistema

## Resumen

Descripción breve de cómo funciona el sistema.

## Stack tecnológico

- Frontend:
- Backend:
- Base de datos:
- Autenticación:
- Hosting:
- Repositorio:

## Diagrama general

Usuario → Frontend → Backend/API → Base de datos

## Módulos principales

| Módulo | Responsabilidad |
|---|---|
| Autenticación | Manejo de login, logout y sesión |
| Usuarios | Administración de usuarios |
| Registros | CRUD principal del sistema |
| Configuración | Parámetros generales |

## Reglas de arquitectura

- Separar frontend, backend y base de datos.
- No mezclar lógica de negocio con componentes visuales.
- No escribir consultas directas a base de datos desde el frontend.
- Toda funcionalidad nueva debe tener pruebas mínimas.
- Todo cambio relevante debe estar asociado a un issue o documento de funcionalidad.

## Decisiones importantes

Ver carpeta `/decisiones`.
