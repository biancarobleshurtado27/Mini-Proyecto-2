# Agentes del portal

- `orchestrator-agent.js`: clasifica y enruta cada consulta.
- `policy-agent.js`: responsable de recuperar políticas y generar respuestas con citas.
- `data-agent.js`: responde datos propios autorizados.
- `report-agent.js`: genera el reporte agregado de RRHH.
- `ingestion-agent.js`: sincroniza Drive e indexa documentos.

La implementación actual conserva los endpoints en `app.js` y separa las responsabilidades de clasificación, prompts, ingesta y migraciones para que el flujo sea auditable.
