import { create } from 'zustand'
import { widgetService } from '../services/widgetService'

export const useWidgetStore = create((set, get) => ({
  widgets: [],
  loading: false,
  error: null,

  fetchWidgets: async () => {
    set({ loading: true, error: null })
    try {
      const widgets = await widgetService.getAll()
      set({ widgets: widgets.sort((a, b) => a.position - b.position), loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  updateWidget: async (id, patch) => {
    const prev = get().widgets
    set({ widgets: prev.map(w => w.id === id ? { ...w, ...patch } : w) })
    try {
      await widgetService.update(id, patch)
    } catch (e) {
      set({ widgets: prev, error: e.message })
    }
  },

  swapPositions: async (idA, idB) => {
    const widgets = get().widgets
    const a = widgets.find(w => w.id === idA)
    const b = widgets.find(w => w.id === idB)
    if (!a || !b) return

    const updated = widgets.map(w => {
      if (w.id === idA) return { ...w, position: b.position }
      if (w.id === idB) return { ...w, position: a.position }
      return w
    }).sort((x, y) => x.position - y.position)

    set({ widgets: updated })
    await Promise.all([
      widgetService.update(idA, { position: b.position }),
      widgetService.update(idB, { position: a.position })
    ])
  },

  updateWidgetConfig: async (id, configPatch) => {
    const widget = get().widgets.find(w => w.id === id)
    if (!widget) return
    const newConfig = { ...widget.config, ...configPatch }
    await get().updateWidget(id, { config: newConfig })
  }
}))