import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Proto Gestão. Todos os direitos reservados.
        </p>
        <p className={styles.attribution}>
          Essa aplicação é mais uma solução do{' '}
          <a
            href="https://protogestao.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Proto Gestão
          </a>
          .
        </p>
      </div>
    </footer>
  )
}