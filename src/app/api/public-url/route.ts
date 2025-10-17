import { NextRequest, NextResponse } from 'next/server'

function trimSlash(x: string) { return x.endsWith('/') ? x.slice(0, -1) : x }

export async function GET(req: NextRequest) {
  // 1) Falls in Vercel gesetzt, nehmen wir die ENV
  const envBase = process.env.NEXT_PUBLIC_BASE_URL

  // 2) Sonst Origin aus den Request-Headern (Vercel setzt x-forwarded-*)
  const host = req.headers.get('x-forwarded-host')
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const hdrOrigin = host ? `${proto}://${host}` : req.nextUrl.origin

  const base = envBase || hdrOrigin || ''
  const url = trimSlash(base) + '/client'
  return NextResponse.json({ url })
}
