import { addMinutes, format, isBefore, parse, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export function dateKey(d: Date){ return format(d, 'yyyy-MM-dd') }
export function timeKey(d: Date){ return format(d, 'HH:mm') }

export function slotsForDay(dateISO: string, startHHMM: string, endHHMM: string, stepMinutes: number){
  const base = parseISO(dateISO + 'T00:00:00')
  const start = parse(startHHMM, 'HH:mm', base)
  const end = parse(endHHMM, 'HH:mm', base)
  const out: string[] = []
  for(let t = start; isBefore(t, end) || format(t,'HH:mm')===format(end,'HH:mm'); t = addMinutes(t, stepMinutes)){
    if (isBefore(t, end)) out.push(format(t, 'HH:mm', {locale: de}))
  }
  return out
}

export function overlaps(startA: Date, endA: Date, startB: Date, endB: Date){
  return startA < endB && startB < endA
}
