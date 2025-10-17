import { NextRequest, NextResponse } from 'next/server'

function trimSlash(x: string) { return x.endsWith('/') ? x.slice(0, -1) : x }

export async function GET(req: NextRequest) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL
  const host = req.headers.get('x-forwarded-host')
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const hdrOrigin = host ? ${proto}://System.Management.Automation.Internal.Host.InternalHost : req.nextUrl.origin
  const base = envBase || hdrOrigin || ''
  const url = trimSlash(base) + '/client'
  return NextResponse.json({ url })
}
