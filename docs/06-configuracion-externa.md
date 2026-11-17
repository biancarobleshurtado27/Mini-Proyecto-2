# Configuración externa pendiente

Esta es la única configuración que no puede completarse sin credenciales del propietario del proyecto.

## Google Drive

1. En Google Cloud Console, habilitar **Google Drive API** en el proyecto del Mini Proyecto #1 o crear uno nuevo.
2. Crear una cuenta de servicio y descargar su JSON.
3. Guardar ese archivo como `service-account.json` en la raíz del repositorio. El archivo está ignorado por Git.
4. Crear una carpeta de Drive para las políticas y compartirla con el correo de la cuenta de servicio, con permiso de lector.
5. Subir los 12 documentos de `docs/policies/`, el PDF de `output/pdf/` y una hoja de cálculo/Google Sheet.
6. Copiar el ID de la carpeta desde la URL de Drive.

## Modelo de embeddings

1. Crear o reutilizar una clave API del proveedor seleccionado.
2. Copiar `.env.example` a `.env`.
3. Definir `OPENAI_API_KEY`, `OPENAI_EMBEDDING_MODEL` y `GOOGLE_DRIVE_FOLDER_ID`.
4. No comparta ni pegue las claves en el chat ni las suba a Git.

## Prueba posterior

Con el backend iniciado, un usuario RRHH debe llamar `POST /api/ingestion/sync`. La respuesta debe devolver los conteos `indexed`, `updated` y `files_seen`.
