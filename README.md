# TicoTalento - Portal de RRHH con RAG multiagente

Portal interno para que colaboradores consulten políticas de RRHH y sus propios datos, mientras el equipo de RRHH consulta reportes agregados.

## Alcance del MVP

- Chat con políticas respaldadas por documentos y citas.
- Consulta de datos personales autorizados: vacaciones, solicitudes y próximo pago.
- Roles `COLABORADOR` y `RRHH`.
- Dashboard de RRHH con reportes diarios.
- Ingesta de documentos desde Google Drive hacia PostgreSQL con pgvector.

## Stack

- Backend: Node.js + Express.
- Base de datos: PostgreSQL + pgvector.
- Frontend: React + Vite.
- IA: proveedor configurable mediante variables de entorno.
- Documentos: Google Drive API con cuenta de servicio.

## Estructura

```text
server/        API, agentes y acceso a PostgreSQL en JavaScript
frontend/      Aplicación web
docs/          Políticas, arquitectura, gobernanza y evaluación
infra/         Docker y base de datos
```

## Inicio local

1. Copie `.env.example` a `.env` y complete los valores externos cuando estén disponibles.
2. Levante PostgreSQL con `docker compose up -d db`.
3. Desde `server`, ejecute `npm install`, `npm run init-db` y `npm run seed`.
4. Ejecute el backend con `npm run dev` desde `server`.
5. Desde `frontend`, ejecute `npm install` y `npm run dev`.

## Cuentas de demostración

- RRHH: `ana.alvarado.1@ticotalento.test`
- Colaborador: `carlos.diaz.2@ticotalento.test`
- Contraseña de demo: `Demo2026!`

## Configuración pendiente para RAG real

Consulte [la guía de configuración externa](docs/06-configuracion-externa.md). Sin la cuenta de servicio de Google Drive, el ID de carpeta y una clave de embeddings, la aplicación funciona con las políticas locales de demostración, pero no puede sincronizar ni vectorizar la carpeta real de Drive.

> Todos los datos del proyecto son simulados. El portal no sustituye decisiones de RRHH ni asesoría legal.
