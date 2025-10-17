import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Settings } from '@/lib/db'

const Hours = z.object({ active: z.boolean(), start: z.string(), end: z.string() })
const Schema = z.object({
  businessName: z.string().min(2),
  emailFromName: z.string().min(1),
  emailFromAddress: z.string().email(),
  smsFrom: z.string().min(3),
  slotMinutes: z.number().int().min(5).max(120),
  opening: z.record(z.string(), Hours),
  holidays: z.array(z.string()),
  logoUrl: z.string().optional() // ← neu, Base64 oder URL
})

export async function POST(req: NextRequest) {
  const data = await req.json()
  const parsed = Schema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', issues: parsed.error.issues }, { status: 400 })
  }
  db.settings = parsed.data as Settings
  return NextResponse.json({ ok: true })
}
