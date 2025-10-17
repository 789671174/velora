import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  note: z.string().max(1000).optional(),
  date: z.string(), // YYYY-MM-DD
  time: z.string()  // HH:mm
})

export async function POST(req: NextRequest){
  const data = await req.json()
  const parsed = Schema.safeParse(data)
  if (!parsed.success){
    return NextResponse.json({ error: 'Ungültige Eingaben', issues: parsed.error.issues }, { status: 400 })
  }
  const r = parsed.data
  const id = `req_${Date.now()}`
  db.requests.push({ id, name: r.name, email: r.email, phone: r.phone, note: r.note, date: r.date, time: r.time, status: 'pending', createdAt: new Date().toISOString() })
  return NextResponse.json({ ok: true, id })
}
