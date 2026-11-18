import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Sidebar from './components/Sidebar'
import Icon from './components/Icon'
import { api } from './services/api'
import { getChatSuggestions } from './services/chatSuggestions'
import { renderRoute } from './routes/routing'

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
    <p className="eyebrow">TICOTALENTO · COSTA RICA</p><h1>Portal de Personas</h1>
    <p>Consulta políticas aprobadas, trámites y datos personales autorizados.</p>
    <form onSubmit={submit}><label>Correo<input value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="error">{error}</p>}<button type="submit">Iniciar sesión</button></form>
    <small>Demo: Carlos (colaborador) o Ana (RRHH). Contraseña: Demo2026!</small>
  </section></main>
}

const suggestedQuestions = ['¿Cuántos días de vacaciones me quedan?', '¿Cómo reporto una incapacidad CCSS?', '¿Cuándo se calcula el aguinaldo?', '¿Cuál es la política de teletrabajo?']
function Chat({ token, chatContext, onContextUsed }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hola. Soy el asistente virtual de TicoTalento. Puedo ayudarte con políticas, vacaciones, incapacidades, permisos y fechas de pago.' }])
  const [loading, setLoading] = useState(false)
  const [activeTopic, setActiveTopic] = useState('')
  useEffect(() => {
    if (!chatContext) return
    setActiveTopic(chatContext)
    onContextUsed?.()
  }, [chatContext, onContextUsed])
  const ask = async (value) => {
    if (!value.trim() || loading) return
    const asked = value.trim(); setQuestion(''); setMessages((items) => [...items, { role: 'user', text: asked }]); setLoading(true)
    try { const data = await api('/chat', { method: 'POST', body: JSON.stringify({ question: asked }) }, token); setMessages((items) => [...items, { role: 'assistant', text: data.answer, citations: data.citations, escalated: data.escalated }]) }
    catch (err) { setMessages((items) => [...items, { role: 'assistant', text: `No pude completar la consulta: ${err.message}` }]) }
    finally { setLoading(false) }
  }
  const topicSuggestions = activeTopic ? getChatSuggestions(activeTopic) : null
  return <section className="assistant-screen">
    <div className="knowledge-banner"><b>Base de Conocimiento Verificada · Costa Rica</b><span>Motor RAG activo · fuentes internas indexadas</span></div>
    <div className="assistant-grid"><section className="chat-window"><header className="chat-heading"><div className="assistant-avatar">IA</div><div><h2>Asistente Virtual TicoTalento <em>IA LEGAL CR</em></h2><p>En línea · Conectado a Políticas 2026</p></div><button className="outline-button" onClick={() => setMessages([{ role: 'assistant', text: 'Nueva conversación iniciada. ¿Qué deseas consultar?' }])}>Nueva conversación</button></header>
      <div className="topic-tabs"><button className="selected">Todas</button><button onClick={() => ask('Política de vacaciones')}>Vacaciones</button><button onClick={() => ask('Información de CCSS')}>INS / CCSS</button><button onClick={() => ask('Cómo se calcula el aguinaldo')}>Aguinaldo</button></div>
      <div className="messages"><span className="chat-time">Sesión protegida · respuestas con fuentes verificables</span>{topicSuggestions && messages.length === 1 && <section className="topic-suggestions"><div><span>Consultas sugeridas</span><h3>{topicSuggestions.label}</h3><p>Selecciona una pregunta para consultar de forma más rápida.</p></div><div className="topic-question-list">{topicSuggestions.questions.map((item) => <button key={item} onClick={() => ask(item)}>{item}<b>Consultar</b></button>)}</div></section>}{messages.map((message, index) => <article key={index} className={`message ${message.role}`}><p>{message.text}</p>{message.citations?.map((citation) => <a key={`${citation.document}-${citation.section}`} href={citation.url} target="_blank" rel="noreferrer">▤ Fuente: {citation.document} · {citation.section}</a>)}{message.escalated && <small>Tu consulta fue marcada para seguimiento de RRHH.</small>}</article>)}{loading && <article className="message assistant">Buscando en la base de conocimiento…</article>}</div>
      <form className="chat-form" onSubmit={(event) => { event.preventDefault(); ask(question) }}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Escribe tu consulta sobre vacaciones, incapacidades o aguinaldo" /><button aria-label="Enviar consulta">Enviar</button></form><p className="chat-tip">Consejo: no incluyas datos médicos sensibles ni información de otras personas.</p>
    </section><aside className="chat-aside"><section><div className="aside-title"><h3>Preguntas frecuentes</h3><span>NORMATIVA CR</span></div>{suggestedQuestions.map((item) => <button className="suggestion" key={item} onClick={() => ask(item)}>{item}<small>Consultar respuesta verificada ›</small></button>)}</section><section><div className="aside-title"><h3>Documentos de referencia</h3><button>Ver todos</button></div>{['Reglamento interno de trabajo', 'Manual de beneficios y seguros', 'Formulario oficial de permisos'].map((document, index) => <div className="reference" key={document}><b>{index === 0 ? '▤' : index === 1 ? '◇' : '▣'}</b><span>{document}<small>Documento indexado</small></span><i>↓</i></div>)}</section><section className="confidential"><h3>¿Consulta confidencial?</h3><p>Para situaciones sensibles, pide atención directa del equipo de Gestión Humana.</p><button>▦ Solicitar cita privada con RRHH</button></section></aside></div>
  </section>
}

const pieColors = ['#0b3540', '#0f6b7b', '#cb9027', '#8de0ef', '#8a9798']
function Dashboard({ token }) {
  const [report, setReport] = useState(null); const [history, setHistory] = useState([]); const [error, setError] = useState(''); const [notice, setNotice] = useState('')
  const load = async (generate = false) => { try { setError(''); let latest = await api(generate ? '/reports/generate' : '/reports/latest', generate ? { method: 'POST' } : {}, token); if (!latest) latest = await api('/reports/generate', { method: 'POST' }, token); setReport(latest); setHistory(await api('/reports/history', {}, token)) } catch (err) { setError(err.message) } }
  useEffect(() => { load() }, [])
  const backfill = async () => { try { const records = await api('/reports/backfill?days=30', { method: 'POST' }, token); setHistory(records); setReport(records.at(-1)) } catch (err) { setError(err.message) } }
  const exportReport = () => { if (!report) return; const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `reporte-rrhh-${report.date}.json`; link.click(); URL.revokeObjectURL(link.href); setNotice('Reporte descargado correctamente.') }
  if (error) return <section className="panel"><h2>Panel RRHH</h2><p className="error">{error}</p><button onClick={() => load(true)}>Reintentar</button></section>
  if (!report) return <section className="panel"><h2>Preparando el panel de RRHH…</h2></section>
  const { data } = report; const absenceTotal = (data.ausencias_hoy || []).reduce((sum, item) => sum + item.cantidad, 0); const pending = data.solicitudes_pendientes?.total || 0
  const topics = data.temas_top?.length ? data.temas_top : [{ tema: 'Vacaciones y períodos disponibles', cantidad: 28 }, { tema: 'Incapacidades y CCSS', cantidad: 21 }, { tema: 'Permisos y licencias', cantidad: 16 }, { tema: 'Aguinaldo y planilla', cantidad: 12 }]
  const vacationByDepartment = [{ name: 'Tecnología', value: 24 }, { name: 'Operaciones', value: 17 }, { name: 'Ventas', value: 12 }, { name: 'Finanzas', value: 6 }, { name: 'Soporte', value: 5 }]
  return <section className="rrhh-screen"><div className="rrhh-heading"><div><p className="eyebrow">♧ GESTIÓN ESTRATÉGICA DE PERSONAS</p><h2>Panel General de RRHH & Talento</h2><p>Supervisión en tiempo real de solicitudes, ausencias y tendencias del portal.</p></div><div><button className="outline-button" onClick={exportReport}>⇩ Exportar reporte</button><button onClick={() => setNotice('Comunicación preparada para revisión antes de enviar.')}>⚑ Nueva comunicación masiva</button></div></div>{notice && <p className="success-notice">{notice}</p>}
    <div className="filter-bar"><span>▦ Período<br /><b>Último trimestre</b></span><span>⌖ Sede corporativa<br /><b>Todas las sedes</b></span><span>♙ Departamento<br /><b>Todos los departamentos</b></span><button className="filter-button" onClick={() => load(true)}>↻ Actualizar</button></div>
    <div className="rrhh-kpis"><article><span>Colaboradores activos</span><strong>50</strong><small>Planilla demo indexada</small></article><article><span>Solicitudes pendientes</span><strong>{pending}</strong><small>{data.solicitudes_pendientes?.mas_de_3_dias || 0} requieren atención</small></article><article><span>Consultas Asistente IA</span><strong>{data.uso_chatbot?.consultas_dia_anterior || 1450}</strong><small>Base de conocimiento activa</small></article><article><span>Ausencias hoy</span><strong>{absenceTotal}</strong><small>Incapacidades activas: {data.incapacidades?.activas || 0}</small></article></div>
    <section className="legal-calendar"><div><b>◴ CALENDARIO LEGAL DE OBLIGACIONES LABORALES</b><h3>Próximos Hitos de Planilla</h3><p>Control de cierres y fechas relevantes para Recursos Humanos.</p></div><div><span>Cierre planilla<b>12 Nov</b></span><span>Límite aguinaldo<b>05 Dic</b></span><button onClick={() => setNotice('Calendario laboral consultado.')}>Ver calendario</button></div></section>
    <div className="analytics-grid"><section className="analytics-card"><p className="eyebrow">⌁ TENDENCIA DE CONSULTAS</p><h3>Top temas del Asistente IA</h3>{topics.map((item, index) => <div className="topic-row" key={item.tema}><span>{item.tema}</span><b>{item.cantidad}%</b><i><em style={{ width: `${Math.max(12, item.cantidad)}%` }} /></i></div>)}<button className="text-button" onClick={() => setNotice('Recomendación guardada para la próxima comunicación.')}>♧ Crear FAQ recomendada</button></section><section className="analytics-card pie-card"><p className="eyebrow">PLANIFICACIÓN OPERATIVA</p><h3>Vacaciones por departamento</h3><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={vacationByDepartment} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2}>{vacationByDepartment.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="legend">{vacationByDepartment.map((item, i) => <span key={item.name}><i style={{ background: pieColors[i] }} />{item.name}: {item.value}</span>)}</div></section></div>
    <div className="analytics-card full-chart"><div><p className="eyebrow">ANALÍTICA OPERATIVA</p><h3>Ausencias por tipo y departamento</h3></div><ResponsiveContainer width="100%" height={220}><BarChart data={data.ausencias_hoy || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="departamento" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="cantidad" fill="#0f6b7b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
    <section className="requests-card"><div className="requests-title"><div><p className="eyebrow">▤ BANDEJA DE ENTRADA OPERATIVA</p><h3>Solicitudes recientes de colaboradores</h3></div><button onClick={() => setNotice('Mostrando solicitudes pendientes del reporte actual.')}>Ver todas ({pending})</button></div><div className="table-scroll"><table><thead><tr><th>COLABORADOR</th><th>TIPO DE TRÁMITE</th><th>FECHA</th><th>PERÍODO</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead><tbody>{(data.solicitudes_pendientes?.detalle || []).slice(0, 5).map((item) => <tr key={item.id}><td><b>{item.colaborador}</b></td><td>{item.tipo}</td><td>{item.fecha_inicio}</td><td>{item.fecha_inicio} — {item.fecha_fin}</td><td><span className="status-pill">Pendiente</span></td><td><button className="table-action" onClick={() => setNotice(`Detalle de solicitud ${item.id} revisado.`)}>Ver detalle</button></td></tr>)}</tbody></table></div></section>
    <section className="analytics-card trend-chart"><div className="section-heading"><h3>Tendencia de solicitudes pendientes</h3>{history.length < 2 && <button onClick={backfill}>Generar historial</button>}</div>{history.length > 1 && <ResponsiveContainer width="100%" height={210}><LineChart data={history.map((item) => ({ fecha: item.date.slice(5), pendientes: item.data.solicitudes_pendientes.total }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="fecha" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="pendientes" stroke="#cb9027" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>}</section>
  </section>
}

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('ticotalento_session') || 'null'))
  const [page, setPage] = useState(() => localStorage.getItem('ticotalento_last_page') || 'inicio'); const [search, setSearch] = useState(''); const [chatContext, setChatContext] = useState('')
  const login = (data) => { localStorage.setItem('ticotalento_session', JSON.stringify(data)); setSession(data) }
  const logout = () => { localStorage.removeItem('ticotalento_session'); localStorage.removeItem('ticotalento_last_page'); setSession(null) }
  useEffect(() => {
    if (session?.role !== 'RRHH' && page === 'dashboard') { setPage('inicio'); localStorage.setItem('ticotalento_last_page', 'inicio') }
  }, [page, session])
  if (!session) return <Login onLogin={login} />
  const navigate = (nextPage, context = '') => { if (nextPage === 'dashboard' && session.role !== 'RRHH') return; if (nextPage === 'chat') setChatContext(context); setPage(nextPage); localStorage.setItem('ticotalento_last_page', nextPage) }
  const pageContent = renderRoute(page, { setPage: navigate, role: session.role, token: session.access_token, Chat, Dashboard, chatContext, clearChatContext: () => setChatContext('') })
  const titles = { politicas: 'Políticas y beneficios', datos: 'Mis datos y trámites', ayuda: 'Centro de ayuda' }
  return <main className="portal-layout"><Sidebar page={page} setPage={navigate} role={session.role} /><section className="portal-main"><header className="topbar"><form className="top-search" onSubmit={(event) => { event.preventDefault(); navigate('chat', search || 'Necesito ayuda con una política de Recursos Humanos') }}><Icon name="search" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar políticas, código de trabajo, trámites (Cmd+K)…" /></form><span className="location-pill"><Icon name="pin" size={15} />Sede Escazú</span><div className="session"><button className="bell" onClick={() => navigate('ayuda')} aria-label="Notificaciones"><Icon name="bell" size={20} /><i /></button><div className="profile-block"><span className="user-avatar">MS</span><span className="user-name"><b>Mi perfil</b><small>{session.role === 'RRHH' ? 'Especialista de RRHH' : 'Colaborador'}</small></span></div><button className="logout" onClick={logout} aria-label="Cerrar sesión"><Icon name="logout" size={20} /></button></div></header>{titles[page] && <div className="page-title"><p className="eyebrow">PORTAL DE RECURSOS HUMANOS</p><h1>{titles[page]}</h1></div>}{pageContent}</section></main>
}
