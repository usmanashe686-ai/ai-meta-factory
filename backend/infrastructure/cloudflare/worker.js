// Cloudflare Worker that caches API responses
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  let response = await cache.match(request)

  if (!response) {
    response = await fetch(request)
    if (response.status === 200) {
      // Cache for 1 hour (3600 seconds)
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Cache-Control', 'public, max-age=3600')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
      event.waitUntil(cache.put(request, response.clone()))
    }
  }
  return response
}
