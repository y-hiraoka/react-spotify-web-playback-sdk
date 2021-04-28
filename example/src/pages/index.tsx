import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <a href="/api/login">sign in with Spotify</a>
    </div>
  )
}
