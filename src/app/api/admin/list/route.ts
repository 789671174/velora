import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request){
  const { date } = await req.json() as { date: string }
  const requests = db.requests.filter(r => r.date===date).sort((a,b)=>a.time.localeCompare(b.time))
  const appointments = db.appointments.filter(a => a.start.startsWith(date)).sort((a,b)=>a.start.localeCompare(b.start))
  const counts = {
    pending: db.requests.filter(r=>r.date===date && r.status==='pending').length,
    fixed: appointments.length
  }
  return NextResponse.json({ requests, appointments, counts })
}
