import { useState } from "react";
import styles from "./TextInput.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export const TextInput: React.VFC<Props> = ({ value, onChange, placeholder }) => {
  const [focus, setFocus] = useState(false);

  return (
    <div className={styles.root} data-focused={focus}>
      <svg height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      <input
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
