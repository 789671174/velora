'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'

export default function EntrepreneurSettings() {
  const [publicUrl, setPublicUrl] = useState<string>('')
  const [qrCode, setQrCode] = useState<string>('')
  const [blockedRanges, setBlockedRanges] = useState<{ start: string; end: string }[]>([])
  const [newRange, setNewRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // -------------------------------------------------------------
  // 1️⃣ Öffentliche URL automatisch generieren (Client-sicher)
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      const url = `${base}/client`
      setPublicUrl(url)
    }
  }, [])

  // -------------------------------------------------------------
  // 2️⃣ QR-Code erzeugen
  // -------------------------------------------------------------
  useEffect(() => {
    if (publicUrl) {
      QRCode.toDataURL(publicUrl, { margin: 1, width: 192 })
        .then(setQrCode)
        .catch(console.error)
    }
  }, [publicUrl])

  // -------------------------------------------------------------
  // 3️⃣ Gesperrte Tage verwalten
  // -------------------------------------------------------------
  const addRange = () => {
    if (!newRange.start || !newRange.end) return
    setBlockedRanges([...blockedRanges, { ...newRange }])
    setNewRange({ start: '', end: '' })
  }

  const removeRange = (index: number) => {
    setBlockedRanges(blockedRanges.filter((_, i) => i !== index))
  }

  // -------------------------------------------------------------
  // 4️⃣ Logo Upload mit Vorschau
  // -------------------------------------------------------------
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // -------------------------------------------------------------
  // 5️⃣ Render
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-semibold">Einstellungen</h1>

      {/* LOGO UPLOAD */}
      <section className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg font-medium mb-2">Logo hochladen</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="bg-gray-700 rounded p-2 w-full"
        />
        {logoPreview && (
          <div className="mt-3">
            <Image
              src={logoPreview}
              alt="Logo-Vorschau"
              width={160}
              height={160}
              className="rounded-xl"
            />
          </div>
        )}
      </section>

      {/* GESPERRTE TAGE */}
      <section className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg font-medium mb-2">Gesperrte Tage (von–bis)</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="date"
            value={newRange.start}
            onChange={(e) => setNewRange({ ...newRange, start: e.target.value })}
            className="bg-gray-700 rounded p-2 text-white"
          />
          <input
            type="date"
            value={newRange.end}
            onChange={(e) => setNewRange({ ...newRange, end: e.target.value })}
            className="bg-gray-700 rounded p-2 text-white"
          />
          <button
            onClick={addRange}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
          >
            Hinzufügen
          </button>
        </div>

        {blockedRanges.length === 0 && <p className="text-gray-400">Keine gesperrten Tage eingetragen.</p>}
        {blockedRanges.map((r, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-t border-gray-700 py-2"
          >
            <span>{r.start} — {r.end}</span>
            <button
              onClick={() => removeRange(i)}
              className="text-red-400 hover:text-red-600"
            >
              Entfernen
            </button>
          </div>
        ))}
      </section>

      {/* ÖFFENTLICHER LINK + QR */}
      <section className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg font-medium mb-3">Kundenlink & QR-Code</h2>
        {publicUrl ? (
          <>
            <p className="text-sm break-all">{publicUrl}</p>
            {qrCode && (
              <div className="mt-3">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={192}
                  height={192}
                  className="rounded-lg"
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">Lade Link...</p>
        )}
      </section>
    </div>
  )
}
