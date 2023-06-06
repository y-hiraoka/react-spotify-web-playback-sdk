import { NextApiHandler } from "next";
import { setCookie } from "nookies";
import { v4 as uuid } from "uuid";
import {
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES,
} from "../../common/constant";

const handler: NextApiHandler = (req, res) => {
  if (req.method === "GET") {
    const state = uuid();

    const redirectParams = new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_SCOPES.join(" "),
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state,
    });

    const secure = !req.headers.host?.includes("localhost");
    setCookie({ res }, "state", state, {
      maxAge: 3600000,
      secure: secure,
      httpOnly: true,
      path: "/",
    });

    const url = `${SPOTIFY_AUTHORIZE_URL}?${redirectParams.toString()}`;

    res.redirect(url);
  } else {
    res.status(405).send("Method Not Allowed");
  }
};

export default handler;
