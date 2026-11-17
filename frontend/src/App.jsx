import { useEffect, useState } from 'react'
import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function api(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.detail || 'Ocurrió un error')
  return data
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('carlos.diaz.2@ticotalento.test')
  const [password, setPassword] = useState('Demo2026!')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try { onLogin(await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })) }
    catch (err) { setError(err.message) }
  }
  return <main className="login-shell"><section className="login-card">
    <p className="eyebrow">TICOTALENTO S.A.</p><h1>Portal interno de RRHH</h1>
    <p>Consulta políticas aprobadas y gestiones personales autorizadas.</p>
    <form onSubmit={submit}><label>Correo<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="error">{error}</p>}<button type="submit">Iniciar sesión</button></form>
    <small>Demo: usa Carlos para colaborador o Ana para RRHH. Contraseña: Demo2026!</small>
  </section></main>
}

function Chat({ token }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hola. Puedo ayudarte con políticas de RRHH, vacaciones, solicitudes y fechas de pago.' }])
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); if (!question.trim() || loading) return
    const asked = question.trim(); setQuestion(''); setMessages((items) => [...items, { role: 'user', text: asked }]); setLoading(true)
    try {
      const data = await api('/chat', { method: 'POST', body: JSON.stringify({ question: asked }) }, token)
      setMessages((items) => [...items, { role: 'assistant', text: data.answer, citations: data.citations, escalated: data.escalated }])
    } catch (err) { setMessages((items) => [...items, { role: 'assistant', text: `Error: ${err.message}` }]) }
    finally { setLoading(false) }
  }
  return <section className="panel chat-panel"><div className="panel-title"><div><p className="eyebrow">ASISTENTE</p><h2>Consulta de políticas</h2></div></div>
    <div className="messages">{messages.map((message, index) => <article key={index} className={`message ${message.role}`}><p>{message.text}</p>
      {message.citations?.map((citation) => <a key={citation.url} href={citation.url}>Fuente: {citation.document} · {citation.section}</a>)}
      {message.escalated && <small>Se registró una solicitud de escalamiento a RRHH.</small>}</article>)}{loading && <article className="message assistant">Buscando en las políticas…</article>}</div>
    <form className="chat-form" onSubmit={submit}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ej.: ¿Cuántos días de vacaciones me quedan?" /><button>Enviar</button></form>
  </section>
}

function Dashboard({ token }) {
  const [report, setReport] = useState(null); const [history, setHistory] = useState([]); const [error, setError] = useState('')
  const load = async (generate = false) => { try { setError(''); const path = generate ? '/reports/generate' : '/reports/latest'; const options = generate ? { method: 'POST' } : {}; const latest = await api(path, options, token); setReport(latest); setHistory(await api('/reports/history', {}, token)) } catch (err) { setError(err.message) } }
  useEffect(() => { load() }, [])
  if (error) return <section className="panel"><h2>Dashboard RRHH</h2><p className="error">{error}</p></section>
  const backfill = async () => { try { const records = await api('/reports/backfill?days=30', { method: 'POST' }, token); setHistory(records); setReport(records.at(-1)); } catch (err) { setError(err.message) } }
  if (!report) return <section className="panel"><h2>Dashboard RRHH</h2><button onClick={() => load(true)}>Generar reporte diario</button></section>
  const { data } = report; const absenceTotal = data.ausencias_hoy.reduce((sum, item) => sum + item.cantidad, 0)
  return <section className="panel dashboard"><div className="panel-title"><div><p className="eyebrow">SOLO RRHH</p><h2>Reporte diario · {report.date}</h2></div><button onClick={() => load(true)}>Actualizar reporte</button></div>
    <div className="kpis"><div><span>Ausencias hoy</span><strong>{absenceTotal}</strong></div><div><span>Solicitudes pendientes</span><strong>{data.solicitudes_pendientes.total}</strong></div><div><span>Incapacidades activas</span><strong>{data.incapacidades.activas}</strong></div><div><span>Riesgo vacaciones</span><strong>{data.riesgo_vacaciones.mas_de_20_dias}</strong></div></div>
    <p className="summary">{report.executive_summary}</p>
    <div className="chart-wrap"><h3>Ausencias por tipo y departamento</h3><ResponsiveContainer width="100%" height={230}><BarChart data={data.ausencias_hoy}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="departamento" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="cantidad" fill="#1d6f80" /></BarChart></ResponsiveContainer></div>
    <div className="chart-wrap"><h3>Tendencia de solicitudes pendientes (30 días)</h3>{history.length < 2 ? <button onClick={backfill}>Generar historial de 30 días</button> : <ResponsiveContainer width="100%" height={230}><LineChart data={history.map((item) => ({ fecha: item.date.slice(5), pendientes: item.data.solicitudes_pendientes.total }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="fecha" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="pendientes" stroke="#c7772b" strokeWidth={2} /></LineChart></ResponsiveContainer>}</div>
    <h3>Solicitudes pendientes</h3><p>{data.solicitudes_pendientes.mas_de_3_dias} llevan más de tres días sin respuesta.</p><div className="table-scroll"><table><thead><tr><th>Colaborador</th><th>Tipo</th><th>Inicio</th><th>Fin</th></tr></thead><tbody>{data.solicitudes_pendientes.detalle.map((item) => <tr key={item.id}><td>{item.colaborador}</td><td>{item.tipo}</td><td>{item.fecha_inicio}</td><td>{item.fecha_fin}</td></tr>)}</tbody></table></div>
  </section>
}

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('ticotalento_session') || 'null'))
  const login = (data) => { localStorage.setItem('ticotalento_session', JSON.stringify(data)); setSession(data) }
  const logout = () => { localStorage.removeItem('ticotalento_session'); setSession(null) }
  if (!session) return <Login onLogin={login} />
  return <main className="app-shell"><header><div><p className="eyebrow">TICOTALENTO</p><h1>Portal de Recursos Humanos</h1></div><div className="session"><span>{session.role}</span><button onClick={logout}>Salir</button></div></header><div className={`workspace ${session.role === 'RRHH' ? 'with-dashboard' : ''}`}><Chat token={session.access_token} />{session.role === 'RRHH' && <Dashboard token={session.access_token} />}</div></main>
}
