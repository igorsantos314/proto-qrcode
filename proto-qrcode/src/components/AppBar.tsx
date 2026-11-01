import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import styles from './AppBar.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'QR Code', end: true },
  { to: '/orcamentos', label: 'Orçamentos', end: false },
]

export function AppBar() {
  return (
    <header className={styles.appBar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            src={logo}
            alt="Logo LaserGest"
            className={styles.logo}
            width={40}
            height={40}
          />
          <span className={styles.title}>LaserGest</span>
          <span className={styles.tagline}>Gestão para gravadoras laser</span>
        </div>
        <nav className={styles.nav} aria-label="Seções">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? styles.navLinkActive : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
