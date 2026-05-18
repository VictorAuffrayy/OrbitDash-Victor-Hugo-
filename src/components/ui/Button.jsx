import styles from './Button.module.css'

const VARIANTS = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
}

const SIZES = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconAfter: IconAfter,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className
      ].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden />}
      {!loading && Icon && <Icon size={16} />}
      {children && <span>{children}</span>}
      {!loading && IconAfter && <IconAfter size={16} />}
    </button>
  )
}