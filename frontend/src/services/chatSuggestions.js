const topics = {
  vacaciones: {
    label: 'Vacaciones y saldos',
    questions: [
      '¿Cuántos días de vacaciones tengo disponibles?',
      '¿Cómo solicito mis vacaciones y con cuánta anticipación?',
      '¿Qué sucede si no utilizo mis días de vacaciones?',
      '¿Puedo modificar o cancelar una solicitud de vacaciones?',
    ],
  },
  solicitudes: {
    label: 'Solicitudes y trámites',
    questions: [
      '¿Cuál es el estado de mi solicitud más reciente?',
      '¿Cómo solicito una constancia salarial?',
      '¿Qué permisos puedo tramitar desde el portal?',
      '¿Cuánto tarda la aprobación de una solicitud?',
    ],
  },
  planilla: {
    label: 'Planilla y pagos',
    questions: [
      '¿Cuándo corresponde mi próximo pago?',
      '¿Cómo se calcula el aguinaldo?',
      '¿Dónde consulto mis comprobantes de pago?',
      '¿Qué hago si tengo una duda sobre mi planilla?',
    ],
  },
  feriados: {
    label: 'Feriados y calendario',
    questions: ['¿Cuáles feriados son de pago obligatorio?', '¿Qué pasa si trabajo un feriado?', '¿Dónde consulto el calendario laboral?', '¿Cómo se compensan los días feriados?'],
  },
  incapacidades: {
    label: 'Incapacidades',
    questions: ['¿Cómo reporto una incapacidad de la CCSS?', '¿Qué documentos debo adjuntar?', '¿Cuál es el plazo para reportar una incapacidad?', '¿Cómo se calcula el subsidio durante una incapacidad?'],
  },
  teletrabajo: {
    label: 'Jornada y teletrabajo',
    questions: ['¿Cuál es la política de teletrabajo?', '¿Cómo registro mi jornada laboral?', '¿Qué sucede con las horas extra?', '¿Qué apoyo existe para conectividad?'],
  },
  beneficios: {
    label: 'Beneficios',
    questions: ['¿Qué beneficios tengo disponibles?', '¿Cómo uso el beneficio de salud y odontología?', '¿Qué seguros incluye la empresa?', '¿Dónde consulto las condiciones de cada beneficio?'],
  },
}

export function getChatSuggestions(topic = '') {
  const normalized = topic.toLowerCase()
  const key = Object.keys(topics).find((candidate) => normalized.includes(candidate)) || 'general'
  if (topics[key]) return topics[key]
  return { label: 'Recursos Humanos', questions: ['¿Cómo solicito vacaciones?', '¿Cómo reporto una incapacidad?', '¿Cuándo se calcula el aguinaldo?', '¿Qué beneficios tengo disponibles?'] }
}
