# Guía mínima de documentación para desarrollo saludable de un aplicativo web con IA

## 1. Principio general

El objetivo de esta documentación no es burocratizar el proyecto. El objetivo es mantener claridad, trazabilidad y control mientras se desarrolla el aplicativo web, especialmente porque parte del trabajo técnico puede ser generado con IA.

La documentación debe permitir responder siempre estas preguntas:

1. Qué problema estamos resolviendo.
2. Para quién lo estamos resolviendo.
3. Qué debe hacer el sistema.
4. Qué no debe hacer.
5. Por qué se tomó cada decisión importante.
6. Qué funcionalidad se está implementando.
7. Qué requisitos cubre.
8. Qué pruebas demuestran que funciona.
9. Qué cambios se hicieron en el código.
10. Qué impacto tiene sobre el producto existente.

## 2. Regla central

Cada funcionalidad nueva debe tener una ruta trazable:

```txt
Necesidad → Requisito → Diseño → Implementación → Prueba → Release
```

Nada debería llegar a código sin poder conectarse con una necesidad o decisión documentada.

---

# Estructura documental recomendada

## 1. Documento de visión del producto

### Nombre sugerido

```txt
01_vision_producto.md
```

### Propósito

Define qué se está construyendo, por qué existe el aplicativo y cuáles son sus límites generales.

### Lo debe pensar un humano

Este documento no debe salir completamente de IA. La IA puede ayudar a redactar, pero las decisiones deben venir del equipo humano.

### Contenido mínimo

```md
# Visión del producto

## Problema

¿Qué problema real queremos resolver?

## Usuario objetivo

¿Quién usará el aplicativo?

## Objetivo principal

¿Qué resultado debe lograr el usuario usando la plataforma?

## Alcance inicial

¿Qué sí se construirá en la primera versión?

## Fuera de alcance

¿Qué no se construirá todavía?

## Criterios de éxito

¿Cómo sabremos que el aplicativo funciona o tiene valor?

## Riesgos principales

¿Qué podría salir mal?
```

### Ejemplo corto

```md
# Visión del producto

## Problema

Los usuarios necesitan registrar y consultar información de forma simple sin depender de hojas de cálculo desordenadas.

## Usuario objetivo

Usuarios internos con conocimientos técnicos básicos o nulos.

## Objetivo principal

Permitir capturar, consultar y actualizar registros desde una interfaz web sencilla.

## Alcance inicial

- Inicio de sesión.
- Alta, edición, consulta y eliminación de registros.
- Vista de listado.
- Búsqueda básica.
- Roles simples: administrador y usuario.

## Fuera de alcance

- App móvil nativa.
- Integraciones externas.
- Analítica avanzada.
- Automatizaciones complejas.

## Criterios de éxito

- Un usuario puede completar el flujo principal sin ayuda.
- Los datos se guardan correctamente.
- El sistema puede ser desplegado y mantenido sin depender de una sola persona.

## Riesgos principales

- Construir funcionalidades innecesarias.
- Perder trazabilidad por usar IA sin control.
- Falta de pruebas.
```

---

## 2. Documento de arquitectura simple

### Nombre sugerido

```txt
02_arquitectura.md
```

### Propósito

Explica cómo está construido el sistema a nivel general.

No debe ser demasiado técnico, pero sí debe permitir que alguien nuevo entienda cómo está organizado el aplicativo.

### Contenido mínimo

```md
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
```

---

## 3. Documento de requisitos funcionales

### Nombre sugerido

```txt
03_requisitos.md
```

### Propósito

Lista lo que el sistema debe hacer.

Debe ser simple, pero estructurado. Cada requisito necesita un identificador único para poder rastrearlo después.

### Formato recomendado

```md
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
```

### Convención de identificadores

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Requisito funcional | RF | RF-001 |
| Requisito no funcional | RNF | RNF-001 |
| Historia de usuario | HU | HU-001 |
| Decisión técnica | ADR | ADR-001 |
| Prueba | TC | TC-001 |
| Funcionalidad | FEAT | FEAT-001 |
| Bug | BUG | BUG-001 |

---

## 4. Documento de requisitos no funcionales

### Nombre sugerido

```txt
04_requisitos_no_funcionales.md
```

### Propósito

Define condiciones de calidad del sistema: seguridad, rendimiento, mantenibilidad, usabilidad, disponibilidad y escalabilidad.

### Contenido mínimo

```md
# Requisitos no funcionales

## RNF-001 - Seguridad de contraseñas

Las contraseñas deben almacenarse usando hashing seguro.

## RNF-002 - Acceso protegido

Las rutas privadas no deben poder consultarse sin autenticación.

## RNF-003 - Usabilidad

El usuario debe poder completar el flujo principal sin capacitación técnica.

## RNF-004 - Rendimiento

Las vistas principales deben cargar en un tiempo razonable para una aplicación sencilla.

## RNF-005 - Mantenibilidad

El código debe estar organizado por módulos y contar con instrucciones claras de instalación.

## RNF-006 - Trazabilidad

Cada funcionalidad nueva debe estar vinculada a un requisito, issue, prueba y pull request.
```

---

## 5. Backlog de funcionalidades

### Nombre sugerido

```txt
05_backlog.md
```

### Propósito

Es la lista viva de funcionalidades, mejoras, bugs y tareas técnicas.

Este documento puede convivir con GitHub Issues, Jira, Trello, Linear o cualquier herramienta. Si se usa una herramienta externa, este documento puede funcionar como índice o resumen.

### Formato recomendado

```md
# Backlog

| ID | Tipo | Nombre | Prioridad | Estado | Requisito relacionado |
|---|---|---|---|---|---|
| FEAT-001 | Feature | Login de usuarios | Alta | Pendiente | RF-001 |
| FEAT-002 | Feature | CRUD de registros | Alta | Pendiente | RF-002 |
| FEAT-003 | Feature | Búsqueda básica | Media | Pendiente | RF-003 |
| BUG-001 | Bug | Error al guardar registro vacío | Alta | Pendiente | RF-002 |
| TECH-001 | Técnico | Configurar pruebas automáticas | Alta | Pendiente | RNF-006 |
```

### Tipos permitidos

- `Feature`
- `Bug`
- `Técnico`
- `Mejora`
- `Documentación`
- `Seguridad`
- `Refactor`

---

## 6. Plantilla para nueva funcionalidad

### Nombre sugerido

Carpeta:

```txt
/funcionalidades
```

Archivo por funcionalidad:

```txt
FEAT-001_login_usuarios.md
```

### Propósito

Esta es la pieza más importante para agregar funcionalidades sin perder control.

Cada vez que se quiera implementar algo nuevo, se llena esta plantilla antes de programar.

### Plantilla

```md
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

- [ ] Criterio 1.
- [ ] Criterio 2.
- [ ] Criterio 3.

## 7. Reglas de negocio

- Regla 1.
- Regla 2.

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
```

---

## 7. Registro de decisiones técnicas

### Nombre sugerido

Carpeta:

```txt
/decisiones
```

Archivo por decisión:

```txt
ADR-001_stack_tecnologico.md
```

### Propósito

Evita que el equipo olvide por qué tomó una decisión.

Esto es especialmente importante cuando se usa IA, porque la IA puede sugerir cambios técnicos sin conocer el contexto del proyecto.

### Plantilla ADR

```md
# ADR-XXX - Título de la decisión

## Estado

Propuesta / Aceptada / Rechazada / Reemplazada.

## Contexto

¿Qué situación nos obligó a tomar esta decisión?

## Decisión

¿Qué decidimos?

## Alternativas consideradas

1. Alternativa A.
2. Alternativa B.
3. Alternativa C.

## Consecuencias positivas

- Beneficio 1.
- Beneficio 2.

## Consecuencias negativas

- Costo 1.
- Riesgo 1.

## Fecha

AAAA-MM-DD.
```

### Ejemplo

```md
# ADR-001 - Uso de Next.js para frontend y backend ligero

## Estado

Aceptada.

## Contexto

El aplicativo web será sencillo, con pocas vistas, autenticación, operaciones CRUD y necesidad de despliegue rápido.

## Decisión

Usaremos Next.js como framework principal para frontend y backend ligero mediante API routes o server actions.

## Alternativas consideradas

1. React + Express.
2. Next.js.
3. Vue + Node.js.

## Consecuencias positivas

- Menos separación inicial entre frontend y backend.
- Despliegue más simple.
- Buena compatibilidad con herramientas modernas.
- Menos complejidad para un aplicativo pequeño.

## Consecuencias negativas

- Puede volverse limitado si el backend crece demasiado.
- Requiere disciplina para no mezclar lógica de negocio con UI.

## Fecha

2026-07-09.
```

---

## 8. Especificación de API

### Nombre sugerido

```txt
06_api.md
```

### Propósito

Define los endpoints o acciones que comunican frontend y backend.

Si el proyecto es muy sencillo, no hace falta OpenAPI desde el día uno. Un Markdown claro puede ser suficiente.

### Formato recomendado

```md
# API

## POST /api/login

### Propósito

Permitir que un usuario inicie sesión.

### Request

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}

### Response exitoso

{
  "userId": "123",
  "name": "Usuario Demo",
  "role": "admin"
}

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
```

---

## 9. Modelo de datos

### Nombre sugerido

```txt
07_modelo_datos.md
```

### Propósito

Define las entidades principales, sus campos y relaciones.

### Formato recomendado

```md
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
```

---

## 10. Plan de pruebas mínimo

### Nombre sugerido

```txt
08_pruebas.md
```

### Propósito

Define cómo se comprobará que el sistema funciona.

No necesitas una documentación pesada, pero sí una tabla clara de pruebas.

### Formato recomendado

```md
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
```

---

## 11. Guía para uso de IA en el desarrollo

### Nombre sugerido

```txt
09_uso_ia.md
```

### Propósito

Define qué puede hacer la IA y qué no debe delegarse completamente.

### Principio

La IA puede acelerar el desarrollo, pero no debe reemplazar las decisiones de producto, arquitectura, seguridad ni negocio.

### Tareas que sí puede apoyar la IA

- Generar código inicial.
- Crear componentes repetitivos.
- Sugerir estructuras de carpetas.
- Escribir pruebas.
- Detectar errores comunes.
- Refactorizar código.
- Redactar documentación técnica inicial.
- Explicar código existente.
- Proponer alternativas técnicas.

### Tareas que deben ser decididas por humanos

- Qué problema se va a resolver.
- Qué funcionalidades son realmente necesarias.
- Qué queda fuera del alcance.
- Qué datos se van a guardar.
- Qué permisos debe tener cada usuario.
- Qué riesgos son aceptables.
- Qué decisiones técnicas son convenientes para el proyecto.
- Qué se considera terminado.
- Qué se libera a producción.

### Reglas para prompts de IA

Cada prompt técnico debe incluir:

1. Contexto del proyecto.
2. Archivo o módulo afectado.
3. Requisito relacionado.
4. Restricciones.
5. Resultado esperado.
6. Qué no debe modificar.
7. Criterios de aceptación.

### Plantilla de prompt para IA

```md
Estoy trabajando en el proyecto [nombre].

Necesito implementar [funcionalidad], relacionada con:
- Requisito: RF-XXX
- Funcionalidad: FEAT-XXX

Contexto:
[explicar contexto]

Restricciones:
- No modificar [archivo/módulo].
- Mantener la estructura actual.
- No agregar dependencias sin justificar.
- Mantener código simple y legible.
- Incluir validaciones necesarias.
- Incluir pruebas cuando aplique.

Resultado esperado:
[describir resultado]

Criterios de aceptación:
- [criterio 1]
- [criterio 2]
- [criterio 3]

Antes de dar código, explica brevemente el enfoque.
```

### Reglas de revisión humana

Antes de aceptar código generado por IA:

- [ ] Entiendo qué hace el código.
- [ ] El código corresponde al requisito.
- [ ] No agrega complejidad innecesaria.
- [ ] No introduce dependencias sin necesidad.
- [ ] No expone secretos.
- [ ] No rompe flujos existentes.
- [ ] Tiene manejo básico de errores.
- [ ] Tiene pruebas o forma clara de validarse.
- [ ] Está documentado si cambia comportamiento importante.

---

## 12. README del proyecto

### Nombre sugerido

```txt
README.md
```

### Propósito

Debe permitir que alguien entienda, instale y ejecute el proyecto.

### Contenido mínimo

```md
# Nombre del proyecto

## Descripción

¿Qué hace este aplicativo?

## Stack

- Frontend:
- Backend:
- Base de datos:
- Autenticación:
- Hosting:

## Requisitos previos

- Node.js versión X
- Base de datos X
- Variables de entorno necesarias

## Instalación

npm install

## Ejecución local

npm run dev

## Variables de entorno

DATABASE_URL=
AUTH_SECRET=

## Estructura del proyecto

/src
  /app
  /components
  /lib
  /services
  /tests
/docs

## Scripts principales

| Comando | Descripción |
|---|---|
| npm run dev | Ejecuta ambiente local |
| npm run build | Compila el proyecto |
| npm run test | Ejecuta pruebas |
| npm run lint | Revisa formato y errores |

## Documentación

- Visión del producto: `/docs/01_vision_producto.md`
- Arquitectura: `/docs/02_arquitectura.md`
- Requisitos: `/docs/03_requisitos.md`
- Backlog: `/docs/05_backlog.md`
- API: `/docs/06_api.md`
- Pruebas: `/docs/08_pruebas.md`
```

---

## 13. Release notes

### Nombre sugerido

```txt
10_release_notes.md
```

### Propósito

Registra qué cambió en cada versión.

### Formato recomendado

```md
# Release notes

## v0.1.0 - AAAA-MM-DD

### Agregado

- FEAT-001 - Login de usuarios.
- FEAT-002 - CRUD de registros.

### Corregido

- BUG-001 - Validación de campos vacíos.

### Cambios técnicos

- ADR-001 - Definición de stack tecnológico.

### Requisitos cubiertos

- RF-001
- RF-002
- RNF-001
- RNF-002
```

---

# Estructura recomendada de carpetas

```txt
/docs
  01_vision_producto.md
  02_arquitectura.md
  03_requisitos.md
  04_requisitos_no_funcionales.md
  05_backlog.md
  06_api.md
  07_modelo_datos.md
  08_pruebas.md
  09_uso_ia.md
  10_release_notes.md

  /funcionalidades
    FEAT-001_login_usuarios.md
    FEAT-002_crud_registros.md

  /decisiones
    ADR-001_stack_tecnologico.md
    ADR-002_autenticacion.md

  /plantillas
    plantilla_funcionalidad.md
    plantilla_adr.md
    plantilla_bug.md
    plantilla_prompt_ia.md
```

---

# Flujo para crear una nueva funcionalidad

## Paso 1: Registrar la necesidad

Agregar la funcionalidad al backlog.

```md
| FEAT-004 | Feature | Exportar registros a CSV | Media | Pendiente | RF-006 |
```

## Paso 2: Crear documento de funcionalidad

Crear archivo:

```txt
/docs/funcionalidades/FEAT-004_exportar_registros_csv.md
```

## Paso 3: Vincular requisitos

Agregar o actualizar requisitos en:

```txt
/docs/03_requisitos.md
```

Ejemplo:

```md
## RF-006 - Exportación de registros

El usuario administrador debe poder exportar los registros visibles a un archivo CSV.
```

## Paso 4: Definir criterios de aceptación

Ejemplo:

```md
- [ ] El administrador puede exportar registros desde la vista principal.
- [ ] El archivo generado tiene formato CSV.
- [ ] El archivo incluye solo los registros permitidos para ese usuario.
- [ ] El sistema no permite exportar a usuarios sin permiso.
```

## Paso 5: Diseñar impacto técnico

Actualizar si aplica:

- `06_api.md`
- `07_modelo_datos.md`
- `02_arquitectura.md`
- ADR si hay una decisión importante.

## Paso 6: Implementar

El branch debe llamarse de forma trazable:

```txt
feature/FEAT-004-exportar-registros-csv
```

Los commits deben mencionar el ID:

```txt
FEAT-004: add CSV export endpoint
FEAT-004: add export button to records table
FEAT-004: add authorization check for export
```

## Paso 7: Probar

Agregar casos de prueba en:

```txt
/docs/08_pruebas.md
```

Ejemplo:

```md
| TC-021 | Exportar CSV | RF-006 | Admin exporta registros | Se descarga CSV válido | Pendiente |
```

## Paso 8: Pull request

El PR debe incluir:

```md
## Funcionalidad

FEAT-004 - Exportar registros a CSV

## Requisitos relacionados

- RF-006
- RNF-002

## Cambios realizados

- Se agregó endpoint de exportación.
- Se agregó botón en la tabla de registros.
- Se agregó validación de permisos.

## Pruebas

- [ ] TC-021
- [ ] TC-022
- [ ] Prueba manual realizada

## Documentación actualizada

- [ ] 03_requisitos.md
- [ ] 06_api.md
- [ ] 08_pruebas.md
- [ ] 10_release_notes.md
```

## Paso 9: Cierre

Una funcionalidad solo se considera cerrada si:

- Está implementada.
- Está probada.
- Cumple criterios de aceptación.
- Tiene PR revisado.
- La documentación fue actualizada.
- Aparece en release notes.

---

# Trazabilidad mínima obligatoria

Cada funcionalidad debe tener esta cadena:

```txt
FEAT-XXX
  ├── RF-XXX / RNF-XXX
  ├── Documento de funcionalidad
  ├── Branch
  ├── Commits
  ├── Pull Request
  ├── Casos de prueba TC-XXX
  └── Release notes
```

Ejemplo:

```txt
FEAT-004 Exportar registros CSV
  ├── RF-006 Exportación de registros
  ├── RNF-002 Acceso protegido
  ├── /docs/funcionalidades/FEAT-004_exportar_registros_csv.md
  ├── feature/FEAT-004-exportar-registros-csv
  ├── FEAT-004: add CSV export endpoint
  ├── PR #12
  ├── TC-021, TC-022
  └── v0.2.0
```

---

# Documentos mínimos obligatorios

Para un aplicativo web sencillo, estos son suficientes:

1. `01_vision_producto.md`
2. `02_arquitectura.md`
3. `03_requisitos.md`
4. `04_requisitos_no_funcionales.md`
5. `05_backlog.md`
6. `/funcionalidades/FEAT-XXX.md`
7. `/decisiones/ADR-XXX.md`
8. `08_pruebas.md`
9. `09_uso_ia.md`
10. `README.md`
11. `10_release_notes.md`

No conviene iniciar con más que esto.

---

# Documentos opcionales

Solo agregar si el proyecto lo necesita:

| Documento | Cuándo usarlo |
|---|---|
| OpenAPI completo | Cuando la API crezca o haya consumidores externos |
| Manual de usuario | Cuando haya usuarios no técnicos |
| Threat model formal | Cuando haya datos sensibles, pagos o permisos complejos |
| Plan de despliegue | Cuando haya producción real |
| Runbook | Cuando alguien tenga que operar el sistema |
| SLA | Cuando haya compromiso formal con clientes |
| Política de privacidad | Cuando se recolecten datos personales |
| Términos de uso | Cuando haya usuarios externos |
| DPIA/PIA | Cuando se traten datos sensibles o regulados |

---

# Checklist de salud del desarrollo

## Producto

- [ ] Sabemos qué problema resolvemos.
- [ ] Sabemos para quién lo resolvemos.
- [ ] Sabemos qué queda fuera del alcance.
- [ ] Cada funcionalidad tiene justificación.

## Requisitos

- [ ] Cada requisito tiene ID.
- [ ] Cada funcionalidad se conecta a un requisito.
- [ ] Cada requisito tiene criterios de aceptación.
- [ ] Los requisitos no están mezclados con soluciones técnicas innecesarias.

## Técnica

- [ ] La arquitectura está documentada.
- [ ] Las decisiones importantes tienen ADR.
- [ ] El modelo de datos está actualizado.
- [ ] La API está documentada.
- [ ] El código sigue una estructura clara.

## IA

- [ ] La IA no decide el producto.
- [ ] La IA no cambia arquitectura sin revisión humana.
- [ ] Todo código generado por IA se revisa.
- [ ] Los prompts incluyen contexto y restricciones.
- [ ] No se aceptan cambios que no se entiendan.

## Pruebas

- [ ] Cada funcionalidad tiene pruebas asociadas.
- [ ] Hay pruebas para casos exitosos.
- [ ] Hay pruebas para errores comunes.
- [ ] Hay pruebas básicas de seguridad.
- [ ] Antes de cerrar una funcionalidad se ejecutan pruebas.

## Trazabilidad

- [ ] La funcionalidad aparece en backlog.
- [ ] Tiene documento propio.
- [ ] Está vinculada a requisitos.
- [ ] Tiene branch relacionado.
- [ ] Sus commits mencionan el ID.
- [ ] El PR menciona requisitos y pruebas.
- [ ] Aparece en release notes.

---

# Regla práctica final

Para mantener el desarrollo sano:

1. No documentar todo.
2. Documentar lo necesario.
3. Usar IDs en todo.
4. No implementar sin criterios de aceptación.
5. No aceptar código de IA que no se entienda.
6. No cerrar funcionalidades sin pruebas.
7. No tomar decisiones técnicas importantes sin registrarlas.
8. No permitir funcionalidades huérfanas sin requisito, prueba o release note.
