import { AppProps } from "next/app";
import "../styles/globals.css";

const MyApp: React.VFC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
