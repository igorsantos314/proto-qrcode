import logo from '../assets/logo.png'
import styles from './AppBar.module.css'

export function AppBar() {
  return (
    <header className={styles.appBar}>
      <div className={styles.inner}>
        <img
          src={logo}
          alt="Logo Proto Gestão"
          className={styles.logo}
          width={40}
          height={40}
        />
        <span className={styles.title}>Proto QR Code</span>
      </div>
    </header>
  )
}