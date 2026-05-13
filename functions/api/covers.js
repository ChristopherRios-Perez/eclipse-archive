// Cloudflare Pages Function - proxies MangaDex cover API requests server-side.
// This bypasses the CORS restriction that blocks browser requests to api.mangadex.org
// from the workers.dev domain.

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  // Forward the same query string to MangaDex
  const mangadexUrl = `https://api.mangadex.org/cover${url.search}`

  const response = await fetch(mangadexUrl, {
    headers: {
      'User-Agent': 'eclipse-archive/1.0',
      'Accept': 'application/json',
    },
  })

  const data = await response.json()

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
