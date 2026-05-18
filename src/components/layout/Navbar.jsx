import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Badge } from '../ui/Badge'
import styles from './Navbar.module.css'

export function Navbar() {
  const { pathname } = useLocation()
  const { isAdmin, toggleRole, user } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>◎</span>
        <span className={styles.brandName}>OrbitDash</span>
      </div>
      <div className={styles.links}>
        <Link to="/" className={[styles.link, pathname === '/' ? styles.active : ''].join(' ')}>
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
        {isAdmin && (
          <Link to="/admin" className={[styles.link, pathname === '/admin' ? styles.active : ''].join(' ')}>
            <Settings size={16} />
            Admin
          </Link>
        )}
      </div>
      <div className={styles.right}>
        {isAdmin && <Badge variant="accent"><ShieldCheck size={10} /> Admin</Badge>}
        <button className={styles.roleToggle} onClick={toggleRole}>
          <span className={styles.avatar}>{user.name[0]}</span>
          <span className={styles.roleName}>{user.name}</span>
        </button>
      </div>
    </nav>
  )
}