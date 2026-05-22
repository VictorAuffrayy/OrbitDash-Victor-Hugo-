import { useState, useCallback } from 'react'
import { RotateCcw, Users, Bot } from 'lucide-react'
import { WidgetShell } from './WidgetShell'
import { Button } from '../ui/Button'
import styles from './MorpionWidget.module.css'

// ── Game logic ────────────────────────────────────────────────────────────────

const WINS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
]

function checkWinner(board) {
  for (const [a,b,c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line: [a,b,c] }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] }
  return null
}

function bestMove(board, player) {
  const opp = player === 'O' ? 'X' : 'O'

  function minimax(b, isMax, depth) {
    const res = checkWinner(b)
    if (res) {
      if (res.winner === player) return 10 - depth
      if (res.winner === opp) return depth - 10
      return 0
    }
    const scores = b.map((cell, i) => {
      if (cell) return isMax ? -99 : 99
      const next = [...b]; next[i] = isMax ? player : opp
      return minimax(next, !isMax, depth + 1)
    })
    return isMax ? Math.max(...scores) : Math.min(...scores)
  }

  let best = -99, move = -1
  board.forEach((cell, i) => {
    if (!cell) {
      const next = [...board]; next[i] = player
      const score = minimax(next, false, 0)
      if (score > best) { best = score; move = i }
    }
  })
  return move
}

function useMorpion(vsAI = true) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [current, setCurrent] = useState('X')
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 })
  const [result, setResult] = useState(null)

  const play = useCallback((idx) => {
    if (board[idx] || result) return
    const newBoard = [...board]
    newBoard[idx] = current
    const res = checkWinner(newBoard)

    if (res) {
      setBoard(newBoard)
      setResult(res)
      if (res.winner !== 'draw') {
        setScores(s => ({ ...s, [res.winner]: s[res.winner] + 1 }))
      } else {
        setScores(s => ({ ...s, draw: s.draw + 1 }))
      }
      return
    }

    const next = current === 'X' ? 'O' : 'X'
    if (vsAI && next === 'O') {
      const aiIdx = bestMove(newBoard, 'O')
      const aiBoard = [...newBoard]
      aiBoard[aiIdx] = 'O'
      const aiRes = checkWinner(aiBoard)
      setBoard(aiBoard)
      if (aiRes) {
        setResult(aiRes)
        if (aiRes.winner !== 'draw') setScores(s => ({ ...s, [aiRes.winner]: s[aiRes.winner] + 1 }))
        else setScores(s => ({ ...s, draw: s.draw + 1 }))
      } else {
        setCurrent('X')
      }
    } else {
      setBoard(newBoard)
      setCurrent(next)
    }
  }, [board, current, result, vsAI])

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null))
    setCurrent('X')
    setResult(null)
  }, [])

  const fullReset = useCallback(() => {
    reset()
    setScores({ X: 0, O: 0, draw: 0 })
  }, [reset])

  return { board, current, scores, result, play, reset, fullReset }
}

// ── Board component ────────────────────────────────────────────────────────────

function Board({ board, result, onPlay, compact = false }) {
  return (
    <div className={[styles.board, compact ? styles.compact : ''].join(' ')}>
      {board.map((cell, i) => {
        const isWinCell = result?.line?.includes(i)
        return (
          <button
            key={i}
            className={[
              styles.cell,
              cell === 'X' ? styles.cellX : cell === 'O' ? styles.cellO : '',
              isWinCell ? styles.winCell : '',
              !cell && !result ? styles.cellEmpty : ''
            ].join(' ')}
            onClick={() => onPlay(i)}
            disabled={!!cell || !!result}
          >
            {cell}
          </button>
        )
      })}
    </div>
  )
}

function ScoreBar({ scores, current, result, vsAI, compact = false }) {
  return (
    <div className={[styles.scoreBar, compact ? styles.compactScore : ''].join(' ')}>
      <div className={[styles.scoreBox, styles.scoreX, !result && current === 'X' ? styles.scoreCurrent : ''].join(' ')}>
        <span className={styles.scoreLabel}>{vsAI ? 'Toi (X)' : 'J1 (X)'}</span>
        <span className={styles.scoreVal}>{scores.X}</span>
      </div>
      <div className={styles.scoreBoxDraw}>
        <span className={styles.scoreLabel}>Nul</span>
        <span className={styles.scoreVal}>{scores.draw}</span>
      </div>
      <div className={[styles.scoreBox, styles.scoreO, !result && current === 'O' ? styles.scoreCurrent : ''].join(' ')}>
        <span className={styles.scoreLabel}>{vsAI ? 'IA (O)' : 'J2 (O)'}</span>
        <span className={styles.scoreVal}>{scores.O}</span>
      </div>
    </div>
  )
}

function ResultBanner({ result, vsAI, onReset }) {
  const msg = result?.winner === 'draw'
    ? 'Match nul !'
    : result?.winner === 'X'
    ? vsAI ? '🎉 Tu as gagné !' : '🎉 Joueur 1 gagne !'
    : vsAI ? '🤖 L\'IA gagne !' : '🎉 Joueur 2 gagne !'
  return (
    <div className={styles.resultBanner}>
      <span className={styles.resultMsg}>{msg}</span>
      <button className={styles.playAgain} onClick={onReset}>Rejouer</button>
    </div>
  )
}

// ── Widget modes ─────────────────────────────────────────────────────────────

function MorpionGrid({ widget }) {
  const { board, result } = useMorpion(true)
  return (
    <div className={styles.gridView}>
      <div className={styles.gridHeader}>
        <span className={styles.gridLabel}>Morpion</span>
        <span className={styles.modeBadge}><Bot size={10} /> VS IA</span>
      </div>
      <Board board={board} result={result} onPlay={() => {}} compact />
      <p className={styles.gridHint}>Cliquez pour jouer</p>
    </div>
  )
}

function MorpionFocus({ widget }) {
  const [vsAI, setVsAI] = useState(true)
  const { board, current, scores, result, play, reset, fullReset } = useMorpion(vsAI)

  return (
    <div className={styles.focusView}>
      <div className={styles.focusTop}>
        <div className={styles.modeSwitcher}>
          <button className={[styles.modeBtn, vsAI ? styles.modeBtnActive : ''].join(' ')} onClick={() => { setVsAI(true); fullReset() }}>
            <Bot size={12} /> VS IA
          </button>
          <button className={[styles.modeBtn, !vsAI ? styles.modeBtnActive : ''].join(' ')} onClick={() => { setVsAI(false); fullReset() }}>
            <Users size={12} /> 2 Joueurs
          </button>
        </div>
        <button className={styles.resetBtn} onClick={fullReset} title="Reset scores"><RotateCcw size={13} /></button>
      </div>

      <ScoreBar scores={scores} current={current} result={result} vsAI={vsAI} />

      {!result && (
        <div className={styles.turnIndicator}>
          <span className={current === 'X' ? styles.turnX : styles.turnO}>
            {current === 'X' ? (vsAI ? '👤 Ton tour' : '👤 Joueur 1') : (vsAI ? '🤖 IA réfléchit...' : '👤 Joueur 2')}
          </span>
        </div>
      )}

      <Board board={board} result={result} onPlay={play} />

      {result && <ResultBanner result={result} vsAI={vsAI} onReset={reset} />}
    </div>
  )
}

function MorpionFullscreen({ widget }) {
  const [vsAI, setVsAI] = useState(true)
  const { board, current, scores, result, play, reset, fullReset } = useMorpion(vsAI)

  return (
    <div className={styles.fullscreenView}>
      <h1 className={styles.fsTitle}>Morpion</h1>
      <div className={styles.modeSwitcher}>
        <button className={[styles.modeBtn, vsAI ? styles.modeBtnActive : ''].join(' ')} onClick={() => { setVsAI(true); fullReset() }}>
          <Bot size={14} /> VS IA
        </button>
        <button className={[styles.modeBtn, !vsAI ? styles.modeBtnActive : ''].join(' ')} onClick={() => { setVsAI(false); fullReset() }}>
          <Users size={14} /> 2 Joueurs
        </button>
      </div>

      <ScoreBar scores={scores} current={current} result={result} vsAI={vsAI} />

      {!result
        ? <div className={styles.fsTurn}>
            <span className={current === 'X' ? styles.turnX : styles.turnO}>
              {current === 'X' ? (vsAI ? '👤 Ton tour (X)' : '👤 Joueur 1 (X)') : (vsAI ? '🤖 Tour de l\'IA (O)' : '👤 Joueur 2 (O)')}
            </span>
          </div>
        : <ResultBanner result={result} vsAI={vsAI} onReset={reset} />
      }

      <Board board={board} result={result} onPlay={play} />

      <Button variant="ghost" size="sm" icon={RotateCcw} onClick={fullReset}>Reset scores</Button>
    </div>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────────

export function MorpionWidget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid'       && <MorpionGrid widget={widget} />}
      {mode === 'focus'      && <MorpionFocus widget={widget} />}
      {mode === 'fullscreen' && <MorpionFullscreen widget={widget} />}
    </WidgetShell>
  )
}