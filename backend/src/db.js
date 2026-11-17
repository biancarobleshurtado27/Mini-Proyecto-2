import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env') })
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
export const query = (text, params) => pool.query(text, params)
