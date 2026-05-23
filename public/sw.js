const CACHE = 'panhelquiz-v1'

// Network-first: πάντα προσπαθεί network, fallback στο cache
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  // Skip cross-origin requests (Supabase API etc)
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful page navigations
        if (res.ok && (e.request.mode === 'navigate' || e.request.destination === 'script' || e.request.destination === 'style')) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
