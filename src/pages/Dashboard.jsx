import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ShieldCheck } from 'lucide-react'
import { useWidgetStore } from '../stores/widgetStore'
import { useAuth } from '../contexts/AuthContext'
import { FocusZone } from '../components/layout/FocusZone'
import { WidgetRenderer } from '../components/widgets/WidgetRenderer'
import { Spinner } from '../components/ui/Badge'
import styles from './Dashboard.module.css'

// ── Cellule draggable ─────────────────────────────────────────────────────────

function DraggableCell({ widget, isAdmin, isDragging }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isOver
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    height: '100%',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[styles.cell, isOver && isAdmin ? styles.dropTarget : ''].join(' ')}
    >
      {isAdmin && (
        <div className={styles.dragHandle} {...attributes} {...listeners} title="Déplacer">
          <GripVertical size={13} />
        </div>
      )}
      <WidgetRenderer widget={widget} mode="grid" />
    </div>
  )
}

// ── Slot : une case de la grille orbitale ─────────────────────────────────────

function Slot({ widget, isAdmin, activeId }) {
  if (!widget) return <div className={styles.emptySlot} />
  return (
    <DraggableCell
      widget={widget}
      isAdmin={isAdmin}
      isDragging={activeId === widget.id}
    />
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { widgets, loading, fetchWidgets, swapPositions } = useWidgetStore()
  const { isAdmin } = useAuth()
  const [activeId, setActiveId] = useState(null)

  useEffect(() => { fetchWidgets() }, [fetchWidgets])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    swapPositions(active.id, over.id)
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <Spinner size={40} />
        <p>Chargement des widgets…</p>
      </div>
    )
  }

  // Répartition des widgets autour du focus
  const top    = widgets.slice(0, 3)
  const left   = widgets.slice(3, 5)
  const right  = widgets.slice(5, 7)
  const bottom = widgets.slice(7)

  const activeWidget = widgets.find(w => w.id === activeId)

  const content = (
    <div className={styles.page}>
      {isAdmin && (
        <div className={styles.adminBanner}>
          <ShieldCheck size={14} />
          Mode Admin — Glissez <GripVertical size={13} style={{ display: 'inline' }} /> pour réorganiser les widgets
        </div>
      )}

      <div className={styles.orbit}>

        {/* ── Haut ── */}
        <div className={styles.topRow}>
          {top.map(w => (
            <div key={w.id} className={styles.topCell}>
              <Slot widget={w} isAdmin={isAdmin} activeId={activeId} />
            </div>
          ))}
        </div>

        {/* ── Milieu ── */}
        <div className={styles.middleRow}>
          <div className={styles.sideCol}>
            {left.map(w => (
              <div key={w.id} className={styles.sideCell}>
                <Slot widget={w} isAdmin={isAdmin} activeId={activeId} />
              </div>
            ))}
          </div>

          <div className={styles.focusCell}>
            <FocusZone />
          </div>

          <div className={styles.sideCol}>
            {right.map(w => (
              <div key={w.id} className={styles.sideCell}>
                <Slot widget={w} isAdmin={isAdmin} activeId={activeId} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Bas ── */}
        {bottom.length > 0 && (
          <div className={styles.bottomRow}>
            {bottom.map(w => (
              <div key={w.id} className={styles.bottomCell}>
                <Slot widget={w} isAdmin={isAdmin} activeId={activeId} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )

  if (!isAdmin) return content

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {content}
      <DragOverlay>
        {activeWidget && (
          <div className={styles.dragOverlay}>
            <WidgetRenderer widget={activeWidget} mode="grid" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}