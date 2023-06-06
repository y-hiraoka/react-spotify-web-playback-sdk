import React, { createContext, useContext, useEffect, useState } from "react";
import { MUST_BE_WRAPPED_MESSAGE } from "./constant";

const WebPlaybackSDKReadyContext = createContext<boolean | undefined>(undefined);

export const WebPlaybackSDKReadyProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [webPlaybackSDKReady, setWebPlaybackSDKReady] = useState(false);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      setWebPlaybackSDKReady(true);
    };
  }, []);

  return (
    <WebPlaybackSDKReadyContext.Provider value={webPlaybackSDKReady}>
      {children}
    </WebPlaybackSDKReadyContext.Provider>
  );
};

export function useWebPlaybackSDKReady() {
  const value = useContext(WebPlaybackSDKReadyContext);

  if (value === undefined) throw new Error(MUST_BE_WRAPPED_MESSAGE);

  return value;
}
