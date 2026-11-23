# Seguridad aplicada - Mini Proyecto TicoTalento

## Alcance y principio de diseño

Este documento cubre el entorno local del Mini Proyecto. No existe un sistema absolutamente “impenetrable”; la meta es reducir la superficie de ataque, limitar el impacto y detectar errores. Las pruebas se ejecutan solo contra `localhost` y datos de demostración.

## Controles implementados

| Riesgo | Control aplicado | Evidencia en el proyecto |
|---|---|---|
| Inyección SQL | Sequelize para consultas por modelo y consultas `pg` parametrizadas con `$1`, `$2`, etc. | `backend/src/app.js`, `backend/src/drive.js`, `backend/src/seed.js` |
| Entradas inseguras | Límites de tamaño del JSON (16 KB), validación de tipo, longitud, correo y preguntas; se rechazan etiquetas/script URLs peligrosos. | `textInput`, `validateLogin`, `validateQuestion` |
| XSS | React escapa texto por defecto; no se usa `dangerouslySetInnerHTML`; se valida la entrada y hay CSP tanto en API (Helmet) como en el cliente. | `frontend/index.html`, `backend/src/app.js` |
| CSRF | Operaciones `POST` autenticadas exigen token CSRF, cookie `HttpOnly; SameSite=Strict` y comparación de tiempo constante. | middleware `csrf` y `X-CSRF-Token` |
| CORS | Lista explícita de orígenes, métodos `GET`/`POST`, encabezados mínimos y rechazo HTTP 403 para orígenes externos. | middleware CORS/origin |
| Abuso de API | Máximo general de 120 solicitudes/minuto y 10 inicios de sesión/15 minutos por IP. | `express-rate-limit` |
| Cabeceras HTTP | CSP, bloqueo de framing, `nosniff`, política de referente y ocultamiento de `X-Powered-By`. | `helmet` |
| Sesión | JWT HS256 con emisor, audiencia, vencimiento de 8 horas y token CSRF por sesión. La app conserva la sesión en `sessionStorage`, no persistentemente. | `issueSession`, frontend |
| Autorización | JWT y verificación del usuario activo; funciones de reportes/ingesta requieren rol `RRHH`. | middleware `auth` y `rrhh` |

## Investigación: inyección SQL

### Qué es y cómo funciona

La inyección SQL ocurre cuando datos no confiables pasan a formar parte de la sintaxis de una consulta. Si el programa concatena texto con SQL, una entrada puede cambiar la lógica de autenticación o de filtrado. OWASP indica que la defensa principal es separar estructura y valores mediante consultas parametrizadas; validar entradas complementa esa medida, pero no la sustituye.

### Tipos frecuentes

- **In-band**: el resultado llega por la misma respuesta; incluye variantes basadas en error y `UNION`.
- **Blind/inferencial**: el atacante deduce información por diferencias booleanas o tiempos, sin recibir filas directamente.
- **Out-of-band**: la base o el servidor provoca una interacción por otro canal; requiere capacidades específicas del entorno.

### Casos reales conocidos

- La investigación de la ICO sobre TalkTalk registró una intrusión SQLi de 2015 que permitió acceder a datos personales de clientes; el regulador impuso una multa de GBP 400,000.
- El Departamento de Justicia de EE. UU. documentó campañas que emplearon SQLi para obtener datos de tarjetas y datos personales de distintas organizaciones.

### Prevención aplicada y pendiente para producción

1. Mantener ORM/consultas parametrizadas. Nunca formar SQL con valores del usuario.
2. Para nombres de columnas, ordenamientos o tablas, usar listas permitidas de valores fijos; los parámetros solo sirven para valores, no estructura SQL.
3. Usar una cuenta de base de datos de mínimo privilegio, separada de la cuenta de administración.
4. Rotar secretos, obligar HTTPS en producción, revisar dependencias y enviar logs a una plataforma centralizada.
5. Realizar pruebas de seguridad y revisión de código antes de cada despliegue.

## Simulación local y controlada

No se incorpora una versión vulnerable ejecutable: eso dejaría una puerta insegura en el repositorio. En la presentación se muestra conceptualmente que una aplicación vulnerable concatenaría una entrada de login dentro de una sentencia SQL. En TicoTalento, la misma entrada se envía solo al servidor local y se rechaza por la validación; incluso si llegara a una consulta, el ORM/consulta parametrizada la trata como dato y no como código.

### Ejecutar evidencia reproducible

1. Iniciar PostgreSQL y el backend local.
2. En otra terminal, ejecutar `npm run security-check` desde `backend`.
3. Tomar una captura de la consola con los cinco resultados esperados:
   - `403` para origen no autorizado.
   - `400` para el formato de entrada de SQLi.
   - `403` para una acción sin token CSRF.
   - `400` para entrada con etiqueta `script`.
   - `200` para una consulta legítima con sesión y CSRF válidos.

Esto demuestra que la funcionalidad legítima se conserva y que las solicitudes manipuladas fallan sin exponer datos.

### Resultado validado en entorno local - 23 de noviembre de 2026

| Prueba | Resultado esperado | Resultado observado |
|---|---:|---:|
| Origen CORS no autorizado | 403 | 403 |
| Origen local autorizado | 200 | 200 |
| Entrada con formato de SQLi en login | 400 | 400 |
| Acción autenticada sin token CSRF | 403 | 403 |
| Entrada XSS con etiqueta `script` | 400 | 400 |
| Consulta legítima con JWT, cookie y CSRF válidos | 200 | 200 |

También se ejecutó `npm audit --omit=dev` en el backend: no reportó vulnerabilidades de dependencias de producción. Para la captura de presentación, se puede repetir `npm run security-check` con Docker y el backend iniciados.

## Verificación manual segura

Precondición: Docker, backend (`http://localhost:3001`) y frontend (`http://127.0.0.1:5173`) deben estar activos. Estas pruebas se limitan al proyecto local y a datos de demostración.

| Control | Pasos manuales | Resultado correcto |
|---|---|---|
| Login legítimo | Iniciar sesión con una cuenta demo y contraseña válida. | Acceso al portal. |
| SQLi | En correo de inicio de sesión, escribir `x' OR '1'='1`; usar cualquier contraseña. | Mensaje de correo inválido; nunca inicia sesión. |
| XSS | Iniciar sesión, abrir Asistente IA y enviar `<script>alert(1)</script>`. | Error de entrada no permitida; no aparece alerta ni se ejecuta código. |
| CSRF | En DevTools > Console, ejecutar el bloque de abajo. | Respuesta HTTP `403`. |
| CORS | En PowerShell, ejecutar el comando de abajo. | Respuesta HTTP `403`. |
| Rol RRHH | Como colaborador, abrir DevTools > Console y ejecutar el segundo bloque. | Respuesta HTTP `403`. |
| CSP | En DevTools > Network, abrir una respuesta de la API y revisar `Content-Security-Policy`. | La cabecera existe y restringe scripts a `self`. |

### Prueba manual de CSRF en consola del navegador

```js
const session = JSON.parse(sessionStorage.getItem('ticotalento_session'));
fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`
  },
  body: JSON.stringify({ question: 'Consulta manual de seguridad' })
}).then((response) => console.log(response.status));
```

El bloque omite intencionalmente `X-CSRF-Token`; por eso debe imprimir `403`. No copies ni publiques el token de sesión.

### Prueba manual de autorización por rol

```js
const session = JSON.parse(sessionStorage.getItem('ticotalento_session'));
fetch('http://localhost:3001/api/reports/latest', {
  headers: { Authorization: `Bearer ${session.access_token}` }
}).then((response) => console.log(response.status));
```

Con una cuenta de colaborador debe imprimir `403`; un usuario RRHH autenticado sí puede consultar ese recurso.

### Prueba manual de CORS en PowerShell

```powershell
curl.exe -i -H "Origin: https://attacker.invalid" http://localhost:3001/api/health
```

Debe devolver `HTTP/1.1 403 Forbidden`. Para documentar el origen autorizado, cambia el valor de `Origin` por `http://127.0.0.1:5173`; debe devolver `200`.

## Guion breve para presentar

1. Explicar el riesgo: entrada no confiable no debe convertirse en instrucciones SQL o HTML.
2. Mostrar los controles: ORM/parámetros, validación, CSP/React, CSRF, CORS y rate limit.
3. Ejecutar `npm run security-check` en local y explicar cada código HTTP.
4. Concluir: la seguridad se mantiene con mínimo privilegio, actualizaciones, pruebas y monitoreo.

## Fuentes

- OWASP, [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).
- OWASP, [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).
- OWASP, [Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- UK Information Commissioner's Office, [investigación del ataque a TalkTalk](https://ico.org.uk/about-the-ico/media-centre/talktalk-cyber-attack-how-the-ico-s-investigation-unfolded/).
- U.S. Department of Justice, [caso de intrusiones mediante SQLi](https://www.justice.gov/usao-ma/pr/new-york-man-sentenced-69-months-prison-hacking-credit-card-trafficking-and-money).
