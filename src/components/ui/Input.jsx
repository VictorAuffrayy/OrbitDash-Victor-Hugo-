import styles from './Input.module.css'

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={[styles.wrapper, className].join(' ')}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <div className={styles.inputWrap}>
        {Icon && <Icon className={styles.icon} size={16} />}
        <input
          id={inputId}
          className={[styles.input, Icon ? styles.withIcon : '', error ? styles.hasError : ''].join(' ')}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', id, rows = 3, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={[styles.wrapper, className].join(' ')}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <textarea
        id={inputId}
        rows={rows}
        className={[styles.input, styles.textarea, error ? styles.hasError : ''].join(' ')}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}