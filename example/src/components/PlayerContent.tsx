import { memo } from "react";
import { PlayerController } from "./PlayerController";
import { StateConsumer } from "./StateConsumer";
import styles from "./PlayerContent.module.css";

export const PlayerContent: React.FC = memo(() => {
  return (
    <div className={styles.root}>
      <div className={styles.playerButtons}>
        <PlayerController />
      </div>
      <div className={styles.stateConsumer}>
        <StateConsumer />
      </div>
    </div>
  );
});
