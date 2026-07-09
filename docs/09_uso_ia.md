# Guía para uso de IA en el desarrollo

## Principio

La IA puede acelerar el desarrollo, pero no debe reemplazar las decisiones de producto, arquitectura, seguridad ni negocio.

## Tareas que sí puede apoyar la IA

- Generar código inicial.
- Crear componentes repetitivos.
- Sugerir estructuras de carpetas.
- Escribir pruebas.
- Detectar errores comunes.
- Refactorizar código.
- Redactar documentación técnica inicial.
- Explicar código existente.
- Proponer alternativas técnicas.

## Tareas que deben ser decididas por humanos

- Qué problema se va a resolver.
- Qué funcionalidades son realmente necesarias.
- Qué queda fuera del alcance.
- Qué datos se van a guardar.
- Qué permisos debe tener cada usuario.
- Qué riesgos son aceptables.
- Qué decisiones técnicas son convenientes para el proyecto.
- Qué se considera terminado.
- Qué se libera a producción.

## Reglas para prompts de IA

Cada prompt técnico debe incluir:

1. Contexto del proyecto.
2. Archivo o módulo afectado.
3. Requisito relacionado.
4. Restricciones.
5. Resultado esperado.
6. Qué no debe modificar.
7. Criterios de aceptación.

## Plantilla de prompt para IA

Ver `/plantillas/plantilla_prompt_ia.md`.

## Reglas de revisión humana

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
