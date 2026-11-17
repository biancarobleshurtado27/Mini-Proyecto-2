export function routeQuestion(question) {
  const restricted = /compañero|companero|otra persona|gerente general|salario del gerente|vacaciones de juan|gana\s+(?!yo\b)[a-záéíóúñ]+|(?:salario|sueldo|vacaciones|saldo|solicitud|incapacidad)\s+(?:de|del|la)\s+(?!mi\b|mis\b|yo\b)[a-záéíóúñ]+/i
  const outOfScope = /película|pelicula|receta|deporte|clima/i
  const personal = /me quedan|mi saldo|mi solicitud|próximo pago|proximo pago|mi evaluación|mi evaluacion/i
  const mixed = /acumular|pasar.*otro año|pasar.*otro ano/i
  if (restricted.test(question)) return 'RESTRINGIDA'
  if (outOfScope.test(question)) return 'FUERA_DE_ALCANCE'
  if (personal.test(question) && mixed.test(question)) return 'MIXTA'
  return personal.test(question) ? 'DATO_PERSONAL' : 'POLITICA'
}
