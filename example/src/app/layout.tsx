import { Metadata } from "next";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "React Web Playback SDK Demo App",
  description:
    "an example app of react-spotify-web-playback-sdk which is published at npmjs.com.",
  openGraph: {
    title: "React Web Playback SDK Demo App",
    description:
      "an example app of react-spotify-web-playback-sdk which is published at npmjs.com.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
