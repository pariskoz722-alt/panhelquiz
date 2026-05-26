'use client'
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const ThemeContext = createContext({
  dark: false,
  toggleDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  // Reads data-theme set by the inline <script> — runs before first paint
  useIsomorphicLayoutEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
  }, [])

  const toggleDark = () => {
    setDark(prev => {
      const next = !prev
      const t = next ? 'dark' : 'light'
      localStorage.setItem('panhelquiz-theme', t)
      document.documentElement.dataset.theme = t
      document.documentElement.style.colorScheme = t
      return next
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
