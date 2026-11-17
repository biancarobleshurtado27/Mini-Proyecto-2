# Seguimiento de requerimientos

Leyenda: `[x]` completado, `[-]` en progreso, `[ ]` pendiente.

## Fundación técnica

- [x] Repositorio inicial, README, `.gitignore` y `.env.example`.
- [x] Backend Node.js/Express con endpoint de salud.
- [x] Contenedor PostgreSQL + pgvector definido.
- [x] Modelo relacional y 50 colaboradores con 3 meses de movimientos simulados, cargados y verificados en PostgreSQL.
- [x] Frontend React con login, chat, dashboard, cuatro indicadores y dos gráficas; compilación verificada.

## Investigación y documentos

- [x] Empresa ficticia y alcance del MVP definidos.
- [x] Gobernanza de IA, privacidad y reglas del portal definidas.
- [-] Investigación de normativa laboral de Costa Rica con fuentes oficiales (base y fuentes documentadas; falta incorporarla en las políticas).
- [x] Doce documentos de políticas redactados, versionados y estructurados para RAG.
- [ ] Carpeta de Google Drive configurada y compartida con la cuenta de servicio.

## Agentes y RAG

- [-] Agente de ingesta: código para Drive, PDF/Docs/Sheets y fragmentación; faltan credenciales y estrategia de embeddings.
- [-] Base vectorial con metadatos, versiones y enlaces de origen; falta poblarla desde Drive.
- [x] Orquestador: política, dato personal, consulta mixta, restringida y fuera de alcance.
- [-] Agente de políticas con recuperación local y citas; falta ingestión Drive, embeddings y pgvector.
- [x] Agente de datos con SQL de solo lectura y filtro por usuario autenticado.
- [x] Agente analista: calcula reporte JSON y resumen determinista basado en SQL.

## Seguridad y gobernanza

- [x] Política de gobernanza y límite de cada agente documentados.
- [x] Autenticación JWT y roles `COLABORADOR` / `RRHH` en la API.
- [x] Control de acceso a datos propios y rechazo de datos de terceros en el chat.
- [x] Registro de consultas, citas, latencia y escalamiento en `consultas_chat`.
- [ ] Secretos configurados fuera del repositorio.

## Dashboard y reportes

- [x] Reporte diario en JSON con cifras calculadas por SQL y tarea programada a las 7:00 a. m.
- [x] Resumen ejecutivo basado únicamente en el JSON.
- [x] Cuatro indicadores, dos gráficas, tendencia de 30 días y tabla de solicitudes pendientes en el dashboard.
- [x] Historial de reportes y acceso exclusivo de RRHH en la API.

## Calidad y entrega

- [x] Banco de 45 preguntas con respuesta esperada y criterio de éxito.
- [ ] 80% o más de respuestas correctas y citadas.
- [-] README de instalación y diagrama de arquitectura (diagrama creado; falta completar configuración real de Drive/IA).
- [ ] Informe técnico de 8-12 páginas.
- [ ] Video demo de 5 minutos.
