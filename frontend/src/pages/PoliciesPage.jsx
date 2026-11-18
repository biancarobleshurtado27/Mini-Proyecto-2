const policies = [
  ['Vacaciones y saldos', 'vacaciones'], ['Feriados y calendario', 'feriados'], ['Permisos y licencias', 'solicitudes'], ['Incapacidades', 'incapacidades'], ['Jornada y teletrabajo', 'teletrabajo'], ['Remuneración y aguinaldo', 'planilla'], ['Beneficios', 'beneficios'], ['Onboarding y salida', 'general'], ['Desempeño', 'general'], ['Conducta y denuncias', 'general'], ['Privacidad de datos', 'general'], ['Uso responsable de IA', 'general'],
]

export default function PoliciesPage({ setPage }) {
  return <section className="page"><p className="eyebrow">BIBLIOTECA RRHH</p><h2>Políticas disponibles</h2><p className="lead">Selecciona una categoría para abrir sus preguntas y dudas frecuentes en el asistente.</p><div className="policy-grid">{policies.map(([policy, topic], index) => <article key={policy}><b>{String(index + 1).padStart(2, '0')}</b><h3>{policy}</h3><button onClick={() => setPage('chat', topic)}>Consultar</button></article>)}</div></section>
}
