import bcrypt from 'bcryptjs'
import { pool, query } from './db.js'

if (Number((await query('SELECT COUNT(*)::int AS count FROM colaboradores')).rows[0].count) > 0) {
  console.log('Datos existentes: seed omitido.'); await pool.end(); process.exit(0)
}
const departments = ['Tecnología', 'Ventas', 'Operaciones', 'Finanzas', 'Recursos Humanos']
const names = ['Ana Alvarado', 'Carlos Díaz', 'Daniela Gómez', 'Esteban Mora', 'Fernanda Castro', 'Gabriel Fernández', 'Helena Jiménez', 'Iván Brenes', 'Julia Esquivel', 'Kevin Hernández']
const hash = await bcrypt.hash('Demo2026!', 10)
for (let index = 0; index < 50; index += 1) {
  const employee = (await query('INSERT INTO colaboradores(nombre, departamento, puesto, fecha_ingreso, estado) VALUES($1,$2,$3,$4,$5) RETURNING id', [names[index % names.length], departments[index % departments.length], 'Analista', `202${2 + (index % 3)}-01-15`, 'ACTIVO'])).rows[0]
  const email = index === 0 ? 'ana.alvarado.1@ticotalento.test' : index === 1 ? 'carlos.diaz.2@ticotalento.test' : `usuario.${index + 1}@ticotalento.local`
  await query('INSERT INTO usuarios(email,password_hash,rol,colaborador_id) VALUES($1,$2,$3,$4)', [email, hash, index === 0 ? 'RRHH' : 'COLABORADOR', employee.id])
  const taken = index % 11
  await query('INSERT INTO saldos_vacaciones(colaborador_id,periodo,dias_asignados,dias_tomados,dias_disponibles) VALUES($1,$2,$3,$4,$5)', [employee.id, '2026-2027', 15, taken, 15 - taken])
  for (const month of [9, 10, 11]) {
    await query('INSERT INTO solicitudes(colaborador_id,tipo,fecha_inicio,fecha_fin,estado) VALUES($1,$2,$3,$4,$5)', [employee.id, index % 2 ? 'PERMISO' : 'VACACIONES', `2026-${month}-15`, `2026-${month}-16`, (index + month) % 7 === 0 ? 'PENDIENTE' : 'APROBADA'])
    await query('INSERT INTO movimientos_personal(colaborador_id,tipo,fecha,motivo) VALUES($1,$2,$3,$4)', [employee.id, 'ACTUALIZACION', `2026-${month}-02`, 'Movimiento simulado'])
  }
  if (index % 8 === 0) await query('INSERT INTO incapacidades(colaborador_id,tipo,fecha_inicio,dias,entidad) VALUES($1,$2,$3,$4,$5)', [employee.id, 'ENFERMEDAD', '2026-11-10', 5, 'CCSS'])
}
await pool.end(); console.log('50 colaboradores ficticios creados. Contraseña: Demo2026!')
