const BASE = 'https://api.coingecko.com/api/v3'

const COIN_META = {
  bitcoin:  { symbol: 'BTC', color: '#f7931a' },
  ethereum: { symbol: 'ETH', color: '#627eea' },
  solana:   { symbol: 'SOL', color: '#9945ff' },
  cardano:  { symbol: 'ADA', color: '#0033ad' },
  dogecoin: { symbol: 'DOGE', color: '#c2a633' },
  ripple:   { symbol: 'XRP', color: '#00aae4' },
}

export const cryptoService = {
  getPrices: async (coins, currency = 'eur') => {
    const ids = coins.join(',')
    const url = `${BASE}/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Erreur API crypto')
    const data = await res.json()

    return coins.map(id => {
      const d = data[id] || {}
      const meta = COIN_META[id] || { symbol: id.toUpperCase(), color: '#8b5cf6' }
      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        symbol: meta.symbol,
        color: meta.color,
        price: d[currency] ?? 0,
        change24h: d[`${currency}_24h_change`] ?? 0,
        marketCap: d[`${currency}_market_cap`] ?? 0,
        volume24h: d[`${currency}_24h_vol`] ?? 0,
        currency
      }
    })
  },

  getHistory: async (coinId, currency = 'eur', days = 7) => {
    const url = `${BASE}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=daily`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Erreur historique crypto')
    const data = await res.json()
    return data.prices.map(([ts, price]) => ({
      date: new Date(ts).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      price: Math.round(price * 100) / 100
    }))
  },

  formatPrice: (price, currency = 'eur') => {
    const symbol = currency === 'eur' ? '€' : '$'
    if (price >= 1000) return `${symbol}${price.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`
    if (price >= 1) return `${symbol}${price.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`
    return `${symbol}${price.toFixed(4)}`
  },

  formatMarketCap: (mc) => {
    if (mc >= 1e12) return `${(mc / 1e12).toFixed(2)}T`
    if (mc >= 1e9) return `${(mc / 1e9).toFixed(1)}B`
    if (mc >= 1e6) return `${(mc / 1e6).toFixed(1)}M`
    return mc.toLocaleString('fr-FR')
  }
}