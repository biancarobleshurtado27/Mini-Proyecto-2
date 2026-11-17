# Arquitectura del portal

```mermaid
flowchart LR
  U[Colaborador o RRHH] --> F[React: Login, Chat y Dashboard]
  F --> API[Node.js + Express]
  API --> AUTH[Autenticación JWT y RBAC]
  API --> ORQ[Agente orquestador]
  ORQ -->|Política| RAG[Agente de políticas]
  ORQ -->|Dato propio| DATA[Agente de datos]
  RAG --> VEC[(PostgreSQL + pgvector)]
  DATA --> DB[(PostgreSQL)]
  DRIVE[Google Drive] --> ING[Agente de ingesta]
  ING --> VEC
  API --> ANALYST[Agente analista]
  ANALYST --> DB
  ANALYST --> REPORTS[reportes_diarios]
  REPORTS --> F
  ORQ --> LOGS[consultas_chat y auditoría]
  LOGS --> ANALYST
```

## Controles clave

- El agente de políticas no consulta tablas personales.
- El agente de datos filtra por el usuario autenticado.
- El dashboard requiere el rol `RRHH`.
- El resumen del reporte parte de un JSON SQL y no genera cifras nuevas.
- Las consultas restringidas se rechazan y se registran.
