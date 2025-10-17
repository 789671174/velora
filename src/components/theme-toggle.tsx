'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme') === 'dark'
    const useDark = saved || (!localStorage.getItem('theme') && m)
    document.documentElement.classList.toggle('dark', useDark)
    setDark(useDark)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return (
    <button className="btn" onClick={() => setDark(d => !d)}>{dark ? 'Dark' : 'Light'}</button>
  )
}
