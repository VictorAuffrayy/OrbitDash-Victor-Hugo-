import { useEffect } from 'react'
import { X, Minimize2 } from 'lucide-react'
import { useFocus } from '../../contexts/FocusContext'
import { WidgetRenderer } from '../widgets/WidgetRenderer'
import styles from './FullscreenOverlay.module.css'

export function FullscreenOverlay() {
  const { focusedWidget, isFullscreen, exitFullscreen, unfocus } = useFocus()

  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e) => { if (e.key === 'Escape') exitFullscreen() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFullscreen, exitFullscreen])

  if (!isFullscreen || !focusedWidget) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.bar}>
        <span className={styles.title}>{focusedWidget.title}</span>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={exitFullscreen} title="Réduire (Échap)">
            <Minimize2 size={16} />
          </button>
          <button className={styles.btn} onClick={unfocus} title="Fermer">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <WidgetRenderer widget={focusedWidget} mode="fullscreen" />
      </div>
    </div>
  )
}