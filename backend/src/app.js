import 'dotenv/config'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import cron from 'node-cron'
import rateLimit from 'express-rate-limit'
import { Op } from 'sequelize'
import { pool, query } from './db.js'
import { ConsultaChat, SaldoVacaciones, Solicitud, Usuario } from './models/index.js'
import { backfillEmbeddings, searchIndexedPolicy, syncDrive, uploadDeliverables } from './drive.js'
import { routeQuestion } from './agents/orchestrator-agent.js'

const app = express()
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const secret = process.env.APP_SECRET_KEY || 'development-only-change-this-to-a-32-character-secret'
const appEnv = process.env.APP_ENV || 'development'
const deepseekKey = process.env.DEEPSEEK_API_KEY
const deepseekUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-flash'
const policyPromptPath = path.join(root, 'backend', 'src', 'prompts', 'politicas.md')
const allowedOrigins = new Set((process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean))

if (appEnv === 'production' && secret === 'development-only-change-this-to-a-32-character-secret') {
  throw new Error('APP_SECRET_KEY must be configured in production.')
}

const sameToken = (first, second) => {
  if (!first || !second) return false
  const firstBuffer = Buffer.from(first)
  const secondBuffer = Buffer.from(second)
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer)
}
const getCookie = (req, name) => req.headers.cookie?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1)
const validOrigin = (origin) => !origin || allowedOrigins.has(origin)
const textInput = (value, field, { min = 1, max = 1000 } = {}) => {
  if (typeof value !== 'string') throw new Error(`${field} is invalid.`)
  const normalized = value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  if (normalized.length < min || normalized.length > max) throw new Error(`${field} has an invalid length.`)
  if (/<\s*\/?\s*(script|style|iframe|object|embed|svg|img)\b/i.test(normalized) || /javascript\s*:/i.test(normalized)) throw new Error(`${field} contains unsafe content.`)
  return normalized
}
const validateLogin = (body = {}) => {
  const email = textInput(body.email, 'Email', { min: 5, max: 180 }).toLowerCase()
  const password = textInput(body.password, 'Password', { min: 8, max: 128 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email is invalid.')
  return { email, password }
}
const validateQuestion = (body = {}) => ({ question: textInput(body.question, 'Question', { min: 3, max: 1000 }) })

app.disable('x-powered-by')
app.use((req, res, next) => validOrigin(req.get('origin')) ? next() : res.status(403).json({ detail: 'Origen no autorizado.' }))
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], baseUri: ["'self'"], frameAncestors: ["'none'"], objectSrc: ["'none'"],
      scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'", ...allowedOrigins],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' },
}))
app.use(cors({ origin: (origin, callback) => callback(null, validOrigin(origin)), methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'], credentials: true, maxAge: 600 }))
app.use(express.json({ limit: '16kb', strict: true }))

const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false, message: { detail: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' } })
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { detail: 'Demasiados intentos de inicio de sesion. Intenta mas tarde.' } })
app.use('/api', apiLimiter)

const issueSession = (user) => {
  const csrfToken = randomBytes(32).toString('base64url')
  const accessToken = jwt.sign(
    { sub: user.id, role: user.rol, employeeId: user.colaborador_id, csrf: csrfToken },
    secret,
    { expiresIn: '8h', algorithm: 'HS256', issuer: 'ticotalento-api', audience: 'ticotalento-portal' },
  )
  return { accessToken, csrfToken }
}
async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new Error()
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'ticotalento-api', audience: 'ticotalento-portal' })
    const user = await Usuario.findOne({ where: { id: payload.sub, activo: true } })
    if (!user) throw new Error()
    req.user = user.get({ plain: true }); req.auth = payload; next()
  } catch { res.status(401).json({ detail: 'Autenticación requerida' }) }
}
const rrhh = (req, res, next) => req.user?.rol === 'RRHH' ? next() : res.status(403).json({ detail: 'Se requiere el rol RRHH' })
const csrf = (req, res, next) => {
  const token = req.get('x-csrf-token')
  const cookieToken = getCookie(req, 'tt_csrf')
  if (!sameToken(token, req.auth?.csrf) || !sameToken(token, cookieToken)) return res.status(403).json({ detail: 'Token CSRF invalido o ausente.' })
  next()
}

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'ticotalento-js-api' }))
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  let credentials
  try { credentials = validateLogin(req.body) }
  catch (error) { return res.status(400).json({ detail: error.message }) }
  const { email, password } = credentials
  const record = await Usuario.findOne({ where: { email, activo: true } })
  const user = record?.get({ plain: true })
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ detail: 'Credenciales inválidas' })
  const { accessToken, csrfToken } = issueSession(user)
  const secure = appEnv === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `tt_csrf=${csrfToken}; Path=/; Max-Age=28800; SameSite=Strict; HttpOnly${secure}`)
  res.json({ access_token: accessToken, csrf_token: csrfToken, token_type: 'bearer', role: user.rol, employee_id: user.colaborador_id })
})
app.get('/api/auth/me', auth, (req, res) => res.json({ id: req.user.id, email: req.user.email, role: req.user.rol, employee_id: req.user.colaborador_id }))
app.get('/api/me/summary', auth, async (req, res) => {
  const balance = await SaldoVacaciones.findOne({ where: { colaborador_id: req.user.colaborador_id }, order: [['id', 'DESC']], raw: true })
  const requests = await Solicitud.findAll({ where: { colaborador_id: req.user.colaborador_id }, order: [['creada_en', 'DESC']], raw: true })
  const byStatus = Object.entries(requests.reduce((acc, item) => ({ ...acc, [item.estado]: (acc[item.estado] || 0) + 1 }), {})).map(([estado, cantidad]) => ({ estado, cantidad }))
  res.json({ vacaciones: { asignados: balance?.dias_asignados || 0, tomados: balance?.dias_tomados || 0, disponibles: balance?.dias_disponibles || 0 }, solicitudes: byStatus, total_solicitudes: requests.length })
})

const clean = (text) => text.replace(/^#.*$/gm, '').replace(/\*\*/g, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
async function answerWithDeepSeek(question, context) {
  if (!deepseekKey) return null
  try {
    const systemPrompt = await readFile(policyPromptPath, 'utf8')
    const response = await fetch(`${deepseekUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${deepseekKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: deepseekModel,
        max_tokens: 450,
        reasoning_effort: 'none',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Contexto de política:\n${context}\n\nPregunta: ${question}` },
        ],
      }),
    })
    if (!response.ok) return null
    return (await response.json()).choices?.[0]?.message?.content?.trim() || null
  } catch { return null }
}
async function policyAnswer(question) {
  const indexed = await searchIndexedPolicy(question)
  if (indexed) {
    const context = indexed.contenido.slice(0, 4000)
    const generated = await answerWithDeepSeek(question, context)
    return { answer: generated || `Según la política indexada: ${context.slice(0, 900)}`, citations: [{ document: indexed.nombre, section: indexed.seccion, url: indexed.drive_url }], escalated: false }
  }
  const files = ['01-politica-vacaciones.md','02-calendario-feriados.md','03-permisos-licencias.md','04-procedimiento-incapacidades.md','05-jornada-asistencia-teletrabajo.md','06-remuneracion-pagos-aguinaldo.md','07-catalogo-beneficios.md','08-onboarding-salida.md','09-desempeno-carrera.md','10-conducta-denuncias.md','11-privacidad-datos.md','12-uso-portal-ia.md']
  const terms = question.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || []
  let best = null
  for (const file of files) {
    const content = await readFile(path.join(root, 'docs', 'policies', file), 'utf8')
    const score = terms.filter((term) => content.toLowerCase().includes(term)).length
    if (!best || score > best.score) best = { file, content, score }
  }
  if (!best || best.score === 0) return { answer: 'No encontré una política aprobada que responda esa consulta. Puedo escalarla a Recursos Humanos.', citations: [], escalated: true }
  const name = best.file.replace(/^\d+-/, '').replace('.md', '').replaceAll('-', ' ')
  const context = clean(best.content).slice(0, 4000)
  const generated = await answerWithDeepSeek(question, context)
  return { answer: generated || `Según la política interna: ${context.slice(0, 900)}`, citations: [{ document: name, section: 'Política interna', url: `/docs/policies/${best.file}` }], escalated: false }
}
async function personalAnswer(question, employeeId) {
  if (/vacacion|días me quedan|dias me quedan/i.test(question)) {
    const row = await SaldoVacaciones.findOne({ where: { colaborador_id: employeeId }, order: [['id', 'DESC']], raw: true })
    return row ? `Tu saldo para ${row.periodo} es de ${row.dias_disponibles} días disponibles, de ${row.dias_asignados} asignados.` : 'No encontré saldo de vacaciones.'
  }
  if (/solicitud|permiso/i.test(question)) {
    const row = await Solicitud.findOne({ where: { colaborador_id: employeeId }, order: [['creada_en', 'DESC']], raw: true })
    return row ? `Tu solicitud más reciente es ${row.tipo}, del ${row.fecha_inicio.toISOString().slice(0,10)} al ${row.fecha_fin.toISOString().slice(0,10)}, y está ${row.estado}.` : 'No encontré solicitudes.'
  }
  if (/pago|quincena/i.test(question)) return 'Tu próximo pago corresponde al siguiente día 15 o último día hábil, según el calendario de planilla.'
  return 'Puedo consultar tu saldo de vacaciones, solicitudes y próxima fecha de pago.'
}
app.post('/api/chat', auth, csrf, async (req, res) => {
  let question
  try { ({ question } = validateQuestion(req.body)) }
  catch (error) { return res.status(400).json({ detail: error.message }) }
  const start = Date.now(); let response
  const intent = routeQuestion(question)
  if (intent === 'RESTRINGIDA') response = { answer: 'No puedo compartir datos personales, saldos, salarios ni solicitudes de otra persona.', intent, agent: 'orquestador', citations: [], restricted: true }
  else if (intent === 'FUERA_DE_ALCANCE') response = { answer: 'Este portal solo atiende consultas sobre Recursos Humanos.', intent, agent: 'orquestador', citations: [] }
  else if (intent === 'MIXTA') { const policy = await policyAnswer(question); response = { answer: `${await personalAnswer(question, req.user.colaborador_id)}\n\n${policy.answer}`, intent, agent: 'orquestador', citations: policy.citations, escalated: policy.escalated } }
  else if (intent === 'DATO_PERSONAL') response = { answer: await personalAnswer(question, req.user.colaborador_id), intent, agent: 'agente_datos', citations: [] }
  else { const policy = await policyAnswer(question); response = { ...policy, intent, agent: 'agente_politicas' } }
  await ConsultaChat.create({ colaborador_id: req.user.colaborador_id, pregunta: question, intencion: response.intent, agente: response.agent, documentos_citados: response.citations, resuelta: !response.escalated && !response.restricted, escalada: Boolean(response.escalated), latencia_ms: Date.now() - start })
  res.json(response)
})

async function createReport(reportDate = new Date()) {
  const date = reportDate.toISOString().slice(0, 10)
  const pending = Number((await query("SELECT COUNT(*)::int count FROM solicitudes WHERE estado='PENDIENTE'")).rows[0].count)
  const pendingRows = (await query("SELECT s.id,c.nombre colaborador,s.tipo,s.fecha_inicio,s.fecha_fin FROM solicitudes s JOIN colaboradores c ON c.id=s.colaborador_id WHERE s.estado='PENDIENTE' ORDER BY s.creada_en LIMIT 20")).rows
  const absenceRows = (await query("SELECT s.tipo,c.departamento,COUNT(*)::int cantidad FROM solicitudes s JOIN colaboradores c ON c.id=s.colaborador_id WHERE s.estado='APROBADA' AND s.fecha_inicio <= $1 AND s.fecha_fin >= $1 GROUP BY s.tipo,c.departamento", [date])).rows
  const activeLeaves = Number((await query("SELECT COUNT(*)::int count FROM incapacidades WHERE fecha_inicio <= $1 AND fecha_inicio + dias >= $1", [date])).rows[0].count)
  const risk = Number((await query('SELECT COUNT(*)::int count FROM saldos_vacaciones WHERE dias_disponibles > 20')).rows[0].count)
  const data = { fecha: date, ausencias_hoy: absenceRows, solicitudes_pendientes: { total: pending, mas_de_3_dias: 0, detalle: pendingRows }, incapacidades: { activas: activeLeaves, dias_acumulados_mes: activeLeaves * 5 }, movimientos_mes: { ingresos: 0, salidas: 0, tasa_rotacion: 0 }, riesgo_vacaciones: { mas_de_20_dias: risk }, uso_chatbot: { consultas_dia_anterior: 0, porcentaje_resuelto: 0, latencia_promedio_ms: 0 }, temas_top: [], preguntas_sin_respuesta: [] }
  const absent = absenceRows.reduce((sum, item) => sum + item.cantidad, 0)
  const summary = `Al ${date}, hay ${absent} personas ausentes y ${pending} solicitudes pendientes. Se registran ${activeLeaves} incapacidades activas. Hay ${risk} colaboradores con más de 20 días acumulados.`
  await query('INSERT INTO reportes_diarios(fecha,datos_json,resumen_texto,generado_por) VALUES($1,$2,$3,$4) ON CONFLICT(fecha) DO UPDATE SET datos_json=EXCLUDED.datos_json,resumen_texto=EXCLUDED.resumen_texto', [date, JSON.stringify(data), summary, 'agente_analista'])
  return { date, data, executive_summary: summary, generated_by: 'agente_analista' }
}
app.post('/api/reports/generate', auth, csrf, rrhh, async (_, res) => res.json(await createReport()))
app.post('/api/reports/backfill', auth, csrf, rrhh, async (_, res) => { const reports = []; for (let day = 29; day >= 0; day -= 1) reports.push(await createReport(new Date(Date.now() - day * 86400000))); res.json(reports) })
app.get('/api/reports/latest', auth, rrhh, async (_, res) => { const row = (await query('SELECT * FROM reportes_diarios ORDER BY fecha DESC LIMIT 1')).rows[0]; res.json(row ? { date: row.fecha.toISOString().slice(0,10), data: row.datos_json, executive_summary: row.resumen_texto, generated_by: row.generado_por } : null) })
app.get('/api/reports/history', auth, rrhh, async (_, res) => { const rows = (await query('SELECT * FROM reportes_diarios ORDER BY fecha DESC LIMIT 30')).rows; res.json(rows.map((row) => ({ date: row.fecha.toISOString().slice(0,10), data: row.datos_json, executive_summary: row.resumen_texto, generated_by: row.generado_por }))) })
app.post('/api/ingestion/sync', auth, csrf, rrhh, async (_, res) => {
  try { res.json(await syncDrive()) }
  catch (error) { res.status(503).json({ detail: error.message }) }
})
app.post('/api/ingestion/reindex', auth, csrf, rrhh, async (_, res) => {
  try { res.json(await backfillEmbeddings()) }
  catch (error) { res.status(500).json({ detail: error.message }) }
})
app.post('/api/ingestion/upload-deliverables', auth, csrf, rrhh, async (_, res) => {
  try { res.json(await uploadDeliverables()) }
  catch (error) { res.status(503).json({ detail: error.message }) }
})
cron.schedule('0 7 * * *', () => createReport().catch(console.error), { timezone: 'America/Costa_Rica' })
app.use((error, req, res, next) => {
  if (error?.type === 'entity.parse.failed') return res.status(400).json({ detail: 'JSON invalido.' })
  if (error?.type === 'entity.too.large') return res.status(413).json({ detail: 'La solicitud excede el tamaño permitido.' })
  console.error('Error no controlado:', error?.message)
  return res.status(500).json({ detail: 'Error interno del servidor.' })
})
const port = Number(process.env.PORT || 3001)
app.listen(port, () => console.log(`API JavaScript: http://localhost:${port}`))
