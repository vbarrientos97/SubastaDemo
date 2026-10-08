import type { Lot } from '@/lib/domain/lot'
import { isRegionId, regionById, type RegionId } from '@/lib/domain/region'

export type Role = 'admin' | 'buyer'

export type Account = {
  id: string
  role: Role
  username: string
  email: string
  password: string
  clientId?: string
}

export type Client = {
  id: string
  name: string
  paddle: string
  regionId: RegionId
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  paddle: string
  regionId: string
}

export type ClientInput = {
  name: string
  paddle: string
  regionId: string
}

export function normalizeLogin(value: string) {
  return value.trim().toLowerCase()
}

export function normalizePaddle(value: string) {
  return value.replace(/\D/g, '')
}

export function matchAccount(accounts: Account[], login: string, password: string) {
  const key = normalizeLogin(login)
  return (
    accounts.find((account) => {
      const sameLogin =
        normalizeLogin(account.username) === key || normalizeLogin(account.email) === key
      return sameLogin && account.password === password
    }) ?? null
  )
}

export function validateRegistration(
  input: RegisterInput,
  accounts: Account[],
  clients: Client[],
) {
  if (!input.name.trim()) return 'Escribe el nombre.'
  if (!input.email.includes('@')) return 'Escribe un correo válido.'
  if (input.password.trim().length < 4) return 'La contraseña debe tener al menos 4 caracteres.'
  const paddle = normalizePaddle(input.paddle)
  if (!paddle) return 'Escribe el número de paleta.'
  if (!isRegionId(input.regionId)) return 'Elige una región de envío.'
  const email = normalizeLogin(input.email)
  const taken = accounts.some(
    (account) =>
      normalizeLogin(account.email) === email || normalizeLogin(account.username) === email,
  )
  if (taken) return 'Ese correo ya está registrado.'
  if (clients.some((client) => normalizePaddle(client.paddle) === paddle)) {
    return 'Esa paleta ya está asignada.'
  }
  return null
}

export function validateClient(input: ClientInput, clients: Client[], exceptId?: string) {
  if (!input.name.trim()) return 'Escribe el nombre.'
  const paddle = normalizePaddle(input.paddle)
  if (!paddle) return 'Escribe el número de paleta.'
  if (!isRegionId(input.regionId)) return 'Elige una región de envío.'
  const taken = clients.some(
    (client) => client.id !== exceptId && normalizePaddle(client.paddle) === paddle,
  )
  if (taken) return 'Esa paleta ya está asignada.'
  return null
}

export function clientOfLot(lot: Lot, clients: Client[]) {
  return (
    clients.find((item) => item.id === lot.winnerClientId) ??
    clients.find((item) => {
      const paddle = Number.parseInt(normalizePaddle(item.paddle), 10)
      return Number.isFinite(paddle) && paddle === lot.soldToPaddle
    }) ??
    null
  )
}

export function regionOfLot(lot: Lot, clients: Client[]) {
  const client = clientOfLot(lot, clients)
  if (!client) return null
  return regionById(client.regionId)
}
