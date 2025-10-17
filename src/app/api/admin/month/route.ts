import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { format, parseISO } from 'date-fns'

type DayCounts = { pending: number; fixed: number }

export async function POST(req: NextRequest) {
  const { monthISO } = await req.json() as { monthISO: string } // z.B. "2025-09-01"
  if (!monthISO) return NextResponse.json({ error: 'monthISO required' }, { status: 400 })

  const targetMonth = monthISO.slice(0, 7) // "YYYY-MM"
  const map: Record<string, DayCounts> = {}

  // Requests (pending & accepted zählen NICHT als fixed hier)
  for (const r of db.requests) {
    if (r.date.startsWith(targetMonth)) {
      const key = r.date
      map[key] ||= { pending: 0, fixed: 0 }
      if (r.status === 'pending') map[key].pending += 1
    }
  }

  // Appointments = fixed
  for (const a of db.appointments) {
    const d = format(parseISO(a.start), 'yyyy-MM-dd')
    if (d.startsWith(targetMonth)) {
      const key = d
      map[key] ||= { pending: 0, fixed: 0 }
      map[key].fixed += 1
    }
  }

  return NextResponse.json({ days: map })
}
