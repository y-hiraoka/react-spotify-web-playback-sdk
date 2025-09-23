import { memo, useState } from "react";
import styles from "./StateSummary.module.css";

type Props = {
  summary: string;
  state: unknown;
};

export const StateSummary: React.VFC<Props> = memo(({ state, summary }) => {
  const [open, setOpen] = useState(true);

  return (
    <details
      className={styles.root}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
    >
      <summary>
        <code>{summary}</code>
      </summary>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </details>
  );
});
