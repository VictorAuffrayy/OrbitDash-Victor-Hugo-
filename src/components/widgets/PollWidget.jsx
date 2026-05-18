import { useState } from 'react'
import { WidgetShell } from './WidgetShell'
import { Button } from '../ui/Button'
import { useWidgetStore } from '../../stores/widgetStore'
import styles from './PollWidget.module.css'

function calcTotal(options) {
  return options.reduce((s, o) => s + o.votes, 0)
}

function PollOption({ option, total, selected, voted, onVote }) {
  const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0
  return (
    <div
      className={[styles.option, voted ? styles.voted : '', selected === option.id ? styles.selected : ''].join(' ')}
      onClick={() => !voted && onVote(option.id)}
    >
      <div className={styles.optionTop}>
        <span className={styles.optionLabel}>{option.label}</span>
        {voted && <span className={styles.optionPct}>{pct}%</span>}
      </div>
      {voted && (
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      )}
      {!voted && <div className={styles.check}>{selected === option.id ? '●' : '○'}</div>}
    </div>
  )
}

function MiniChart({ options }) {
  const total = calcTotal(options)
  const winner = options.reduce((a, b) => a.votes > b.votes ? a : b, options[0])
  return (
    <div className={styles.miniChart}>
      {options.map(o => (
        <div key={o.id} className={styles.miniBar} title={`${o.label}: ${o.votes} votes`}>
          <div
            className={[styles.miniBarFill, o.id === winner.id ? styles.miniBarWinner : ''].join(' ')}
            style={{ height: total > 0 ? `${(o.votes / total) * 100}%` : '10%' }}
          />
        </div>
      ))}
    </div>
  )
}

function PollGrid({ widget }) {
  const { config } = widget
  const [selected, setSelected] = useState(null)
  const [voted, setVoted] = useState(false)
  const updateWidgetConfig = useWidgetStore(s => s.updateWidgetConfig)
  const total = calcTotal(config.options)

  const handleVote = async () => {
    if (!selected || voted) return
    const newOptions = config.options.map(o =>
      o.id === selected ? { ...o, votes: o.votes + 1 } : o
    )
    setVoted(true)
    await updateWidgetConfig(widget.id, { options: newOptions })
  }

  return (
    <div className={styles.gridView}>
      <p className={styles.question}>{config.question}</p>
      <div className={styles.miniOptions}>
        {config.options.slice(0, 3).map(o => (
          <label key={o.id} className={styles.miniOption}>
            <input
              type="radio"
              name={`poll-${widget.id}`}
              value={o.id}
              checked={selected === o.id}
              onChange={() => !voted && setSelected(o.id)}
              disabled={voted}
            />
            <span>{o.label}</span>
          </label>
        ))}
        {config.options.length > 3 && <span className={styles.more}>+{config.options.length - 3} autres…</span>}
      </div>
      {!voted
        ? <Button size="sm" onClick={handleVote} disabled={!selected} fullWidth>Voter</Button>
        : <p className={styles.thanks}>✓ Merci pour votre vote !</p>
      }
    </div>
  )
}

function PollFocus({ widget }) {
  const { config } = widget
  const [selected, setSelected] = useState(null)
  const [voted, setVoted] = useState(false)
  const updateWidgetConfig = useWidgetStore(s => s.updateWidgetConfig)
  const total = calcTotal(config.options)

  const handleVote = async () => {
    if (!selected || voted) return
    const newOptions = config.options.map(o =>
      o.id === selected ? { ...o, votes: o.votes + 1 } : o
    )
    setVoted(true)
    await updateWidgetConfig(widget.id, { options: newOptions })
  }

  return (
    <div className={styles.focusView}>
      <h3 className={styles.focusQuestion}>{config.question}</h3>
      <p className={styles.totalVotes}>{total} votes au total</p>
      <div className={styles.options}>
        {config.options.map(o => (
          <PollOption key={o.id} option={o} total={total} selected={selected} voted={voted} onVote={setSelected} />
        ))}
      </div>
      {!voted
        ? <Button onClick={handleVote} disabled={!selected} fullWidth>Voter maintenant</Button>
        : <p className={styles.thanks}>✓ Vote enregistré !</p>
      }
      {config.pastPolls?.length > 0 && (
        <div className={styles.pastSection}>
          <h4 className={styles.pastTitle}>Sondages récents</h4>
          {config.pastPolls.map(past => {
            const t = calcTotal(past.options)
            return (
              <div key={past.id} className={styles.pastPoll}>
                <p className={styles.pastQuestion}>{past.question}</p>
                <div className={styles.pastBars}>
                  {past.options.map(o => (
                    <div key={o.id} className={styles.pastBar}>
                      <span className={styles.pastLabel}>{o.label}</span>
                      <div className={styles.pastTrack}>
                        <div className={styles.pastFill} style={{ width: t > 0 ? `${(o.votes / t) * 100}%` : '0%' }} />
                      </div>
                      <span className={styles.pastPct}>{t > 0 ? Math.round((o.votes / t) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PollFullscreen({ widget }) {
  const { config } = widget
  return (
    <div className={styles.fullscreenView}>
      <h1 className={styles.fsTitle}>Sondages OrbitDash</h1>
      <div className={styles.fsGrid}>
        <div className={styles.fsMain}>
          <h2 className={styles.fsQuestion}>{config.question}</h2>
          <MiniChart options={config.options} />
          <div className={styles.fsLegend}>
            {config.options.map(o => (
              <div key={o.id} className={styles.fsLegendItem}>
                <span className={styles.fsDot} />
                <span>{o.label}</span>
                <span className={styles.fsVotes}>{o.votes} votes</span>
              </div>
            ))}
          </div>
        </div>
        {config.pastPolls?.map(past => (
          <div key={past.id} className={styles.fsPast}>
            <h3 className={styles.fsPastQ}>{past.question}</h3>
            <MiniChart options={past.options} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PollWidget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid' && <PollGrid widget={widget} />}
      {mode === 'focus' && <PollFocus widget={widget} />}
      {mode === 'fullscreen' && <PollFullscreen widget={widget} />}
    </WidgetShell>
  )
}