import styles from './Badge.module.css'

export function Badge({ children, variant = 'default', size = 'md' }) {
  return (
    <span className={[styles.badge, styles[variant], styles[size]].join(' ')}>
      {children}
    </span>
  )
}

export function Spinner({ size = 24, className = '' }) {
  return (
    <span
      className={[styles.spinner, className].join(' ')}
      style={{ width: size, height: size }}
      aria-label="Chargement"
    />
  )
}

export function Skeleton({ height = 16, width = '100%', borderRadius = 6, className = '' }) {
  return (
    <span
      className={[styles.skeleton, className].join(' ')}
      style={{ height, width, borderRadius }}
    />
  )
}