// Service Worker for AI Meta Factory
const CACHE_NAME = 'ai-meta-factory-v2.0'
const OFFLINE_URL = '/offline.html'

const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Add other static assets here
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(JSON.stringify({
            error: 'You are offline',
            cached: false
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
        })
    )
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL)
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects())
  }
})

async function syncProjects() {
  try {
    // Get offline projects from IndexedDB
    const projects = await getOfflineProjects()
    
    for (const project of projects) {
      await syncProject(project)
    }
    
    console.log('Projects synced successfully')
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

async function getOfflineProjects() {
  // This would interact with IndexedDB
  return []
}

async function syncProject(project) {
  // Sync project to server
  return fetch('/api/projects/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  })
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {
    title: 'AI Meta Factory',
    body: 'New notification',
    icon: '/icon-192x192.png'
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/icon-96x96.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url)
        }
      })
  )
})
