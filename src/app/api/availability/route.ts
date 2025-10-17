import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slotsForDay } from '@/lib/time'

export async function POST(req: NextRequest){
  const { date } = await req.json() as { date: string } // YYYY-MM-DD
  const d = new Date(date + 'T12:00:00')
  const dow = d.getDay()
  const set = db.settings
  const oh = set.opening[dow]
  const isHoliday = set.holidays.includes(date)
  if (!oh?.active || isHoliday){
    return NextResponse.json({ bookable: false, slots: [] })
  }
  // build candidate slots
  const slots = slotsForDay(date, oh.start, oh.end, set.slotMinutes)
  // remove taken or pending
  const blocked = new Set<string>()
  db.requests.filter(r => r.status !== 'rejected' && r.date===date).forEach(r => blocked.add(r.time))
  db.appointments.forEach(a => {
    const s = new Date(a.start); const e = new Date(a.end)
    // mark all slot labels that fall inside
    slots.forEach(label => {
      const t = new Date(date+'T'+label+':00')
      if (t>=s && t<e) blocked.add(label)
    })
  })
  const free = slots.filter(s => !blocked.has(s))
  return NextResponse.json({ bookable: true, slots: free })
}
