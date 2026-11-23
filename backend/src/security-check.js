import assert from 'node:assert/strict'

const baseUrl = process.env.SECURITY_TEST_URL || 'http://127.0.0.1:3001/api'
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const email = process.env.DEMO_EMAIL || 'carlos.diaz.2@ticotalento.test'
const password = process.env.DEMO_PASSWORD || 'Demo2026!'

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, { ...options, headers: { Origin: origin, ...(options.headers || {}) } })
}

function report(name, response) {
  console.log(`${response.status} ${name}`)
}

async function run() {
  const rejectedOrigin = await fetch(`${baseUrl}/health`, { headers: { Origin: 'https://attacker.invalid' } })
  report('CORS origin not allowed', rejectedOrigin)
  assert.equal(rejectedOrigin.status, 403)

  const injectionLogin = await request('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "' OR '1'='1' --", password: 'not-a-password' }),
  })
  report('SQL injection-shaped login input', injectionLogin)
  assert.equal(injectionLogin.status, 400)

  const login = await request('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  assert.equal(login.status, 200, 'No se pudo iniciar una sesión de prueba.')
  const session = await login.json()
  const cookie = login.headers.get('set-cookie')?.split(';')[0]
  assert.ok(cookie && session.csrf_token && session.access_token, 'La sesión debe devolver JWT, cookie y token CSRF.')

  const authHeaders = { Authorization: `Bearer ${session.access_token}`, Cookie: cookie, 'Content-Type': 'application/json' }
  const csrfBlocked = await request('/chat', { method: 'POST', headers: authHeaders, body: JSON.stringify({ question: 'Consulta de prueba' }) })
  report('CSRF request without token', csrfBlocked)
  assert.equal(csrfBlocked.status, 403)

  const xssBlocked = await request('/chat', {
    method: 'POST', headers: { ...authHeaders, 'X-CSRF-Token': session.csrf_token },
    body: JSON.stringify({ question: '<script>alert(1)</script>' }),
  })
  report('XSS-shaped chat input', xssBlocked)
  assert.equal(xssBlocked.status, 400)

  const normalRequest = await request('/chat', {
    method: 'POST', headers: { ...authHeaders, 'X-CSRF-Token': session.csrf_token },
    body: JSON.stringify({ question: '¿Cómo consulto mi saldo de vacaciones?' }),
  })
  report('Legitimate protected request', normalRequest)
  assert.equal(normalRequest.status, 200)

  console.log('Pruebas de seguridad aprobadas: SQLi, XSS, CSRF y CORS.')
}

run().catch((error) => { console.error(`Fallo de seguridad: ${error.message}`); process.exitCode = 1 })
