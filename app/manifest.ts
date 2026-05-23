import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PanhelQuiz — Quiz Battles για Πανελλήνιες',
    short_name: 'PanhelQuiz',
    description: 'Διάβασε για τις Πανελλήνιες παίζοντας 1v1 quiz battles.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0E14',
    theme_color: '#1D9E75',
    categories: ['education', 'games'],
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Παίξε τώρα', url: '/lobby', description: 'Βρες αντίπαλο αμέσως' },
      { name: 'Εξάσκηση', url: '/practice', description: 'Solo εξάσκηση' },
      { name: 'Dashboard', url: '/dashboard', description: 'Στατιστικά σου' },
    ],
  }
}
