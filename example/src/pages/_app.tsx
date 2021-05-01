import { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

const MyApp: React.VFC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>React Web Playback SDK Demo App</title>
        <meta property="og:title" content="React Web Playback SDK Demo App" />
        <meta
          property="og:image"
          content="https://react-spotify-web-playback-sdk.vercel.app/react-spotify-web-playback-sdk-logo.png"
        />
        <meta
          property="og:description"
          content="an example app of react-spotify-web-playback-sdk which is published at npmjs.com."
        />
        <meta
          property="og:url"
          content="https://react-spotify-web-playback-sdk.vercel.app/"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="React Web Playback SDK Demo App" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
