import bcrypt from 'bcryptjs'
import { pool, query } from './db.js'

const hash = await bcrypt.hash('Demo2026!', 10)
await query('UPDATE usuarios SET password_hash=$1', [hash])
await pool.end()
console.log('Contraseñas de demostración migradas a bcryptjs.')
