import http from 'node:http'
import https from 'node:https'
import type { Handle } from '@sveltejs/kit'

// Docker Compose `web` sets PUBLIC_API_URL=http://rust-core:8080. Local `npm run dev`: use host-mapped
// rust-core (see docker-compose rust-core ports, default 127.0.0.1:8082 → container 8080).
const API_BASE =
  (typeof process !== 'undefined' && process.env.PUBLIC_API_URL?.trim()) ||
  'http://127.0.0.1:8082'

function proxyRequest(targetUrl: string, method: string, reqHeaders: Record<string, string>, body: Buffer | null): Promise<{ status: number; headers: Record<string, string | string[]>; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl)
    const isHttps = url.protocol === 'https:'
    const agent = isHttps ? https : http

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        ...reqHeaders,
        ...(body ? { 'content-length': String(body.byteLength) } : {}),
      },
    }

    const req = agent.request(options, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        resolve({
          status: res.statusCode ?? 200,
          headers: res.headers as Record<string, string | string[]>,
          body: Buffer.concat(chunks),
        })
      })
    })

    req.on('error', reject)

    if (body) req.write(body)
    req.end()
  })
}

export const handle: Handle = async ({ event, resolve }) => {
  // Proxy all /api/* requests to the backend
  if (event.url.pathname.startsWith('/api/')) {
    const targetUrl = `${API_BASE}${event.url.pathname}${event.url.search}`
    const method = event.request.method
    const hasBody = method !== 'GET' && method !== 'HEAD'

    const rawBody = hasBody ? Buffer.from(await event.request.arrayBuffer()) : null

    const reqHeaders: Record<string, string> = {}
    for (const [key, value] of event.request.headers.entries()) {
      if (key !== 'host' && key !== 'connection' && key !== 'transfer-encoding') {
        reqHeaders[key] = value
      }
    }

    try {
      const result = await proxyRequest(targetUrl, method, reqHeaders, rawBody)

      const responseHeaders = new Headers()
      for (const [key, value] of Object.entries(result.headers)) {
        if (key === 'transfer-encoding' || key === 'connection') continue
        if (key === 'set-cookie' && Array.isArray(value)) {
          for (const cookie of value) {
            responseHeaders.append('set-cookie', cookie)
          }
        } else if (typeof value === 'string') {
          responseHeaders.set(key, value)
        }
      }

      return new Response(result.body, {
        status: result.status,
        headers: responseHeaders,
      })
    } catch (err) {
      console.error(`[proxy] ${method} ${targetUrl} failed:`, err)
      return new Response(JSON.stringify({ error: 'proxy error' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    }
  }

  // Resolve user from session cookie for SSR
  const cookie = event.request.headers.get('cookie') || ''

  if (cookie) {
    try {
      const result = await proxyRequest(
        `${API_BASE}/api/v1/auth/me`,
        'GET',
        { cookie },
        null
      )
      if (result.status === 200) {
        event.locals.user = JSON.parse(result.body.toString())
      } else {
        event.locals.user = null
      }
    } catch {
      event.locals.user = null
    }
  } else {
    event.locals.user = null
  }

  return resolve(event)
}
