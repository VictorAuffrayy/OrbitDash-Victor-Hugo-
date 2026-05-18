import { useState } from 'react'
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
import { GripVertical } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useWidgetStore } from '../../stores/widgetStore'
import { WidgetRenderer } from '../widgets/WidgetRenderer'
import styles from './WidgetGrid.module.css'

function SortableWidgetCard({ widget, isAdminMode, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[styles.cell, isOver && isAdminMode ? styles.dropTarget : ''].join(' ')}
    >
      {isAdminMode && (
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <GripVertical size={16} />
        </div>
      )}
      <WidgetRenderer widget={widget} mode="grid" />
    </div>
  )
}

export function WidgetGrid() {
  const { isAdmin } = useAuth()
  const { widgets, swapPositions } = useWidgetStore()
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const activeWidget = widgets.find(w => w.id === activeId)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    swapPositions(active.id, over.id)
  }

  if (!isAdmin) {
    return (
      <div className={styles.grid}>
        {widgets.map(w => (
          <div key={w.id} className={styles.cell}>
            <WidgetRenderer widget={w} mode="grid" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className={[styles.grid, styles.adminGrid].join(' ')}>
        {widgets.map(w => (
          <SortableWidgetCard
            key={w.id}
            widget={w}
            isAdminMode={isAdmin}
            isDragging={activeId === w.id}
          />
        ))}
      </div>
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