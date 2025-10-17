import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addMinutes, parseISO } from 'date-fns'

export async function POST(req: NextRequest){
  const { id, action, duration } = await req.json() as { id: string, action: 'accept'|'reject', duration?: number }
  const r = db.requests.find(x=>x.id===id)
  if (!r) return NextResponse.json({error:'Not found'},{status:404})
  if (action==='reject'){
    r.status='rejected'
    // simulate email/sms
    return NextResponse.json({ok:true})
  } else {
    const startISO = r.date + 'T' + r.time + ':00'
    const start = parseISO(startISO)
    const end = addMinutes(start, duration ?? db.settings.slotMinutes)
    const apptId = 'apt_' + Date.now()
    db.appointments.push({
      id: apptId,
      start: start.toISOString(),
      end: end.toISOString(),
      clientName: r.name,
      clientEmail: r.email,
      clientPhone: r.phone,
      note: r.note,
    })
    r.status='accepted'
    // simulate email/sms
    return NextResponse.json({ok:true, apptId})
  }
}
