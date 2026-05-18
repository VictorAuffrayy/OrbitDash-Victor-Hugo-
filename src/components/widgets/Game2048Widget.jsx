import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy } from 'lucide-react'
import { WidgetShell } from './WidgetShell'
import { Button } from '../ui/Button'
import styles from './Game2048Widget.module.css'

// ── Game logic ────────────────────────────────────────────────────────────────

const EMPTY = () => Array(4).fill(null).map(() => Array(4).fill(0))

function addRandom(board) {
  const empties = []
  board.forEach((row, r) => row.forEach((cell, c) => { if (!cell) empties.push([r, c]) }))
  if (!empties.length) return board
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  const next = board.map(row => [...row])
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

function initBoard() {
  return addRandom(addRandom(EMPTY()))
}

function slideRow(row) {
  const nums = row.filter(x => x)
  let score = 0
  const merged = []
  let i = 0
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      merged.push(nums[i] * 2)
      score += nums[i] * 2
      i += 2
    } else {
      merged.push(nums[i])
      i++
    }
  }
  while (merged.length < 4) merged.push(0)
  return { row: merged, score }
}

function move(board, dir) {
  let newBoard = board.map(row => [...row])
  let totalScore = 0
  let changed = false

  const slide = (row) => {
    const { row: slid, score } = slideRow(row)
    totalScore += score
    if (slid.some((v, i) => v !== row[i])) changed = true
    return slid
  }

  if (dir === 'left') {
    newBoard = newBoard.map(slide)
  } else if (dir === 'right') {
    newBoard = newBoard.map(row => slide([...row].reverse()).reverse())
  } else if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = [0,1,2,3].map(r => newBoard[r][c])
      const slid = slide(col)
      slid.forEach((v, r) => { newBoard[r][c] = v })
    }
  } else if (dir === 'down') {
    for (let c = 0; c < 4; c++) {
      const col = [3,2,1,0].map(r => newBoard[r][c])
      const slid = slide(col)
      slid.forEach((v, r) => { newBoard[3 - r][c] = v })
    }
  }

  if (!changed) return { board, score: 0, changed: false }
  return { board: addRandom(newBoard), score: totalScore, changed: true }
}

function isGameOver(board) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!board[r][c]) return false
      if (c < 3 && board[r][c] === board[r][c+1]) return false
      if (r < 3 && board[r][c] === board[r+1][c]) return false
    }
  }
  return true
}

function hasWon(board) {
  return board.some(row => row.some(v => v >= 2048))
}

// ── Tile ─────────────────────────────────────────────────────────────────────

const TILE_COLORS = {
  0:    { bg: 'rgba(255,255,255,0.05)', color: 'transparent' },
  2:    { bg: '#b5d4f4', color: '#042c53' },
  4:    { bg: '#85b7eb', color: '#042c53' },
  8:    { bg: '#9fe1cb', color: '#04342c' },
  16:   { bg: '#5dcaa5', color: '#04342c' },
  32:   { bg: '#fac775', color: '#412402' },
  64:   { bg: '#ef9f27', color: '#412402' },
  128:  { bg: '#afa9ec', color: '#26215c' },
  256:  { bg: '#7f77dd', color: '#fff' },
  512:  { bg: '#534ab7', color: '#fff' },
  1024: { bg: '#f09595', color: '#501313' },
  2048: { bg: '#e24b4a', color: '#fff' },
}

function Tile({ value, size = 'md' }) {
  const colors = TILE_COLORS[value] || TILE_COLORS[2048]
  const fontSizes = {
    xs:  value >= 1024 ? '8px'  : value >= 128 ? '9px'  : '11px',
    sm:  value >= 1024 ? '10px' : value >= 128 ? '12px' : '14px',
    md:  value >= 1024 ? '14px' : value >= 128 ? '16px' : '20px',
    lg:  value >= 1024 ? '20px' : value >= 128 ? '24px' : '32px',
    xl:  value >= 1024 ? '28px' : value >= 128 ? '34px' : '44px',
  }
  return (
    <div
      className={[styles.tile, value ? styles.tileActive : ''].join(' ')}
      style={{ background: colors.bg, color: colors.color, fontSize: fontSizes[size] || fontSizes.md }}
    >
      {value || ''}
    </div>
  )
}

// ── Game hook ─────────────────────────────────────────────────────────────────

function useGame() {
  const [board, setBoard] = useState(initBoard)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem('2048-best') || '0') } catch { return 0 }
  })
  const [won, setWon] = useState(false)
  const [over, setOver] = useState(false)

  const doMove = useCallback((dir) => {
    setBoard(prev => {
      const result = move(prev, dir)
      if (!result.changed) return prev
      setScore(s => {
        const newScore = s + result.score
        setBest(b => {
          const newBest = Math.max(b, newScore)
          try { localStorage.setItem('2048-best', String(newBest)) } catch {}
          return newBest
        })
        return newScore
      })
      if (hasWon(result.board)) setWon(true)
      if (isGameOver(result.board)) setOver(true)
      return result.board
    })
  }, [])

  const reset = useCallback(() => {
    setBoard(initBoard())
    setScore(0)
    setWon(false)
    setOver(false)
  }, [])

  return { board, score, best, won, over, doMove, reset }
}

// ── Interactive board (avec clavier + touch) ──────────────────────────────────

function InteractiveBoard({ board, score, best, won, over, doMove, reset, tileSize = 'md', showHint = false }) {
  const touchRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [doMove])

  const onTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e) => {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left')
    else doMove(dy > 0 ? 'down' : 'up')
    touchRef.current = null
  }

  return (
    <div className={styles.gameWrap}>
      <div className={styles.scorebar}>
        <div className={styles.scoreBox}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreVal}>{score}</span>
        </div>
        <div className={styles.scoreBox}>
          <span className={styles.scoreLabel}>Meilleur</span>
          <span className={styles.scoreVal}>{best}</span>
        </div>
        <button className={styles.resetBtn} onClick={reset} title="Nouvelle partie">
          <RotateCcw size={14} />
        </button>
      </div>

      <div
        className={styles.board}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {(won || over) && (
          <div className={styles.overlay}>
            {won ? (
              <>
                <Trophy size={28} style={{ color: 'var(--amber)' }} />
                <div className={styles.overlayTitle}>2048 !</div>
                <button className={styles.overlayBtn} onClick={reset}>Continuer</button>
              </>
            ) : (
              <>
                <div className={styles.overlayTitle}>Game Over</div>
                <div className={styles.overlaySub}>Score : {score}</div>
                <button className={styles.overlayBtn} onClick={reset}>Rejouer</button>
              </>
            )}
          </div>
        )}
        {board.map((row, r) =>
          row.map((val, c) => (
            <Tile key={`${r}-${c}`} value={val} size={tileSize} />
          ))
        )}
      </div>

      {showHint && <p className={styles.hint}>Touches fléchées · Swipe sur mobile</p>}
    </div>
  )
}

// ── Preview board (lecture seule, miniature) ──────────────────────────────────

function PreviewBoard({ board }) {
  return (
    <div className={styles.previewBoard}>
      {board.map((row, r) =>
        row.map((val, c) => (
          <Tile key={`${r}-${c}`} value={val} size="xs" />
        ))
      )}
    </div>
  )
}

// ── Grid mode : miniature statique + message ──────────────────────────────────

function Game2048Grid({ widget }) {
  const { board } = useGame()
  return (
    <div className={styles.gridView}>
      <p className={styles.gridHint}>Cliquez pour jouer</p>
      <PreviewBoard board={board} />
    </div>
  )
}

// ── Focus mode : jeu complet mais compact ─────────────────────────────────────

function Game2048Focus({ widget, onFullscreen }) {
  const game = useGame()
  return (
    <div className={styles.focusView}>
      <InteractiveBoard {...game} tileSize="sm" showHint={false} />
      <button className={styles.fsHint} onClick={onFullscreen}>
        ⤢ Plein écran pour plus de confort
      </button>
    </div>
  )
}

// ── Fullscreen mode : grand plateau centré ────────────────────────────────────

function Game2048Fullscreen({ widget }) {
  const game = useGame()
  return (
    <div className={styles.fullscreenView}>
      <InteractiveBoard {...game} tileSize="xl" showHint={true} />
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function Game2048Widget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid'       && <Game2048Grid widget={widget} />}
      {mode === 'focus'      && <Game2048Focus widget={widget} onFullscreen={onFullscreen} />}
      {mode === 'fullscreen' && <Game2048Fullscreen widget={widget} />}
    </WidgetShell>
  )
}