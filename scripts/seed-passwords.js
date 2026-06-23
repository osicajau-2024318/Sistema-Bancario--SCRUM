// Resetea las contraseñas de los clientes demo a un valor conocido (Cliente123!)
// para poder ejecutar el flujo de evaluación bimestral sin tener que recordar
// contraseñas individuales. Usa el endpoint admin protegido por JWT + ADMIN_ROLE.

import axios from 'axios'

const AUTH_BASE = process.env.AUTH_SERVICE_URL || 'http://localhost:5025/api/v1'
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || 'ADMINB'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ADMINB'
const NEW_CLIENT_PASSWORD = process.env.SEED_CLIENT_PASSWORD || 'Cliente123!'

// Usuarios cliente que queremos dejar en contraseña conocida.
// Mantener emails reales del seed de la BD para que el script sea idempotente.
const CLIENT_EMAILS = [
  'josueboror2018@gmail.com',
  'josueboror2026@gmail.com',
  'merida@example.com',
  'jsajchee-202438000@kinal.edu.gt',
  't@t.com',
]

async function loginAsAdmin() {
  const { data } = await axios.post(`${AUTH_BASE}/auth/login`, {
    emailOrUsername: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  })
  if (!data?.token) {
    throw new Error('No se obtuvo token de admin. Revisa credenciales SEED_ADMIN_*.')
  }
  return data.token
}

async function findUserByEmail(token, email) {
  const { data } = await axios.get(`${AUTH_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { searchTerm: email, pageSize: 5 },
  })
  const items = data?.data?.items || []
  return items.find((u) => (u.email || '').toLowerCase() === email.toLowerCase()) || null
}

async function resetPassword(token, userId) {
  const { data } = await axios.post(
    `${AUTH_BASE}/admin/users/${userId}/reset-password`,
    { newPassword: NEW_CLIENT_PASSWORD },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data
}

async function main() {
  console.log(`[seed:passwords] AUTH_BASE=${AUTH_BASE}`)
  console.log(`[seed:passwords] Nueva contraseña cliente: ${NEW_CLIENT_PASSWORD}`)

  let token
  try {
    token = await loginAsAdmin()
    console.log('[seed:passwords] Login admin OK')
  } catch (error) {
    console.error('[seed:passwords] No se pudo loguear como admin:', error.response?.data || error.message)
    process.exit(1)
  }

  let okCount = 0
  let missCount = 0
  for (const email of CLIENT_EMAILS) {
    try {
      const user = await findUserByEmail(token, email)
      if (!user) {
        console.warn(`[seed:passwords] · ${email} -> usuario no encontrado, skip`)
        missCount += 1
        continue
      }
      await resetPassword(token, user.id)
      console.log(`[seed:passwords] · ${email} (${user.username}) -> contraseña reseteada`)
      okCount += 1
    } catch (error) {
      const detail = error.response?.data?.message || error.response?.data || error.message
      console.error(`[seed:passwords] · ${email} -> error:`, detail)
      missCount += 1
    }
  }

  console.log(`[seed:passwords] Reset OK: ${okCount} / Errores: ${missCount}`)
  console.log(`[seed:passwords] Todos los clientes listados pueden loguearse con: ${NEW_CLIENT_PASSWORD}`)
}

main().catch((error) => {
  console.error('[seed:passwords] Error inesperado:', error)
  process.exit(1)
})
