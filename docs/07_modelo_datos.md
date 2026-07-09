# Modelo de datos

## Entidad: Usuario

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| id | UUID | Sí | Identificador único |
| name | String | Sí | Nombre del usuario |
| email | String | Sí | Correo único |
| password_hash | String | Sí | Contraseña cifrada |
| role | String | Sí | admin/user |
| status | String | Sí | active/inactive |
| created_at | DateTime | Sí | Fecha de creación |

## Reglas

- El email debe ser único.
- La contraseña nunca se almacena en texto plano.
- Un usuario inactivo no puede iniciar sesión.
