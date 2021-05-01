import styles from "../styles/index.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>React Web Playback SDK Demo App</h1>
      <img
        className={styles.logo}
        src="/react-spotify-web-playback-sdk-logo.png"
        alt="logo"
      />
      <div className={styles.links}>
        <a className={styles.signinLink} href="/api/login">
          Sign-in with Spotify
        </a>
        <a
          className={styles.githubLink}
          target="_blank"
          rel="noopner noreferer"
          href="https://github.com/y-hiraoka/react-spotify-web-playback-sdk">
          GitHub Repository
        </a>
      </div>
    </div>
  );
}
