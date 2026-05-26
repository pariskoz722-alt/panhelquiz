'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  dark: false,
  toggleDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  const [ready, setReady] = useState(false)

  // Step 1: read localStorage and batch both updates in one render
  useEffect(() => {
    const saved = localStorage.getItem('panhelquiz-theme')
    if (saved === 'dark') setDark(true)
    setReady(true) // React 18 batches this with setDark → single re-render
  }, [])

  // Step 2: runs AFTER the re-render with the correct dark value
  useEffect(() => {
    if (ready) {
      document.documentElement.style.visibility = 'visible'
    }
  }, [ready, dark])

  const toggleDark = () => {
    setDark(prev => {
      localStorage.setItem('panhelquiz-theme', !prev ? 'dark' : 'light')
      return !prev
    })
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
