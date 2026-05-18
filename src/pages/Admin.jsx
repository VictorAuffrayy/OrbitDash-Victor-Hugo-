import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWidgetStore } from '../stores/widgetStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import styles from './Admin.module.css'

// ── Poll editor ───────────────────────────────────────────────────────────────

function PollEditor({ widget }) {
  const { updateWidgetConfig } = useWidgetStore()
  const [config, setConfig] = useState(widget.config)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await updateWidgetConfig(widget.id, config)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateOption = (id, label) => {
    setConfig(c => ({ ...c, options: c.options.map(o => o.id === id ? { ...o, label } : o) }))
  }
  const addOption = () => {
    setConfig(c => ({ ...c, options: [...c.options, { id: `opt-${Date.now()}`, label: 'Nouvelle option', votes: 0 }] }))
  }
  const removeOption = (id) => {
    setConfig(c => ({ ...c, options: c.options.filter(o => o.id !== id) }))
  }
  const resetVotes = () => {
    setConfig(c => ({ ...c, options: c.options.map(o => ({ ...o, votes: 0 })) }))
  }

  return (
    <div className={styles.editor}>
      <Input
        label="Question du sondage"
        value={config.question}
        onChange={e => setConfig(c => ({ ...c, question: e.target.value }))}
      />
      <div>
        <div className={styles.fieldLabel}>Options</div>
        <div className={styles.optionList}>
          {config.options.map(o => (
            <div key={o.id} className={styles.optionRow}>
              <Input
                value={o.label}
                onChange={e => updateOption(o.id, e.target.value)}
                className={styles.flex1}
              />
              <span className={styles.voteCount}>{o.votes} votes</span>
              <button className={styles.removeBtn} onClick={() => removeOption(o.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className={styles.optionActions}>
          <Button variant="secondary" size="sm" icon={Plus} onClick={addOption}>Ajouter option</Button>
          <Button variant="ghost" size="sm" onClick={resetVotes}>Réinitialiser votes</Button>
        </div>
      </div>
      <div className={styles.saveRow}>
        <Button onClick={save} loading={saving} icon={Save}>
          {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}

// ── Weather editor ────────────────────────────────────────────────────────────

function WeatherEditor({ widget }) {
  const { updateWidgetConfig } = useWidgetStore()
  const [city, setCity] = useState(widget.config.city)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const save = async () => {
    if (!city.trim()) { setError('Entrez une ville'); return }
    setSaving(true)
    setError(null)
    try {
      const { weatherService } = await import('../services/weatherService')
      const geo = await weatherService.geocode(city)
      await updateWidgetConfig(widget.id, {
        city: geo.name,
        latitude: geo.latitude,
        longitude: geo.longitude
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.editor}>
      <Input
        label="Ville"
        value={city}
        onChange={e => { setCity(e.target.value); setError(null) }}
        placeholder="ex: Lyon, Bordeaux, Tokyo…"
        hint="La géolocalisation se fera automatiquement"
        error={error}
      />
      <div className={styles.saveRow}>
        <Button onClick={save} loading={saving} icon={Save}>
          {saved ? '✓ Sauvegardé !' : 'Changer la ville'}
        </Button>
      </div>
    </div>
  )
}

// ── Crypto editor ─────────────────────────────────────────────────────────────

const AVAILABLE_COINS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin', 'ripple']

function CryptoEditor({ widget }) {
  const { updateWidgetConfig } = useWidgetStore()
  const [coins, setCoins] = useState(widget.config.coins)
  const [currency, setCurrency] = useState(widget.config.currency)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleCoin = (coin) => {
    setCoins(prev => prev.includes(coin) ? prev.filter(c => c !== coin) : [...prev, coin])
  }

  const save = async () => {
    if (!coins.length) return
    setSaving(true)
    await updateWidgetConfig(widget.id, { coins, currency })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.editor}>
      <div>
        <div className={styles.fieldLabel}>Cryptomonnaies affichées</div>
        <div className={styles.coinGrid}>
          {AVAILABLE_COINS.map(c => (
            <label key={c} className={[styles.coinToggle, coins.includes(c) ? styles.coinActive : ''].join(' ')}>
              <input type="checkbox" checked={coins.includes(c)} onChange={() => toggleCoin(c)} />
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className={styles.fieldLabel}>Devise</div>
        <div className={styles.radioGroup}>
          {['eur', 'usd'].map(cur => (
            <label key={cur} className={[styles.radioOption, currency === cur ? styles.radioActive : ''].join(' ')}>
              <input type="radio" name="currency" value={cur} checked={currency === cur} onChange={() => setCurrency(cur)} />
              {cur.toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <div className={styles.saveRow}>
        <Button onClick={save} loading={saving} disabled={!coins.length} icon={Save}>
          {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}

// ── YouTube editor ────────────────────────────────────────────────────────────

function YoutubeEditor({ widget }) {
  const { updateWidgetConfig } = useWidgetStore()
  const [url, setUrl] = useState(widget.config.url || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(null)

  // Détecte le type en temps réel
  useEffect(() => {
    if (!url.trim()) { setPreview(null); return }
    const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)
    if (videoMatch) { setPreview({ type: 'video', id: videoMatch[1] }); return }
    if (url.match(/UC[a-zA-Z0-9_-]{22}/) || url.includes('/channel/')) { setPreview({ type: 'channel' }); return }
    if (url.includes('/@')) { setPreview({ type: 'handle' }); return }
    setPreview({ type: 'unknown' })
  }, [url])

  const save = async () => {
    if (!url.trim()) return
    setSaving(true)
    await updateWidgetConfig(widget.id, { url: url.trim() })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.editor}>
      <Input
        label="URL YouTube (vidéo ou chaîne)"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=... ou https://youtube.com/channel/UC..."
        hint="Accepte : lien vidéo, lien chaîne, @handle, Channel ID (UCxxx), video ID"
      />

      {preview && (
        <div className={styles.previewDetect}>
          {preview.type === 'video' && (
            <>
              <span className={styles.detectBadge} style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.2)' }}>
                ✓ Vidéo détectée
              </span>
              <img
                src={`https://img.youtube.com/vi/${preview.id}/mqdefault.jpg`}
                alt="preview"
                className={styles.thumbPreview}
              />
            </>
          )}
          {preview.type === 'channel' && (
            <span className={styles.detectBadge} style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--sky)', border: '1px solid rgba(56,189,248,0.2)' }}>
              ✓ Chaîne détectée
            </span>
          )}
          {preview.type === 'handle' && (
            <span className={styles.detectBadge} style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--sky)', border: '1px solid rgba(56,189,248,0.2)' }}>
              ✓ Handle @{url.match(/@([a-zA-Z0-9_.-]+)/)?.[1]} détecté
            </span>
          )}
          {preview.type === 'unknown' && url.length > 5 && (
            <span className={styles.detectBadge} style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--rose)', border: '1px solid rgba(244,63,94,0.2)' }}>
              ✗ URL non reconnue
            </span>
          )}
        </div>
      )}

      <div className={styles.infoBox}>
        <p className={styles.infoText}>Formats acceptés :</p>
        <div className={styles.examples}>
          <code className={styles.code}>https://youtube.com/watch?v=dQw4w9WgXcQ</code>
          <code className={styles.code}>https://youtu.be/dQw4w9WgXcQ</code>
          <code className={styles.code}>https://youtube.com/channel/UCxxxxxxx</code>
          <code className={styles.code}>https://youtube.com/@NomDeLaChaine</code>
        </div>
      </div>

      <div className={styles.saveRow}>
        <Button onClick={save} loading={saving} disabled={!url.trim() || preview?.type === 'unknown'} icon={Save}>
          {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}

// ── Marmiton editor ───────────────────────────────────────────────────────────

const DISH_SUGGESTIONS = [
  'pasta', 'chicken', 'sushi', 'pizza', 'beef', 'salmon',
  'soup', 'salad', 'cake', 'pancakes', 'tacos', 'curry'
]

function MarmitonEditor({ widget }) {
  const { updateWidgetConfig } = useWidgetStore()
  const [dish, setDish] = useState(widget.config.defaultDish || 'poulet')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    if (!dish.trim()) return
    setSaving(true)
    await updateWidgetConfig(widget.id, { defaultDish: dish.trim().toLowerCase() })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.editor}>
      <Input
        label="Plat par défaut (en français)"
        value={dish}
        onChange={e => setDish(e.target.value)}
        placeholder="ex: poulet, pâtes, saumon, chocolat..."
        hint="Tapez en français — la traduction est automatique"
      />
      <div>
        <div className={styles.fieldLabel}>Suggestions rapides</div>
        <div className={styles.coinGrid}>
          {['poulet','pates','saumon','boeuf','curry','pizza','soupe','chocolat','agneau','crepes','tacos','champignons'].map(d => (
            <button
              key={d}
              className={[styles.coinToggle, dish === d ? styles.coinActive : ''].join(' ')}
              onClick={() => setDish(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.saveRow}>
        <Button onClick={save} loading={saving} disabled={!dish.trim()} icon={Save}>
          {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}
// ── Registry ──────────────────────────────────────────────────────────────────

const EDITORS = {
  poll:     PollEditor,
  weather:  WeatherEditor,
  crypto:   CryptoEditor,
  youtube:  YoutubeEditor,
  marmiton: MarmitonEditor,
}

const TYPE_LABELS = {
  poll:     'Sondage',
  weather:  'Météo',
  crypto:   'Crypto',
  youtube:  'YouTube',
  morpion:  'Morpion',
  marmiton: 'Recettes',
  game2048: '2048',
}

// ── Widget admin card ─────────────────────────────────────────────────────────

function WidgetAdminCard({ widget }) {
  const [open, setOpen] = useState(false)
  const Editor = EDITORS[widget.type]

  return (
    <Card className={styles.adminCard}>
      <CardHeader>
        <div className={styles.cardTitle}>
          <span className={styles.widgetType}>{TYPE_LABELS[widget.type] || widget.type}</span>
          <span className={styles.widgetName}>{widget.title}</span>
          {!Editor && (
            <span className={styles.noEditorBadge}>Pas de config</span>
          )}
        </div>
        <button
          className={styles.expandBtn}
          onClick={() => setOpen(o => !o)}
          disabled={!Editor}
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </CardHeader>
      {open && Editor && (
        <CardBody>
          <Editor widget={widget} />
        </CardBody>
      )}
    </Card>
  )
}

// ── Admin page ────────────────────────────────────────────────────────────────

export default function Admin() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const { widgets, fetchWidgets } = useWidgetStore()

  useEffect(() => {
    if (!isAdmin) navigate('/')
    else fetchWidgets()
  }, [isAdmin])

  if (!isAdmin) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Administration</h1>
        <p className={styles.subtitle}>
          Gérez le contenu des widgets. Les modifications s'appliquent immédiatement sur le dashboard.
        </p>
      </div>
      <div className={styles.list}>
        {widgets.map(w => (
          <WidgetAdminCard key={w.id} widget={w} />
        ))}
      </div>
    </div>
  )
}