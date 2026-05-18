import { createContext, useContext, useState, useCallback } from 'react'

const FocusContext = createContext(null)

export function FocusProvider({ children }) {
  const [focusedWidget, setFocusedWidget] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const focusWidget = useCallback((widget) => {
    if (!widget?.focusable) return
    setFocusedWidget(widget)
    setIsFullscreen(false)
  }, [])

  const unfocus = useCallback(() => {
    setFocusedWidget(null)
    setIsFullscreen(false)
  }, [])

  const enterFullscreen = useCallback(() => {
    if (focusedWidget) setIsFullscreen(true)
  }, [focusedWidget])

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false)
  }, [])

  return (
    <FocusContext.Provider value={{
      focusedWidget,
      isFullscreen,
      focusWidget,
      unfocus,
      enterFullscreen,
      exitFullscreen
    }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocus must be used inside FocusProvider')
  return ctx
}