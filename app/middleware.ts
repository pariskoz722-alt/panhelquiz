import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-qsxcjzbrhsvgoppvjole-auth-token')

  const protectedRoutes = ['/dashboard', '/lobby', '/game', '/profile', '/leaderboard']
  const isProtected = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/lobby/:path*', '/game/:path*', '/profile/:path*', '/leaderboard/:path*'],
}