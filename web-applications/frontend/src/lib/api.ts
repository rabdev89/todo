export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(`API Error ${status}`)
    this.status = status
    this.body = body
  }
}

/** NestJS ValidationPipe / HttpException message shapes */
export function formatApiErrorMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const msg = (body as { message: unknown }).message
    if (Array.isArray(msg)) return msg.filter(Boolean).join(' ')
    if (typeof msg === 'string') return msg
  }
  return 'Something went wrong'
}

function getToken() {
  return localStorage.getItem('access_token')
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = { auth: true },
): Promise<T> {
  const { auth = true, ...rest } = init
  const headers = new Headers(rest.headers)
  
  // Only set application/json if not FormData
  if (!(rest.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers })
  const text = await res.text()
  const body = text ? (JSON.parse(text) as unknown) : null
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

