import styles from "./PlayerHeader.module.css";
import { TextInput } from "./TextInput";

type Props = {
  deviceName: string;
  deviceNameOnChange: (name: string) => void;
};

export const PlayerHeader: React.VFC<Props> = ({
  deviceName,
  deviceNameOnChange,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <img className={styles.smallLogo} src="/logo-small.png" alt="small logo" />
          <div className={styles.deviceNameTop}>
            <TextInput
              value={deviceName}
              onChange={deviceNameOnChange}
              placeholder="input your device name..."
            />
          </div>
        </div>
        <a
          className={styles.githubLink}
          href="https://github.com/y-hiraoka/react-spotify-web-playback-sdk"
          target="_blank"
          rel="noopener noreferer">
          GitHub
        </a>
      </div>
      <div className={styles.headerBottom}>
        <TextInput
          value={deviceName}
          onChange={deviceNameOnChange}
          placeholder="input device name..."
        />
      </div>
    </header>
  );
};
