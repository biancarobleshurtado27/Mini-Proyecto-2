import { navigation } from '../routes/navigation'

export default function Sidebar({ page, setPage, role }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => setPage('inicio')} aria-label="Ir al inicio">
      <span className="brand-mark">✦</span><span><b>TicoTalento</b><small>Portal de<br />Personas CR</small></span>
    </button>
    <p className="sidebar-label">COLABORADOR</p>
    <nav>{navigation.map((item) => <button key={item.id} onClick={() => setPage(item.id)} className={page === item.id ? 'nav-item active' : 'nav-item'}><b>{item.icon}</b>{item.label}</button>)}</nav>
    {role === 'RRHH' && <><div className="nav-divider" /><p className="sidebar-label administration">ADMINISTRACIÓN</p><button onClick={() => setPage('dashboard')} className={page === 'dashboard' ? 'nav-item active' : 'nav-item'}><b>▦</b>Panel RRHH</button></>}
    <div className="sidebar-bottom"><span>Vista de Rol</span><b>{role === 'RRHH' ? 'RRHH' : 'Colab.'}</b></div>
    <button className="help-desk" onClick={() => setPage('ayuda')}>♧ Mesa de Ayuda RH</button>
  </aside>
}
