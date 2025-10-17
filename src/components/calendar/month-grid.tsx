'use client'
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { de } from 'date-fns/locale'
import clsx from 'clsx'
import { useMemo } from 'react'

type DayCounts = { pending: number; fixed: number }
type Props = {
  value: Date
  onChange: (d: Date) => void
  counts: Record<string, DayCounts> // key = 'YYYY-MM-DD'
  onPrev: () => void
  onNext: () => void
}

export default function MonthGrid({ value, onChange, counts, onPrev, onNext }: Props) {
  const monthStart = startOfMonth(value)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart, { locale: de })
  const gridEnd = endOfWeek(monthEnd, { locale: de })

  const days = useMemo(() => {
    const arr: Date[] = []
    let d = gridStart
    while (d <= gridEnd) {
      arr.push(d)
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    }
    return arr
  }, [gridStart.getTime(), gridEnd.getTime()])

  const header = ['So','Mo','Di','Mi','Do','Fr','Sa']

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <button className="btn" onClick={onPrev}>‹</button>
        <div className="font-semibold">{format(monthStart, 'LLLL yyyy', { locale: de })}</div>
        <button className="btn" onClick={onNext}>›</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm mb-2 opacity-70">
        {header.map(h => <div key={h} className="text-center">{h}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          const c = counts[key]
          const inMonth = isSameMonth(d, monthStart)
          const active = isSameDay(d, value)
          return (
            <button
              key={key}
              onClick={() => onChange(d)}
              className={clsx(
                'rounded-2xl p-2 border text-left min-h-[72px]',
                'hover:bg-gray-100 dark:hover:bg-slate-800 transition',
                inMonth ? 'border-gray-200 dark:border-gray-700' : 'border-transparent opacity-40',
                active && 'ring-2 ring-blue-500',
                isToday(d) && 'outline outline-1 outline-blue-300/50'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm">{format(d, 'd')}</div>
              </div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {c?.fixed ? <span className="badge bg-green-600/20 text-green-700 dark:text-green-300">fix {c.fixed}</span> : null}
                {c?.pending ? <span className="badge bg-amber-600/20 text-amber-700 dark:text-amber-300">ausst. {c.pending}</span> : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
