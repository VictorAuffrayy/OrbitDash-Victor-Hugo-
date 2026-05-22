import styles from './Card.module.css'

export function Card({ children, className = '', onClick, hoverable = false, elevated = false, glow = false, ...props }) {
  return (
    <div
      className={[
        styles.card,
        hoverable ? styles.hoverable : '',
        elevated ? styles.elevated : '',
        glow ? styles.glow : '',
        onClick ? styles.clickable : '',
        className
      ].join(' ')}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={[styles.header, className].join(' ')}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={[styles.body, className].join(' ')}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return <div className={[styles.footer, className].join(' ')}>{children}</div>
}