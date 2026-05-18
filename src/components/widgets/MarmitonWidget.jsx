import { useState, useEffect } from 'react'
import { RefreshCw, ChefHat } from 'lucide-react'
import { WidgetShell } from './WidgetShell'
import { Spinner } from '../ui/Badge'
import { Button } from '../ui/Button'
import { mealService } from '../../services/mealService'
import styles from './MarmitonWidget.module.css'

function useMeal(defaultDish) {
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async (query) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mealService.getAndParse(query)
      if (!result) throw new Error('Aucune recette trouvée')
      setMeal(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(defaultDish || 'poulet') }, [defaultDish])

  return { meal, loading, error, reload: load }
}

// ── Grid ──────────────────────────────────────────────────────────────────────

function MarmitonGrid({ widget }) {
  const { meal, loading } = useMeal(widget.config.defaultDish)
  if (loading) return <div className={styles.center}><Spinner size={28} /></div>
  if (!meal) return <div className={styles.error}>Recette introuvable</div>
  return (
    <div className={styles.gridView}>
      <div className={styles.gridImg}>
        <img src={meal.image} alt={meal.name} className={styles.gridPhoto} />
        <div className={styles.gridOverlay}>
          <span className={styles.gridArea}>Cuisine {meal.area}</span>
        </div>
      </div>
      <div className={styles.gridName}>{meal.name}</div>
      <div className={styles.gridMeta}>
        <span className={styles.categoryTag}>{meal.category}</span>
        <span className={styles.ingredientCount}>{meal.ingredients.length} ingrédients</span>
      </div>
    </div>
  )
}

// ── Focus ─────────────────────────────────────────────────────────────────────

function MarmitonFocus({ widget }) {
  const { meal, loading, error, reload } = useMeal(widget.config.defaultDish)
  const [tab, setTab] = useState('ingredients')

  if (loading) return <div className={styles.center}><Spinner size={36} /></div>
  if (error || !meal) return <div className={styles.error}>Recette introuvable</div>

  return (
    <div className={styles.focusView}>
      <div className={styles.focusHero}>
        <img src={meal.image} alt={meal.name} className={styles.focusImg} />
        <div className={styles.focusInfo}>
          <h3 className={styles.focusName}>{meal.name}</h3>
          <div className={styles.focusMeta}>
            <span className={styles.metaTag}>Cuisine {meal.area}</span>
            <span className={styles.metaTag}>{meal.category}</span>
          </div>
          {meal.tags.length > 0 && (
            <div className={styles.tags}>
              {meal.tags.slice(0, 3).map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
          <button className={styles.randomBtn} onClick={() => reload('random')}>
            <RefreshCw size={11} /> Autre recette
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={[styles.tab, tab === 'ingredients' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('ingredients')}
        >
          🧂 Ingrédients ({meal.ingredients.length})
        </button>
        <button
          className={[styles.tab, tab === 'steps' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('steps')}
        >
          👨‍🍳 Préparation
        </button>
      </div>

      {tab === 'ingredients' ? (
        <div className={styles.ingredientGrid}>
          {meal.ingredients.map((ing, i) => (
            <div key={i} className={styles.ingredient}>
              <span className={styles.ingName}>{ing.name}</span>
              {ing.measure && <span className={styles.ingMeasure}>{ing.measure}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.stepsList}>
          {meal.instructions.map((step, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <p className={styles.stepText}>{step}</p>
            </div>
          ))}
        </div>
      )}

      {meal.youtube && (
        <a href={meal.youtube} target="_blank" rel="noreferrer" className={styles.ytLink}>
          ▶ Voir la vidéo YouTube
        </a>
      )}
    </div>
  )
}

// ── Fullscreen ────────────────────────────────────────────────────────────────

function MarmitonFullscreen({ widget }) {
  const { meal, loading, error, reload } = useMeal(widget.config.defaultDish)
  const [tab, setTab] = useState('ingredients')

  if (loading) return <div className={styles.center}><Spinner size={48} /></div>
  if (error || !meal) return <div className={styles.error}>Recette introuvable</div>

  return (
    <div className={styles.fullscreenView}>
      <div className={styles.fsLeft}>
        <img src={meal.image} alt={meal.name} className={styles.fsPhoto} />
        <div className={styles.fsInfo}>
          <h1 className={styles.fsName}>{meal.name}</h1>
          <div className={styles.fsMeta}>
            <span className={styles.metaTag}><ChefHat size={11} /> Cuisine {meal.area}</span>
            <span className={styles.metaTag}>{meal.category}</span>
          </div>
          {meal.tags.length > 0 && (
            <div className={styles.tags}>
              {meal.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => reload('random')}>
            Recette aléatoire
          </Button>
          {meal.youtube && (
            <a href={meal.youtube} target="_blank" rel="noreferrer" className={styles.ytLink}>
              ▶ Voir sur YouTube
            </a>
          )}
        </div>
      </div>

      <div className={styles.fsRight}>
        <div className={styles.tabs}>
          <button
            className={[styles.tab, tab === 'ingredients' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('ingredients')}
          >
            🧂 Ingrédients
          </button>
          <button
            className={[styles.tab, tab === 'steps' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('steps')}
          >
            👨‍🍳 Préparation
          </button>
        </div>

        {tab === 'ingredients' ? (
          <div className={styles.ingredientGrid}>
            {meal.ingredients.map((ing, i) => (
              <div key={i} className={styles.ingredient}>
                <span className={styles.ingName}>{ing.name}</span>
                {ing.measure && <span className={styles.ingMeasure}>{ing.measure}</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.stepsList}>
            {meal.instructions.map((step, i) => (
              <div key={i} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <p className={styles.stepText}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function MarmitonWidget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid'       && <MarmitonGrid widget={widget} />}
      {mode === 'focus'      && <MarmitonFocus widget={widget} />}
      {mode === 'fullscreen' && <MarmitonFullscreen widget={widget} />}
    </WidgetShell>
  )
}