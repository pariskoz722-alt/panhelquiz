'use client'
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

// useLayoutEffect runs synchronously before the browser paints — no flash
// useEffect fallback for SSR where window/DOM don't exist
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const ThemeContext = createContext({
  dark: false,
  toggleDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (localStorage.getItem('panhelquiz-theme') === 'dark') setDark(true)
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
