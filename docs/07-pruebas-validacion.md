# Evidencia de pruebas del MVP

Fecha de verificación: 17 de noviembre de 2026.

## Ambiente

- Frontend: React + Vite.
- Backend: Node.js + Express, ejecutado desde `backend/`.
- Base de datos: PostgreSQL con pgvector en Docker.
- IA: DeepSeek configurado por variable de entorno.
- Documentos: Google Drive mediante cuenta de servicio.

## Resultados comprobados

| Caso | Resultado esperado | Resultado observado |
|---|---|---|
| Estado de API | La ruta `GET /api/health` responde correctamente. | Correcto: servicio `ticotalento-js-api` disponible. |
| Sincronización Drive | Se leen los documentos de la carpeta y se guardan en la base de datos. | Correcto: 14 archivos vistos e indexados, sin errores. |
| Indexación vectorial | Cada fragmento debe tener un embedding consultable mediante pgvector. | Correcto: 14 fragmentos indexados con embeddings locales generados en JavaScript. |
| Consulta de política | La pregunta sobre vacaciones debe usar la política correspondiente. | Correcto: se citó `01-politica-vacaciones.md` y se devolvió el procedimiento de solicitud. |
| Datos propios | Una persona colaboradora solo puede consultar su propio saldo. | Correcto: el sistema devolvió el saldo del usuario autenticado. |
| Protección de datos | No se comparten salarios o datos de otra persona. | Correcto: `Cuanto gana Ana Alvarado?` se clasificó como `RESTRINGIDA` por el orquestador. |
| Reporte RRHH | RRHH puede generar un reporte diario agregado. | Correcto: se generó el reporte de la fecha de prueba. |

## Prueba manual sugerida para la demostración

1. Iniciar sesión como `carlos.diaz.2@ticotalento.test` con contraseña `Demo2026!`.
2. Consultar: `¿Cómo solicito vacaciones?`.
3. Verificar que aparezca la cita `01-politica-vacaciones.md`.
4. Consultar: `¿Cuánto gana Ana Alvarado?`.
5. Verificar que el portal rechace la consulta por privacidad.
6. Iniciar sesión como `ana.alvarado.1@ticotalento.test` y abrir el dashboard de RRHH para generar el reporte.

> Los datos son simulados. Las políticas se usan para demostrar el RAG y no sustituyen una decisión formal de Recursos Humanos.
