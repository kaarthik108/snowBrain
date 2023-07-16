import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: ['/', '/sign-in'],
  afterAuth(auth, req, evt) {
    if (
      req.nextUrl.pathname.startsWith('/api') &&
      process.env.NODE_ENV != 'development'
    ) {
      if (
        !req.headers
          .get('referer')
          ?.includes(`https://${process.env.NEXT_PUBLIC_VERCEL_URL}` as string)
      ) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
