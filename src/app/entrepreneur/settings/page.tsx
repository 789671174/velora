'use client'
import { useEffect, useMemo, useState } from 'react'

type Hours = { active: boolean; start: string; end: string }
type Settings = {
  businessName: string
  emailFromName: string
  emailFromAddress: string
  smsFrom: string
  slotMinutes: number
  opening: Record<string, Hours>
  holidays: string[]
  logoUrl?: string
}

const days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']

function enumerateDates(fromISO: string, toISO: string){
  const out: string[] = []
  if (!fromISO || !toISO) return out
  let d = new Date(fromISO + 'T12:00:00')
  let e = new Date(toISO + 'T12:00:00')
  if (d > e) [d, e] = [e, d]
  while (d <= e){
    out.push(d.toISOString().slice(0,10))
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  }
  return out
}
function compressToRanges(dates: string[]): Array<{from: string; to: string}> {
  const sorted = [...dates].sort()
  const ranges: Array<{from:string; to:string}> = []
  for (let i=0;i<sorted.length;i++){
    const start = sorted[i]
    let end = start
    while (i+1 < sorted.length){
      const curr = new Date(sorted[i]+'T12:00:00')
      const next = new Date(sorted[i+1]+'T12:00:00')
      const diffDays = Math.round((next.getTime() - curr.getTime()) / 86400000)
      if (diffDays === 1){ end = sorted[i+1]; i++; continue }
      break
    }
    ranges.push({ from: start, to: end })
  }
  return ranges
}

export default function SettingsPage(){
  const [s, setS] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const holidaysKey = s?.holidays?.join('|') ?? ''
  const ranges = useMemo(() => compressToRanges(s?.holidays ?? []), [holidaysKey])

  const [publicUrl, setPublicUrl] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/settings/get'); const j = await r.json(); setS(j)
  })() },[])

  // Kunden-Link NUR clientseitig aus window.origin (keine ENV, keine Regex)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin.endsWith('/')
        ? window.location.origin.slice(0, -1)
        : window.location.origin
      setPublicUrl(origin + '/client')
    } else {
      setPublicUrl('/client')
    }
  }, [])

  // QR nur im Browser generieren (dynamisch importieren)
  useEffect(()=>{
    let alive = true
    ;(async ()=>{
      try{
        if (!publicUrl) return
        const mod = await import('qrcode/esm')
        const toDataURL = mod.toDataURL ?? mod.default?.toDataURL
        if (!toDataURL) throw new Error('QR module has no toDataURL export')
        const data = await toDataURL(publicUrl, { margin: 1, width: 192 })
        if (alive) setQrDataUrl(data)
      }catch (err){
        console.error('QR generation failed', err)
        if (alive) setQrDataUrl('')
      }
    })()
    return ()=>{ alive = false }
  }, [publicUrl])

  if (!s) return <div>Laden...</div>

  function addHolidayRange(){
    const dates = enumerateDates(rangeFrom, rangeTo)
    if (dates.length === 0) return
    const set = new Set(s.holidays)
    dates.forEach(d => set.add(d))
    setS({ ...s, holidays: Array.from(set).sort() })
    setRangeFrom(''); setRangeTo('')
  }
  function removeRange(r: {from:string; to:string}){
    const toRemove = new Set(enumerateDates(r.from, r.to))
    setS({ ...s, holidays: s.holidays.filter(d => !toRemove.has(d)) })
  }
  async function save(){
    setSaving(true)
    await fetch('/api/settings/save',{ method:'POST', body: JSON.stringify(s) })
    setSaving(false)
  }
  async function copyLink(){
    try { await navigator.clipboard.writeText(publicUrl); alert('Link kopiert: ' + publicUrl) } catch {}
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Einstellungen</h1>

      <div className="card grid gap-6">
        {/* Logo */}
        <section>
          <div className="font-medium mb-1">Logo</div>
          <div className="flex items-center gap-3 mb-2">
            {s.logoUrl ? (
              <img src={s.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg border dark:border-gray-700 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg border dark:border-gray-700 flex items-center justify-center text-sm opacity-70">kein Logo</div>
            )}
            <label className="btn cursor-pointer">
              Datei wählen
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return
                  if (file.size > 1_500_000) { alert('Bild > 1.5 MB. Bitte kleiner.'); return }
                  const reader = new FileReader()
                  reader.onload = () => setS({ ...s, logoUrl: reader.result as string })
                  reader.readAsDataURL(file)
                }} />
            </label>
            {s.logoUrl && <button className="btn" onClick={()=>setS({ ...s, logoUrl: undefined })}>Entfernen</button>}
          </div>
          <div className="text-xs opacity-70">PNG / JPG / SVG • Demo speichert Base64 lokal.</div>
        </section>

        {/* Stammdaten */}
        <section className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="label">Betriebsname</div>
            <input className="input" value={s.businessName}
              onChange={e=>setS({...s, businessName:e.target.value, emailFromName:e.target.value})}/>
          </div>
          <div>
            <div className="label">Absender-E-Mail</div>
            <input className="input" value={s.emailFromAddress}
              onChange={e=>setS({...s, emailFromAddress:e.target.value})}/>
          </div>
          <div>
            <div className="label">SMS-Absender</div>
            <input className="input" value={s.smsFrom}
              onChange={e=>setS({...s, smsFrom:e.target.value})}/>
          </div>
          <div>
            <div className="label">Slot (Minuten)</div>
            <input className="input" type="number" value={s.slotMinutes}
              onChange={e=>setS({...s, slotMinutes: parseInt(e.target.value || '15')})}/>
          </div>
        </section>

        {/* Öffnungszeiten */}
        <section className="grid gap-2">
          <div className="font-medium">Öffnungszeiten</div>
          {Object.entries(s.opening).map(([idx, h])=> (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-32">{days[parseInt(idx)]}</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={h.active}
                  onChange={e=>setS({...s, opening:{...s.opening, [idx]:{...h, active:e.target.checked}}})}/>
                aktiv
              </label>
              <input className="input w-32" value={h.start}
                onChange={e=>setS({...s, opening:{...s.opening, [idx]:{...h, start:e.target.value}}})}/>
              <span>–</span>
              <input className="input w-32" value={h.end}
                onChange={e=>setS({...s, opening:{...s.opening, [idx]:{...h, end:e.target.value}}})}/>
            </div>
          ))}
        </section>

        {/* Feiertage */}
        <section className="grid gap-3">
          <div className="font-medium">Feiertage / geschlossen</div>
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <div className="label">Von</div>
              <input className="input" type="date" value={rangeFrom} onChange={e=>setRangeFrom(e.target.value)} />
            </div>
            <div>
              <div className="label">Bis</div>
              <input className="input" type="date" value={rangeTo} onChange={e=>setRangeTo(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button className="btn btn-primary" onClick={addHolidayRange} disabled={!rangeFrom || !rangeTo}>Zeitraum hinzufügen</button>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="label">Gesperrte Zeiträume</div>
            {ranges.length === 0 && <div className="text-sm opacity-70">Keine Einträge.</div>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {ranges.map(r => (
                <div key={`${r.from}_${r.to}`} className="flex items-center justify-between p-2 rounded-xl border dark:border-gray-700">
                  <span>{r.from} — {r.to}</span>
                  <button className="btn" onClick={()=>removeRange(r)}>Entfernen</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Öffentlicher Link + QR */}
        <section className="grid gap-2">
          <div className="font-medium">Öffentlicher Buchungslink</div>
          <div className="grid md:grid-cols-3 gap-3 items-start">
            <input className="input md:col-span-2" value={publicUrl} readOnly />
            <div className="flex gap-2">
              <button className="btn" onClick={copyLink}>Link kopieren</button>
              <a className="btn" href={publicUrl} target="_blank">Öffnen</a>
            </div>
          </div>
          <div className="mt-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 rounded-xl border dark:border-gray-700" />
            ) : (
              <div className="text-sm opacity-70">QR optional – wird nur im Browser generiert.</div>
            )}
          </div>
        </section>

        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Speichern…' : 'Speichern'}</button>
        </div>
      </div>
    </div>
  )
}
