import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import cron from 'node-cron'
import { pool, query } from './db.js'
import { searchIndexedPolicy, syncDrive } from './drive.js'

const app = express()
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const secret = process.env.APP_SECRET_KEY || 'development-only-change-this-to-a-32-character-secret'
const deepseekKey = process.env.DEEPSEEK_API_KEY
const deepseekUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-flash'
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

const sign = (user) => jwt.sign({ sub: user.id, role: user.rol, employeeId: user.colaborador_id }, secret, { expiresIn: '8h' })
async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new Error()
    const payload = jwt.verify(token, secret)
    const result = await query('SELECT * FROM usuarios WHERE id=$1 AND activo=true', [payload.sub])
    if (!result.rowCount) throw new Error()
    req.user = result.rows[0]; next()
  } catch { res.status(401).json({ detail: 'Autenticación requerida' }) }
}
const rrhh = (req, res, next) => req.user?.rol === 'RRHH' ? next() : res.status(403).json({ detail: 'Se requiere el rol RRHH' })

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'ticotalento-js-api' }))
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const result = await query('SELECT * FROM usuarios WHERE email=$1 AND activo=true', [email])
  const user = result.rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ detail: 'Credenciales inválidas' })
  res.json({ access_token: sign(user), token_type: 'bearer', role: user.rol, employee_id: user.colaborador_id })
})
app.get('/api/auth/me', auth, (req, res) => res.json({ id: req.user.id, email: req.user.email, role: req.user.rol, employee_id: req.user.colaborador_id }))

const restricted = /compañero|companero|otra persona|gerente general|salario del gerente|vacaciones de juan|gana\s+(?!yo\b)[a-záéíóúñ]+|(?:salario|sueldo|vacaciones|saldo|solicitud|incapacidad)\s+(?:de|del|la)\s+(?!mi\b|mis\b|yo\b)[a-záéíóúñ]+/i
const outOfScope = /película|pelicula|receta|deporte|clima/i
const dataQuestion = /me quedan|mi saldo|mi solicitud|próximo pago|proximo pago|mi evaluación|mi evaluacion/i
const mixedQuestion = /acumular|pasar.*otro año|pasar.*otro ano/i
const clean = (text) => text.replace(/^#.*$/gm, '').replace(/\*\*/g, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
async function answerWithDeepSeek(question, context) {
  if (!deepseekKey) return null
  try {
    const response = await fetch(`${deepseekUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${deepseekKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: deepseekModel,
        max_tokens: 450,
        reasoning_effort: 'none',
        messages: [
          { role: 'system', content: 'Responde en español usando solo el contexto entregado. Si no basta, dilo. No inventes reglas ni cifras.' },
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
    const row = (await query('SELECT * FROM saldos_vacaciones WHERE colaborador_id=$1 ORDER BY id DESC LIMIT 1', [employeeId])).rows[0]
    return row ? `Tu saldo para ${row.periodo} es de ${row.dias_disponibles} días disponibles, de ${row.dias_asignados} asignados.` : 'No encontré saldo de vacaciones.'
  }
  if (/solicitud|permiso/i.test(question)) {
    const row = (await query('SELECT * FROM solicitudes WHERE colaborador_id=$1 ORDER BY creada_en DESC LIMIT 1', [employeeId])).rows[0]
    return row ? `Tu solicitud más reciente es ${row.tipo}, del ${row.fecha_inicio.toISOString().slice(0,10)} al ${row.fecha_fin.toISOString().slice(0,10)}, y está ${row.estado}.` : 'No encontré solicitudes.'
  }
  if (/pago|quincena/i.test(question)) return 'Tu próximo pago corresponde al siguiente día 15 o último día hábil, según el calendario de planilla.'
  return 'Puedo consultar tu saldo de vacaciones, solicitudes y próxima fecha de pago.'
}
app.post('/api/chat', auth, async (req, res) => {
  const start = Date.now(); const question = req.body.question || ''; let response
  if (restricted.test(question)) response = { answer: 'No puedo compartir datos personales, saldos, salarios ni solicitudes de otra persona.', intent: 'RESTRINGIDA', agent: 'orquestador', citations: [], restricted: true }
  else if (outOfScope.test(question)) response = { answer: 'Este portal solo atiende consultas sobre Recursos Humanos.', intent: 'FUERA_DE_ALCANCE', agent: 'orquestador', citations: [] }
  else if (dataQuestion.test(question) && mixedQuestion.test(question)) { const policy = await policyAnswer(question); response = { answer: `${await personalAnswer(question, req.user.colaborador_id)}\n\n${policy.answer}`, intent: 'MIXTA', agent: 'orquestador', citations: policy.citations, escalated: policy.escalated } }
  else if (dataQuestion.test(question)) response = { answer: await personalAnswer(question, req.user.colaborador_id), intent: 'DATO_PERSONAL', agent: 'agente_datos', citations: [] }
  else { const policy = await policyAnswer(question); response = { ...policy, intent: 'POLITICA', agent: 'agente_politicas' } }
  await query('INSERT INTO consultas_chat(colaborador_id,pregunta,intencion,agente,documentos_citados,resuelta,escalada,latencia_ms) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [req.user.colaborador_id, question, response.intent, response.agent, JSON.stringify(response.citations), !response.escalated && !response.restricted, Boolean(response.escalated), Date.now() - start])
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
app.post('/api/reports/generate', auth, rrhh, async (_, res) => res.json(await createReport()))
app.post('/api/reports/backfill', auth, rrhh, async (_, res) => { const reports = []; for (let day = 29; day >= 0; day -= 1) reports.push(await createReport(new Date(Date.now() - day * 86400000))); res.json(reports) })
app.get('/api/reports/latest', auth, rrhh, async (_, res) => { const row = (await query('SELECT * FROM reportes_diarios ORDER BY fecha DESC LIMIT 1')).rows[0]; res.json(row ? { date: row.fecha.toISOString().slice(0,10), data: row.datos_json, executive_summary: row.resumen_texto, generated_by: row.generado_por } : null) })
app.get('/api/reports/history', auth, rrhh, async (_, res) => { const rows = (await query('SELECT * FROM reportes_diarios ORDER BY fecha DESC LIMIT 30')).rows; res.json(rows.map((row) => ({ date: row.fecha.toISOString().slice(0,10), data: row.datos_json, executive_summary: row.resumen_texto, generated_by: row.generado_por }))) })
app.post('/api/ingestion/sync', auth, rrhh, async (_, res) => {
  try { res.json(await syncDrive()) }
  catch (error) { res.status(503).json({ detail: error.message }) }
})
cron.schedule('0 7 * * *', () => createReport().catch(console.error), { timezone: 'America/Costa_Rica' })
const port = Number(process.env.PORT || 3001)
app.listen(port, () => console.log(`API JavaScript: http://localhost:${port}`))
