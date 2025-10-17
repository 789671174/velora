'use client'
import { useEffect, useState } from 'react'
import { addMonths, format, parseISO } from 'date-fns'
import MonthGrid from '@/components/calendar/month-grid'

type Request = { id:string, name:string, email:string, phone?:string, note?:string, date:string, time:string, status:string, createdAt:string }
type Appointment = { id:string, start:string, end:string, clientName:string, clientEmail:string, clientPhone?:string, note?:string }
type DayData = { requests: Request[], appointments: Appointment[], counts: { pending:number, fixed:number } }
type DayCounts = { pending: number; fixed: number }

export default function Entrepreneur(){
  const [date, setDate] = useState<Date>(new Date())
  const [uiDate, setUiDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [data, setData] = useState<DayData | null>(null)
  const [monthCounts, setMonthCounts] = useState<Record<string, DayCounts>>({})
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(120)

  async function fetchDay(){
    setLoading(true)
    const r = await fetch('/api/admin/list', { method:'POST', body: JSON.stringify({ date: uiDate }) })
    const j = await r.json()
    setData(j); setLoading(false)
  }
  async function fetchMonth(){
    const monthISO = format(date, 'yyyy-MM-01')
    const r = await fetch('/api/admin/month', { method:'POST', body: JSON.stringify({ monthISO }) })
    const j = await r.json()
    setMonthCounts(j.days || {})
  }

  useEffect(()=>{ setUiDate(format(date,'yyyy-MM-dd')) }, [date])
  useEffect(()=>{ fetchDay() }, [uiDate])
  useEffect(()=>{ fetchMonth() }, [date])

  async function decision(id:string, action:'accept'|'reject'){
    setLoading(true)
    const r = await fetch('/api/admin/decision', { method:'POST', body: JSON.stringify({ id, action, duration }) })
    await r.json()
    await fetchDay(); await fetchMonth()
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Unternehmer-Dashboard</h1>

      {/* Monats-Kalender mit Zählern */}
      <MonthGrid
        value={date}
        onChange={(d)=>setDate(d)}
        counts={monthCounts}
        onPrev={()=>setDate(addMonths(date, -1))}
        onNext={()=>setDate(addMonths(date, 1))}
      />

      {/* Tageskopf: Datum + Dauer + Badges */}
      <div className="card flex items-center gap-3">
        <div>
          <div className="label">Gewähltes Datum</div>
          <input className="input" type="date" value={uiDate} onChange={e=>setDate(new Date(e.target.value+'T12:00:00'))} />
        </div>
        <div>
          <div className="label">Standard-Dauer (min)</div>
          <input className="input" type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value||'0'))} />
        </div>
        <div className="ml-auto flex gap-2">
          <div className="badge">ausstehend {data?.counts.pending ?? 0}</div>
          <div className="badge">fix {data?.counts.fixed ?? 0}</div>
        </div>
      </div>

      {/* Listen: links Anfragen, rechts Fixe */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-2">Anfragen ({data?.requests.length ?? 0})</h2>
          <div className="grid gap-3">
            {(data?.requests ?? []).filter(r=>r.status==='pending').map(r=> (
              <div key={r.id} className="p-3 rounded-xl border dark:border-gray-700">
                <div className="font-medium">{r.time} – {r.name}</div>
                <div className="text-sm opacity-80">{r.email}{r.phone ? ' · '+r.phone : ''}</div>
                {r.note && <div className="text-sm mt-1">„{r.note}“</div>}
                <div className="mt-2 flex gap-2">
                  <button className="btn btn-primary" onClick={()=>decision(r.id,'accept')}>Annehmen</button>
                  <button className="btn" onClick={()=>decision(r.id,'reject')}>Stornieren</button>
                </div>
              </div>
            ))}
            {data && data.requests.filter(r=>r.status==='pending').length===0 && <div className="text-sm opacity-70">Keine offenen Anfragen.</div>}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Fixe Termine ({data?.appointments.length ?? 0})</h2>
          <div className="grid gap-2">
            {(data?.appointments ?? []).map(a=> (
              <div key={a.id} className="p-3 rounded-xl border dark:border-gray-700">
                <div className="font-medium">
                  {format(parseISO(a.start),'HH:mm')}–{format(parseISO(a.end),'HH:mm')} · {a.clientName}
                </div>
                <div className="text-sm opacity-80">{a.clientEmail}{a.clientPhone ? ' · '+a.clientPhone : ''}</div>
                {a.note && <div className="text-sm mt-1">„{a.note}“</div>}
              </div>
            ))}
            {data && data.appointments.length===0 && <div className="text-sm opacity-70">Noch keine Termine.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
