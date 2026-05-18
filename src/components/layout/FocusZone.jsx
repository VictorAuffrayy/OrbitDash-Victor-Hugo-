import { X } from 'lucide-react'
import { useFocus } from '../../contexts/FocusContext'
import { WidgetRenderer } from '../widgets/WidgetRenderer'
import styles from './FocusZone.module.css'

export function FocusZone() {
  const { focusedWidget, unfocus, enterFullscreen } = useFocus()

  if (!focusedWidget) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>◎</div>
        <p className={styles.emptyTitle}>Zone de Focus</p>
        <p className={styles.emptyHint}>Cliquez sur un widget pour afficher ses détails ici</p>
      </div>
    )
  }

  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <span className={styles.zoneLabel}>Focus</span>
        <button className={styles.closeBtn} onClick={unfocus}>
          <X size={16} />
        </button>
      </div>
      <div className={styles.zoneBody}>
        <WidgetRenderer widget={focusedWidget} mode="focus" onFullscreen={enterFullscreen} />
      </div>
    </div>
  )
}