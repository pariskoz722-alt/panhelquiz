'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  dark: false,
  toggleDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('panhelquiz-theme')
    if (saved === 'dark') setDark(true)
  }, [])

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