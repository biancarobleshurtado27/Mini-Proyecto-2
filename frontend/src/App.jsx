import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Sidebar from './components/Sidebar'
import Icon from './components/Icon'
import isotipoLogo from './assets/ticotalento-isotipo.png'
import transparentLogo from './assets/ticotalento-logo-sin-fondo.png'
import { api } from './services/api'
import { getChatSuggestions } from './services/chatSuggestions'
import { renderRoute } from './routes/routing'
import './login.css'

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('carlos.diaz.2@ticotalento.test')
  const [password, setPassword] = useState('Demo2026!')
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      onLogin(data)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  const useDemo = async (role) => {
    const targetEmail = role === 'RRHH' ? 'ana.lopez@ticotalento.test' : 'carlos.diaz.2@ticotalento.test'
    setEmail(targetEmail)
    setPassword('Demo2026!')
    setError('')
    setLoading(true)
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail, password: 'Demo2026!' })
      })
      onLogin(data)
    } catch {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      {/* PANEL IZQUIERDO: MARCA E IDENTIDAD INSTITUCIONAL */}
      <section className="login-brand-panel">
        {/* Esferas de luz fluidas en el fondo */}
        <div className="brand-glow-sphere sphere-1" aria-hidden="true" />
        <div className="brand-glow-sphere sphere-2" aria-hidden="true" />

        <header className="login-brand-header">
          <div className="login-brand-identity">
            <img className="login-brand-isotype" src={isotipoLogo} alt="TicoTalento" />
            <div className="login-brand-titles">
              <span className="login-brand-name">TicoTalento</span>
              <span className="login-brand-tagline">Gestión Humana • Costa Rica</span>
            </div>
          </div>
        </header>

        <div className="login-brand-content">
          <div className="login-kicker-badge">
            <span className="kicker-dot" />
            <span>Plataforma Institucional 2026</span>
          </div>

          <h1 className="login-brand-headline">
            Todo tu mundo laboral, en un solo lugar.
          </h1>

          <p className="login-brand-description">
            La plataforma oficial de Gestión Humana para colaboradores en Costa Rica: consulta de políticas, gestión de vacaciones, comprobantes salariales y asistencia laboral inteligente.
          </p>

          <div className="login-benefits-list">
            <article className="login-benefit-item" style={{ '--item-delay': '0.28s' }}>
              <span className="benefit-marker">
                <Icon name="shield" size={19} />
              </span>
              <div className="benefit-texts">
                <b>Información protegida</b>
                <small>Seguridad de nivel corporativo para datos de planilla, expedientes y confidencialidad garantizada.</small>
              </div>
            </article>

            <article className="login-benefit-item" style={{ '--item-delay': '0.36s' }}>
              <span className="benefit-marker">
                <Icon name="verified" size={19} />
              </span>
              <div className="benefit-texts">
                <b>Asistente con fuentes verificadas</b>
                <small>Resolución ágil amparada fielmente en el Código de Trabajo de Costa Rica y reglamentos internos.</small>
              </div>
            </article>

            <article className="login-benefit-item" style={{ '--item-delay': '0.44s' }}>
              <span className="benefit-marker">
                <Icon name="document" size={19} />
              </span>
              <div className="benefit-texts">
                <b>Gestiones más simples</b>
                <small>Autoservicio ágil para solicitud de vacaciones, constancias de salario y permisos con aprobación instantánea.</small>
              </div>
            </article>
          </div>
        </div>

        {/* Marca de agua institucional de fondo */}
        <svg className="login-monogram" viewBox="0 0 200 200" aria-hidden="true">
          <rect x="25" y="40" width="130" height="30" rx="15" />
          <rect x="75" y="40" width="30" height="120" rx="15" />
          <path d="M105 76c23 0 43 20 43 44s-20 44-43 44V76Z" />
          <circle cx="160" cy="55" r="15" />
        </svg>

        <footer className="login-brand-footer">
          <div className="login-system-label">
            <Icon name="checkCircle" size={15} />
            <span>Sistema Oficial de Gestión del Talento • República de Costa Rica</span>
          </div>
          <div className="login-tls-badge">
            <span className="tls-dot" />
            <span>TLS 1.3 Seguro</span>
          </div>
        </footer>
      </section>

      {/* PANEL DERECHO: TARJETA DE ACCESO */}
      <section className="login-form-panel">
        {/* Esferas de luz suave flotantes en el fondo del panel derecho */}
        <div className="form-glow-sphere sphere-3" aria-hidden="true" />
        <div className="form-glow-sphere sphere-4" aria-hidden="true" />

        <div className="login-card">
          <div className="login-welcome-pill">
            <span className="welcome-dot" />
            <span>BIENVENIDO DE NUEVO</span>
          </div>

          <h2 className="login-title">Inicia sesión</h2>
          <p className="login-subtitle">
            Usa tu cuenta corporativa para ingresar al portal de autoservicio.
          </p>

          {/* Botón Microsoft 365 */}
          <button
            type="button"
            className="btn-microsoft-sso"
            onClick={() => useDemo('COLABORADOR')}
            disabled={loading}
          >
            <MicrosoftLogo />
            <span>Continuar con Microsoft 365</span>
          </button>

          <div className="login-or-divider">
            <span>o ingresa con tus credenciales</span>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="login-field-group">
              <label htmlFor="login-email">Correo corporativo</label>
              <div className="login-input-wrap">
                <span className="input-prefix-icon">
                  <Icon name="at" size={17} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre.apellido@empresa.cr"
                  required
                />
              </div>
            </div>

            <div className="login-field-group">
              <div className="login-password-header">
                <label htmlFor="login-password">Contraseña</label>
                <button
                  type="button"
                  className="btn-forgot-password"
                  onClick={() => setError('Para restablecer tu contraseña, contacta a Gestión Humana o ext. 4022.')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="login-input-wrap">
                <span className="input-prefix-icon">
                  <Icon name="lock" size={17} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            {error && <div className="login-error-message">{error}</div>}

            <div className="login-options-row">
              <label className="login-remember-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recordar sesión en este equipo</span>
              </label>
              <span className="login-timezone">Costa Rica (GMT-6)</span>
            </div>

            <button type="submit" className="btn-submit-portal" disabled={loading}>
              <span>{loading ? 'Ingresando…' : 'Ingresar al portal'}</span>
              <Icon name="arrowRight" size={18} />
            </button>
          </form>

          {/* Bloque de acceso demo rápido */}
          <div className="login-demo-box">
            <div className="demo-box-header">
              <div className="demo-box-title">
                <Icon name="bolt" size={15} />
                <span>ACCESO DEMO RÁPIDO</span>
              </div>
              <span className="demo-box-tag">Entornos de prueba</span>
            </div>

            <div className="demo-cards-container">
              <button
                type="button"
                className="demo-profile-card"
                onClick={() => useDemo('COLABORADOR')}
                disabled={loading}
              >
                <div className="demo-profile-info">
                  <b>Colaborador</b>
                  <small>Mariana Solís • Especialista</small>
                </div>
                <span className="demo-profile-icon">
                  <Icon name="user" size={18} />
                </span>
              </button>

              <button
                type="button"
                className="demo-profile-card"
                onClick={() => useDemo('RRHH')}
                disabled={loading}
              >
                <div className="demo-profile-info">
                  <b>RRHH & Nómina</b>
                  <small>Panel Administrativo</small>
                </div>
                <span className="demo-profile-icon">
                  <Icon name="admin" size={18} />
                </span>
              </button>
            </div>
          </div>

          <div className="login-support-note">
            <p>
              ¿Necesitas ayuda para ingresar?{' '}
              <button
                type="button"
                className="btn-link-help"
                onClick={() => setError('Puedes contactar a la Mesa de Ayuda de Gestión Humana: ext. 4022.')}
              >
                Contacta a Gestión Humana
              </button>
            </p>
            <small>Mesa de ayuda: Lunes a Viernes de 7:30 a.m. a 5:30 p.m. • Ext. 4022</small>
          </div>
        </div>

        <p className="login-legal-footer">
          <Icon name="scale" size={14} />
          <span>TicoTalento CR • Conforme a la legislación y código de trabajo costarricense</span>
        </p>
      </section>
    </main>
  )
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
  const [session, setSession] = useState(() => JSON.parse(sessionStorage.getItem('ticotalento_session') || 'null'))
  const [page, setPage] = useState(() => localStorage.getItem('ticotalento_last_page') || 'inicio'); const [search, setSearch] = useState(''); const [chatContext, setChatContext] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ticotalento_notifications') || 'null') || [{ id: 1, title: 'Solicitud en seguimiento', detail: 'Tu constancia salarial está en revisión.', time: 'Hace 2 horas', read: false }, { id: 2, title: 'Calendario laboral actualizado', detail: 'Ya puedes consultar los feriados del año.', time: 'Ayer', read: false }, { id: 3, title: 'Nueva política disponible', detail: 'Se actualizó la política de teletrabajo.', time: 'Hace 3 días', read: true }] } catch { return [] }
  })
  const login = (data) => { sessionStorage.setItem('ticotalento_session', JSON.stringify(data)); sessionStorage.setItem('ticotalento_csrf', data.csrf_token || ''); setSession(data) }
  const logout = () => { sessionStorage.removeItem('ticotalento_session'); sessionStorage.removeItem('ticotalento_csrf'); localStorage.removeItem('ticotalento_last_page'); setSession(null) }
  const markNotificationsRead = () => { const updated = notifications.map((item) => ({ ...item, read: true })); setNotifications(updated); localStorage.setItem('ticotalento_notifications', JSON.stringify(updated)) }
  const openNotifications = () => { setNotificationsOpen((open) => !open); if (!notificationsOpen) markNotificationsRead() }
  useEffect(() => {
    if (session?.role !== 'RRHH' && page === 'dashboard') { setPage('inicio'); localStorage.setItem('ticotalento_last_page', 'inicio') }
  }, [page, session])
  if (!session) return <Login onLogin={login} />
  const navigate = (nextPage, context = '') => { if (nextPage === 'dashboard' && session.role !== 'RRHH') return; if (nextPage === 'chat') setChatContext(context); setPage(nextPage); localStorage.setItem('ticotalento_last_page', nextPage) }
  const pageContent = renderRoute(page, { setPage: navigate, role: session.role, token: session.access_token, Chat, Dashboard, chatContext, clearChatContext: () => setChatContext('') })
  const titles = { politicas: 'Políticas y beneficios', datos: 'Mis datos y trámites', ayuda: 'Centro de ayuda' }
  const unreadCount = notifications.filter((item) => !item.read).length
  return <main className="portal-layout"><Sidebar page={page} setPage={navigate} role={session.role} /><section className="portal-main"><header className="topbar"><form className="top-search" onSubmit={(event) => { event.preventDefault(); navigate('chat', search || 'Necesito ayuda con una política de Recursos Humanos') }}><Icon name="search" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar políticas, código de trabajo, trámites (Cmd+K)…" /></form><span className="location-pill"><Icon name="pin" size={15} />Sede Escazú</span><div className="session"><div className="notification-wrap"><button className="bell" onClick={openNotifications} aria-label="Abrir notificaciones"><Icon name="bell" size={20} />{unreadCount > 0 && <i />}</button>{notificationsOpen && <section className="notification-panel"><header><div><span>Notificaciones</span><small>{unreadCount ? `${unreadCount} pendientes` : 'Todo al día'}</small></div><button onClick={() => setNotificationsOpen(false)} aria-label="Cerrar notificaciones">×</button></header><div className="notification-list">{notifications.map((item) => <button key={item.id} className={item.read ? 'notification-item' : 'notification-item unread'} onClick={() => { setNotificationsOpen(false); navigate(item.id === 1 ? 'datos' : 'politicas') }}><span className="notification-dot" /><div><b>{item.title}</b><p>{item.detail}</p><small>{item.time}</small></div></button>)}</div><button className="notification-footer" onClick={() => { markNotificationsRead(); setNotificationsOpen(false); navigate('ayuda') }}>Ver centro de ayuda</button></section>}</div><div className="profile-block"><span className="user-avatar">MS</span><span className="user-name"><b>Mi perfil</b><small>{session.role === 'RRHH' ? 'Especialista de RRHH' : 'Colaborador'}</small></span></div><button className="logout" onClick={logout} aria-label="Cerrar sesión"><Icon name="logout" size={20} /></button></div></header>{titles[page] && <div className="page-title"><p className="eyebrow">PORTAL DE RECURSOS HUMANOS</p><h1>{titles[page]}</h1></div>}{pageContent}</section></main>
}
