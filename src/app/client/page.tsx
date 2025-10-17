'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

type Availability = { bookable: boolean, slots: string[] }

export default function ClientPage(){
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<string[]>([])
  const [bookable, setBookable] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', note:'', time:'' })
  const [ok, setOk] = useState<string| null>(null)
  const [err, setErr] = useState<string| null>(null)

  useEffect(()=>{ refresh() }, [date])
  async function refresh(){
    setLoading(true)
    const r = await fetch('/api/availability', { method:'POST', body: JSON.stringify({ date }) })
    const j: Availability = await r.json()
    setBookable(j.bookable); setSlots(j.slots); setLoading(false)
    if (j.slots.length>0) setForm(f=>({...f, time: j.slots[0]}))
  }

  async function submit(){
    setErr(null); setOk(null)
    const body = { ...form, date }
    const r = await fetch('/api/request', { method:'POST', body: JSON.stringify(body) })
    if (!r.ok){ setErr('Bitte Eingaben prüfen.'); return }
    const j = await r.json()
    setOk('Anfrage gesendet. ID: '+j.id)
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Buchung</h1>
      <div className="card grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="label">Datum</div>
            <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            {!bookable && <div className="text-sm mt-1 text-red-500">Dieser Tag ist geschlossen oder nicht buchbar.</div>}
          </div>
          <div>
            <div className="label">Uhrzeit</div>
            <select className="input" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} disabled={!bookable || loading || slots.length===0}>
              {slots.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="text-xs opacity-70 mt-1">{slots.length} freie Slots</div>
          </div>
          <div>
            <div className="label">Name</div>
            <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Max Muster" />
          </div>
          <div>
            <div className="label">E-Mail</div>
            <input className="input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="max@example.com" />
          </div>
          <div>
            <div className="label">Telefon (optional)</div>
            <input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="+41 ..." />
          </div>
          <div className="md:col-span-2">
            <div className="label">Bemerkung</div>
            <textarea className="input h-28" value={form.note} onChange={e=>setForm({...form, note:e.target.value})} placeholder="z. B. Haare schneiden & färben um 14:00" />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={submit} disabled={!bookable}>Buchungsanfrage senden</button>
        </div>
        {ok && <div className="text-green-600">{ok}</div>}
        {err && <div className="text-red-600">{err}</div>}
      </div>
    </div>
  )
}
