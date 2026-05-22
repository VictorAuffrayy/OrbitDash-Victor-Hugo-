import { Maximize2 } from 'lucide-react'
import { useFocus } from '../../contexts/FocusContext'
import styles from './WidgetShell.module.css'

export function WidgetShell({ widget, mode, children, onFullscreen }) {
  const { focusWidget } = useFocus()

  const handleClick = () => {
    if (mode === 'grid' && widget.focusable) {
      focusWidget(widget)
    }
  }

  return (
    <div
      className={[
        styles.shell,
        styles[mode],
        widget.focusable && mode === 'grid' ? styles.focusable : ''
      ].join(' ')}
      onClick={mode === 'grid' ? handleClick : undefined}
    >
      <div className={styles.header}>
        <span className={styles.title}>{widget.title}</span>
        <div className={styles.actions} onClick={e => e.stopPropagation()}>
          {mode === 'focus' && onFullscreen && (
            <button className={styles.iconBtn} onClick={onFullscreen} title="Plein écran">
              <Maximize2 size={15} />
            </button>
          )}
          {mode === 'grid' && widget.focusable && (
            <span className={styles.focusBadge}>↗</span>
          )}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}