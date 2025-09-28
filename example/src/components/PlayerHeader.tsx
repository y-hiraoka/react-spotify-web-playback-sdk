import { useEffect, useState } from "react";
import { useSpotifyPlayer } from "react-spotify-web-playback-sdk";
import styles from "./PlayerHeader.module.css";
import { TextInput } from "./TextInput";
import logoSmall from "./logo-small.png";
import Image from "next/image";

export const PlayerHeader: React.FC = () => {
  const [deviceName, setDeviceName] = useState("Spotify Player on Next.js");

  const spotifyPlayer = useSpotifyPlayer();

  useEffect(() => {
    spotifyPlayer?.setName(deviceName);
  }, [deviceName]);

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <Image
            className={styles.smallLogo}
            src={logoSmall}
            alt="small logo"
          />
          <div className={styles.deviceNameTop}>
            <TextInput
              value={deviceName}
              onChange={setDeviceName}
              placeholder="input your device name..."
            />
          </div>
        </div>
        <a
          className={styles.githubLink}
          href="https://github.com/y-hiraoka/react-spotify-web-playback-sdk"
          target="_blank"
          rel="noopener noreferer"
        >
          GitHub
        </a>
      </div>
      <div className={styles.headerBottom}>
        <TextInput
          value={deviceName}
          onChange={setDeviceName}
          placeholder="input device name..."
        />
      </div>
    </header>
  );
};
