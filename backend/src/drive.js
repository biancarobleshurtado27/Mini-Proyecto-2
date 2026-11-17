import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { query } from './db.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const docsMime = 'application/vnd.google-apps.document'
const sheetsMime = 'application/vnd.google-apps.spreadsheet'

function chunks(text, size = 650, overlap = 100) {
  const words = text.split(/\s+/).filter(Boolean)
  const result = []
  for (let start = 0; start < words.length; start += size - overlap) result.push(words.slice(start, start + size).join(' '))
  return result.filter(Boolean)
}

async function driveClient() {
  let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (!folderId) throw new Error('GOOGLE_DRIVE_FOLDER_ID no está configurado.')
  if (folderId.startsWith('http')) {
    const match = new URL(folderId).pathname.match(/\/folders\/([^/]+)/)
    if (!match) throw new Error('La URL de Drive no contiene un ID de carpeta válido.')
    folderId = match[1]
  }
  const keyFile = path.join(root, 'service-account.json')
  const auth = new google.auth.GoogleAuth({ keyFile, scopes: ['https://www.googleapis.com/auth/drive.readonly'] })
  return { drive: google.drive({ version: 'v3', auth }), folderId }
}

async function getFileText(drive, file) {
  if (file.mimeType === docsMime) {
    const response = await drive.files.export({ fileId: file.id, mimeType: 'text/plain' }, { responseType: 'arraybuffer' })
    return Buffer.from(response.data).toString('utf8')
  }
  if (file.mimeType === sheetsMime) {
    const response = await drive.files.export({ fileId: file.id, mimeType: 'text/csv' }, { responseType: 'arraybuffer' })
    return Buffer.from(response.data).toString('utf8')
  }
  const response = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' })
  const buffer = Buffer.from(response.data)
  if (file.mimeType !== 'application/pdf') return buffer.toString('utf8')
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
  const pages = []
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => item.str).join(' '))
  }
  return pages.join('\n')
}

export async function syncDrive() {
  const { drive, folderId } = await driveClient()
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink)', pageSize: 100,
    supportsAllDrives: true, includeItemsFromAllDrives: true,
  })
  const files = response.data.files || []
  const counters = { indexed: 0, updated: 0, unchanged: 0, files_seen: files.length, errors: [] }
  const seen = []
  for (const file of files) {
    try {
      const text = (await getFileText(drive, file)).trim()
      if (!text) throw new Error('No se pudo extraer texto del archivo.')
      const hash = crypto.createHash('sha256').update(text).digest('hex')
      const existing = (await query('SELECT id, contenido_hash FROM documentos WHERE drive_file_id=$1', [file.id])).rows[0]
      seen.push(file.id)
      if (existing?.contenido_hash === hash) { counters.unchanged += 1; continue }
      const document = (await query(
        `INSERT INTO documentos(drive_file_id,nombre,version,fecha_vigencia,responsable,drive_url,contenido_hash,indexado_en,eliminado)
         VALUES($1,$2,'1.0',CURRENT_DATE,'Recursos Humanos',$3,$4,NOW(),FALSE)
         ON CONFLICT(drive_file_id) DO UPDATE SET nombre=EXCLUDED.nombre,drive_url=EXCLUDED.drive_url,contenido_hash=EXCLUDED.contenido_hash,indexado_en=NOW(),eliminado=FALSE
         RETURNING id`, [file.id, file.name, file.webViewLink || '', hash]
      )).rows[0]
      await query('DELETE FROM document_chunks WHERE documento_id=$1', [document.id])
      for (const [index, chunk] of chunks(text).entries()) {
        await query('INSERT INTO document_chunks(documento_id,seccion,contenido,metadata_json) VALUES($1,$2,$3,$4)', [document.id, `Fragmento ${index + 1}`, chunk, JSON.stringify({ file_id: file.id, modified: file.modifiedTime })])
      }
      if (existing) counters.updated += 1; else counters.indexed += 1
    } catch (error) { counters.errors.push({ file: file.name, detail: error.message }) }
  }
  if (seen.length) await query('UPDATE documentos SET eliminado=TRUE WHERE drive_file_id <> ALL($1::text[])', [seen])
  return counters
}

export async function searchIndexedPolicy(question) {
  const terms = [...new Set((question.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || []).filter((word) => !['cuanto','cuantos','donde','como','para','tengo'].includes(word)))]
  const rows = (await query(
    'SELECT d.nombre,d.drive_url,c.seccion,c.contenido FROM document_chunks c JOIN documentos d ON d.id=c.documento_id WHERE d.eliminado=FALSE LIMIT 500'
  )).rows
  const ranked = rows.map((row) => {
    const content = row.contenido.toLowerCase()
    const fileName = row.nombre.toLowerCase()
    const score = terms.reduce((total, term) => {
      const inContent = content.includes(term) ? 2 : 0
      const inFileName = fileName.includes(term) ? 12 : 0
      const stem = term.slice(0, -1)
      const relatedFile = stem.length >= 4 && fileName.includes(stem) ? 6 : 0
      return total + inContent + inFileName + relatedFile
    }, 0)
    return { ...row, score }
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score)
  return ranked[0] || null
}
