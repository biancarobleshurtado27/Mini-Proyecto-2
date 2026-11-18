import { navigation } from '../routes/navigation'
import Icon from './Icon'

export default function Sidebar({ page, setPage, role }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => setPage('inicio')} aria-label="Ir al inicio"><span className="brand-mark">T</span><span><b>TicoTalento</b><small>Portal de<br />Personas CR</small></span></button>
    <p className="sidebar-label">COLABORADOR</p>
    <nav>{navigation.map((item) => <button key={item.id} onClick={() => setPage(item.id)} className={page === item.id ? 'nav-item active' : 'nav-item'}><Icon name={item.icon} size={18} /><span>{item.label}</span></button>)}</nav>
    {role === 'RRHH' && <><div className="nav-divider" /><p className="sidebar-label administration">ADMINISTRACIÓN</p><button onClick={() => setPage('dashboard')} className={page === 'dashboard' ? 'nav-item active' : 'nav-item'}><Icon name="grid" size={18} /><span>Panel RRHH</span></button></>}
    <div className="sidebar-spacer" />
    <div className="sidebar-bottom"><span>Vista de Rol</span><b>{role === 'RRHH' ? 'RRHH' : 'Colab.'}</b></div>
    <button className="help-desk" onClick={() => setPage('ayuda')}><span className="help-ring"><Icon name="help" size={32} /></span><span><b>Ayuda & FAQ</b><small>Centro de soporte RH</small></span></button>
  </aside>
}
