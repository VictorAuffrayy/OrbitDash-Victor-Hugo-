import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { WidgetShell } from './WidgetShell'
import { Spinner } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cryptoService } from '../../services/cryptoService'
import styles from './CryptoWidget.module.css'

function useCrypto(coins, currency) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await cryptoService.getPrices(coins, currency)
      setData(result)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [coins.join(','), currency])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, lastUpdate, refresh }
}

function ChangeTag({ value }) {
  const positive = value >= 0
  return (
    <span className={[styles.change, positive ? styles.positive : styles.negative].join(' ')}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function CryptoGrid({ widget }) {
  const { data, loading } = useCrypto(widget.config.coins, widget.config.currency)
  if (loading) return <div className={styles.center}><Spinner size={28} /></div>
  return (
    <div className={styles.gridView}>
      {data.map(coin => (
        <div key={coin.id} className={styles.gridRow}>
          <div className={styles.coinDot} style={{ background: coin.color }} />
          <span className={styles.gridSymbol}>{coin.symbol}</span>
          <span className={styles.gridPrice}>{cryptoService.formatPrice(coin.price, coin.currency)}</span>
          <ChangeTag value={coin.change24h} />
        </div>
      ))}
    </div>
  )
}

function CryptoFocus({ widget }) {
  const { data, loading, lastUpdate, refresh } = useCrypto(widget.config.coins, widget.config.currency)
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(false)

  useEffect(() => {
    if (data.length > 0 && !selected) setSelected(data[0].id)
  }, [data])

  useEffect(() => {
    if (!selected) return
    setHistLoading(true)
    cryptoService.getHistory(selected, widget.config.currency, 7)
      .then(h => { setHistory(h); setHistLoading(false) })
      .catch(() => setHistLoading(false))
  }, [selected, widget.config.currency])

  if (loading) return <div className={styles.center}><Spinner size={36} /></div>

  const selectedCoin = data.find(c => c.id === selected)
  const maxPrice = history.length ? Math.max(...history.map(h => h.price)) : 1
  const minPrice = history.length ? Math.min(...history.map(h => h.price)) : 0

  return (
    <div className={styles.focusView}>
      <div className={styles.focusHeader}>
        <div className={styles.tabs}>
          {data.map(coin => (
            <button
              key={coin.id}
              className={[styles.tab, selected === coin.id ? styles.tabActive : ''].join(' ')}
              onClick={() => setSelected(coin.id)}
            >
              <span className={styles.tabDot} style={{ background: coin.color }} />
              {coin.symbol}
            </button>
          ))}
        </div>
        <button className={styles.refreshBtn} onClick={refresh} title="Actualiser">
          <RefreshCw size={13} />
        </button>
      </div>
      {selectedCoin && (
        <div className={styles.focusHero}>
          <div>
            <div className={styles.heroPrice}>{cryptoService.formatPrice(selectedCoin.price, selectedCoin.currency)}</div>
            <div className={styles.heroName}>{selectedCoin.name}</div>
          </div>
          <ChangeTag value={selectedCoin.change24h} />
        </div>
      )}
      <div className={styles.focusStats}>
        {selectedCoin && <>
          <div className={styles.statBox}><span className={styles.statLabel}>Cap. marché</span><span className={styles.statVal}>{cryptoService.formatMarketCap(selectedCoin.marketCap)}€</span></div>
          <div className={styles.statBox}><span className={styles.statLabel}>Volume 24h</span><span className={styles.statVal}>{cryptoService.formatMarketCap(selectedCoin.volume24h)}€</span></div>
        </>}
      </div>
      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Prix 7 jours</div>
        {histLoading
          ? <div className={styles.center} style={{ height: 80 }}><Spinner size={20} /></div>
          : (
            <div className={styles.sparkline}>
              <svg viewBox={`0 0 ${history.length * 40} 80`} preserveAspectRatio="none" className={styles.svg}>
                <defs>
                  <linearGradient id={`grad-${selected}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={selectedCoin?.color || '#8b5cf6'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={selectedCoin?.color || '#8b5cf6'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {history.length > 1 && (() => {
                  const pts = history.map((h, i) => {
                    const x = i * 40 + 20
                    const y = maxPrice === minPrice ? 40 : 80 - ((h.price - minPrice) / (maxPrice - minPrice)) * 70 - 5
                    return `${x},${y}`
                  })
                  const pathD = `M ${pts.join(' L ')}`
                  const areaD = `M 20,80 L ${pts.join(' L ')} L ${(history.length - 1) * 40 + 20},80 Z`
                  return <>
                    <path d={areaD} fill={`url(#grad-${selected})`} />
                    <path d={pathD} fill="none" stroke={selectedCoin?.color || '#8b5cf6'} strokeWidth="2" strokeLinejoin="round" />
                  </>
                })()}
              </svg>
              <div className={styles.sparkLabels}>
                {history.map((h, i) => (
                  i % 2 === 0 && <span key={i} className={styles.sparkDate}>{h.date}</span>
                ))}
              </div>
            </div>
          )
        }
      </div>
      {lastUpdate && (
        <div className={styles.updateTime}>Mis à jour {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
      )}
    </div>
  )
}

function CryptoFullscreen({ widget }) {
  const { data, loading, refresh } = useCrypto(widget.config.coins, widget.config.currency)
  if (loading) return <div className={styles.center}><Spinner size={48} /></div>
  return (
    <div className={styles.fullscreenView}>
      <div className={styles.fsTopBar}>
        <h1 className={styles.fsTitle}>Marché Crypto</h1>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>Actualiser</Button>
      </div>
      <div className={styles.fsCards}>
        {data.map(coin => (
          <div key={coin.id} className={styles.fsCard} style={{ '--coin-color': coin.color }}>
            <div className={styles.fsCardTop}>
              <div className={styles.fsCoinName}>
                <div className={styles.fsCoinDot} style={{ background: coin.color }} />
                <div>
                  <div className={styles.fsCoinSymbol}>{coin.symbol}</div>
                  <div className={styles.fsCoinFull}>{coin.name}</div>
                </div>
              </div>
              <ChangeTag value={coin.change24h} />
            </div>
            <div className={styles.fsCoinPrice}>{cryptoService.formatPrice(coin.price, coin.currency)}</div>
            <div className={styles.fsCoinMeta}>
              <div><span className={styles.fsMetaLabel}>Cap.</span><span>{cryptoService.formatMarketCap(coin.marketCap)}€</span></div>
              <div><span className={styles.fsMetaLabel}>Vol.</span><span>{cryptoService.formatMarketCap(coin.volume24h)}€</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CryptoWidget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid' && <CryptoGrid widget={widget} />}
      {mode === 'focus' && <CryptoFocus widget={widget} />}
      {mode === 'fullscreen' && <CryptoFullscreen widget={widget} />}
    </WidgetShell>
  )
}