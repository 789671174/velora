import Link from 'next/link'
export default function Page() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Willkommen</h1>
      <p>Wähle eine Ansicht:</p>
      <div className="flex gap-3">
        <Link className="btn btn-primary" href="/client">Kundenseite</Link>
        <Link className="btn" href="/entrepreneur">Unternehmer</Link>
      </div>
    </div>
  )
}
