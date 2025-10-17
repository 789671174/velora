import Link from 'next/link'
export default function Layout({ children }: { children: React.ReactNode }){
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Link className="btn" href="/entrepreneur">Dashboard</Link>
        <Link className="btn" href="/entrepreneur/settings">Einstellungen</Link>
      </div>
      {children}
    </div>
  )
}
