# API

## POST /api/login

### Propósito

Permitir que un usuario inicie sesión.

### Request

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

### Response exitoso

```json
{
  "userId": "123",
  "name": "Usuario Demo",
  "role": "admin"
}
```

### Errores

| Código | Causa |
|---|---|
| 400 | Datos incompletos |
| 401 | Credenciales incorrectas |
| 403 | Usuario inactivo |

### Requisitos relacionados

- RF-001
- RNF-001
- RNF-002
