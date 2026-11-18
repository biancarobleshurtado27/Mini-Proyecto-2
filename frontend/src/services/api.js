export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function api(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const raw = await response.text()
  let data
  try { data = JSON.parse(raw) }
  catch { throw new Error('El servidor no está disponible. Verifica que Docker y la base de datos estén iniciados.') }
  if (!response.ok) throw new Error(data.detail || 'Ocurrió un error en el servidor')
  return data
}
