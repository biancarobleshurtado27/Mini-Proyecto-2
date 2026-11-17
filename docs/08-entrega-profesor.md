# Entrega Mini Proyecto 2

## Entregables incluidos

1. Código fuente del portal TicoTalento.
   - `frontend/`: aplicación React.
   - `backend/`: API Node.js con Express, agentes y acceso a PostgreSQL.
   - `compose.yaml`: base de datos PostgreSQL con pgvector.
2. Documentación del alcance, arquitectura, gobernanza, normativa y pruebas.
3. Doce políticas de RRHH en `docs/policies/`.
4. Política de vacaciones en PDF: `output/pdf/politica-vacaciones.pdf`.
5. Hoja de cálculo para Google Sheets: `outputs/hr-policy-calendar/Calendario_feriados_Costa_Rica_2026.xlsx`.
6. Evidencia de pruebas: `docs/07-pruebas-validacion.md`.

## Enlace del repositorio

https://github.com/biancarobleshurtado27/Mini-Proyecto-2

## Archivos que no se entregan

Por seguridad, el paquete no incluye `.env`, `service-account.json`, `node_modules/`, `.git/` ni archivos de caché. La persona evaluadora debe crear su propio `.env` a partir de `.env.example` y usar sus propias credenciales.

## Ejecución local

1. Ejecutar `docker compose up -d db`.
2. Copiar `.env.example` como `.env` y completar las credenciales necesarias.
3. En `backend/`, ejecutar `npm install`, `npm run init-db`, `npm run seed` y `npm run dev`.
4. En `frontend/`, ejecutar `npm install` y `npm run dev`.

El portal queda disponible en `http://localhost:5173` y la API en `http://localhost:3001`.
