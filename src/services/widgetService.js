const BASE = '/api/widgets'

export const widgetService = {
  getAll: async () => {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error('Failed to fetch widgets')
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${BASE}/${id}`)
    if (!res.ok) throw new Error(`Widget ${id} not found`)
    return res.json()
  },

  update: async (id, patch) => {
    const current = await widgetService.getById(id)
    const merged = deepMerge(current, patch)
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    })
    if (!res.ok) throw new Error('Failed to update widget')
    return res.json()
  }
}

function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}