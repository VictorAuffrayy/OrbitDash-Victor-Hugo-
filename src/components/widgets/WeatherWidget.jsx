import { useState, useEffect } from 'react'
import { WidgetShell } from './WidgetShell'
import { Spinner } from '../ui/Badge'
import { weatherService } from '../../services/weatherService'
import styles from './WeatherWidget.module.css'

function useWeather(config) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    weatherService.getCurrent(config.latitude, config.longitude)
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [config.latitude, config.longitude])

  return { data, loading, error }
}

function WeatherGrid({ widget }) {
  const { data, loading } = useWeather(widget.config)
  if (loading) return <div className={styles.center}><Spinner size={28} /></div>
  if (!data) return null
  return (
    <div className={styles.gridView}>
      <div className={styles.gridMain}>
        <span className={styles.gridIcon}>{data.wmo.icon}</span>
        <div>
          <div className={styles.gridTemp}>{data.temperature}°C</div>
          <div className={styles.gridCity}>{widget.config.city}</div>
        </div>
      </div>
      <div className={styles.gridCondition}>{data.wmo.label}</div>
      <div className={styles.gridStats}>
        <span>💧 {data.humidity}%</span>
        <span>💨 {data.windSpeed} km/h</span>
        <span>🌡️ {data.feelsLike}°C</span>
      </div>
    </div>
  )
}

function WeatherFocus({ widget }) {
  const { data, loading } = useWeather(widget.config)
  if (loading) return <div className={styles.center}><Spinner size={36} /></div>
  if (!data) return null

  const today = data.daily[0]
  return (
    <div className={styles.focusView}>
      <div className={styles.focusHero}>
        <span className={styles.focusIcon}>{data.wmo.icon}</span>
        <div>
          <div className={styles.focusTemp}>{data.temperature}°C</div>
          <div className={styles.focusDesc}>{data.wmo.label} · Ressenti {data.feelsLike}°C</div>
          <div className={styles.focusCity}>{widget.config.city}</div>
        </div>
      </div>
      <div className={styles.statsRow}>
        <div className={styles.stat}><span className={styles.statIcon}>💧</span><div><div className={styles.statVal}>{data.humidity}%</div><div className={styles.statLabel}>Humidité</div></div></div>
        <div className={styles.stat}><span className={styles.statIcon}>💨</span><div><div className={styles.statVal}>{data.windSpeed} km/h</div><div className={styles.statLabel}>Vent</div></div></div>
        <div className={styles.stat}><span className={styles.statIcon}>📈</span><div><div className={styles.statVal}>{today?.max}° / {today?.min}°</div><div className={styles.statLabel}>Min / Max</div></div></div>
      </div>
      <div className={styles.sectionTitle}>Prévisions 7 jours</div>
      <div className={styles.daily}>
        {data.daily.map((d, i) => (
          <div key={d.date} className={[styles.dayRow, i === 0 ? styles.today : ''].join(' ')}>
            <span className={styles.dayName}>{i === 0 ? "Auj." : d.day}</span>
            <span className={styles.dayIcon}>{d.wmo.icon}</span>
            <span className={styles.dayRain}>{d.rain > 0 ? `${d.rain}%` : '—'}</span>
            <div className={styles.tempRange}>
              <span className={styles.tempMin}>{d.min}°</span>
              <span className={styles.tempMax}>{d.max}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherFullscreen({ widget }) {
  const { data, loading } = useWeather(widget.config)
  if (loading) return <div className={styles.center}><Spinner size={48} /></div>
  if (!data) return null

  return (
    <div className={styles.fullscreenView}>
      <div className={styles.fsLeft}>
        <div className={styles.fsIconBig}>{data.wmo.icon}</div>
        <div className={styles.fsTempBig}>{data.temperature}°C</div>
        <div className={styles.fsDesc}>{data.wmo.label}</div>
        <div className={styles.fsCity}>{widget.config.city}</div>
        <div className={styles.fsMetaGrid}>
          <div className={styles.fsMeta}><span>💧</span><span>{data.humidity}%</span><small>Humidité</small></div>
          <div className={styles.fsMeta}><span>💨</span><span>{data.windSpeed}</span><small>km/h</small></div>
          <div className={styles.fsMeta}><span>🌡️</span><span>{data.feelsLike}°C</span><small>Ressenti</small></div>
        </div>
      </div>
      <div className={styles.fsRight}>
        <h3 className={styles.fsSection}>Prévisions 7 jours</h3>
        <div className={styles.fsDailyGrid}>
          {data.daily.map((d, i) => (
            <div key={d.date} className={[styles.fsDayCard, i === 0 ? styles.fsToday : ''].join(' ')}>
              <div className={styles.fsDayName}>{i === 0 ? 'Auj.' : d.day}</div>
              <div className={styles.fsDayIcon}>{d.wmo.icon}</div>
              <div className={styles.fsDayMax}>{d.max}°</div>
              <div className={styles.fsDayMin}>{d.min}°</div>
              {d.rain > 0 && <div className={styles.fsDayRain}>💧{d.rain}%</div>}
            </div>
          ))}
        </div>
        <h3 className={styles.fsSection}>Températures / 24h</h3>
        <div className={styles.hourlyChart}>
          {data.hourly.slice(0, 12).map((h, i) => {
            const temps = data.hourly.slice(0, 12).map(x => x.temp)
            const min = Math.min(...temps)
            const max = Math.max(...temps)
            const pct = max === min ? 50 : ((h.temp - min) / (max - min)) * 80 + 10
            return (
              <div key={i} className={styles.hourBar}>
                <span className={styles.hourTemp}>{h.temp}°</span>
                <div className={styles.hourTrack}>
                  <div className={styles.hourFill} style={{ height: `${pct}%` }} />
                </div>
                <span className={styles.hourTime}>{h.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function WeatherWidget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid' && <WeatherGrid widget={widget} />}
      {mode === 'focus' && <WeatherFocus widget={widget} />}
      {mode === 'fullscreen' && <WeatherFullscreen widget={widget} />}
    </WidgetShell>
  )
}