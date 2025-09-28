import { signIn } from "@/auth";
import logo from "./opengraph-image.png";
import styles from "../styles/index.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>React Web Playback SDK Demo App</h1>
      <Image className={styles.logo} alt="logo" src={logo} />
      <div className={styles.links}>
        <form
          action={async () => {
            "use server";
            await signIn("spotify", { redirectTo: "/player" });
          }}
        >
          <button className={styles.signinLink} type="submit">
            Sign-in with Spotify
          </button>
        </form>
        <a
          className={styles.githubLink}
          target="_blank"
          rel="noopner noreferer"
          href="https://github.com/y-hiraoka/react-spotify-web-playback-sdk"
        >
          GitHub Repository
        </a>
      </div>
    </div>
  );
}
