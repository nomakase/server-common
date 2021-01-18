import express from "express";
import AuthService from "../services/AuthService";
import GoogleOAuth from "../auth/GoogleOAuth";
import { TypedResponse } from "./interface";
const router = express.Router();

router.post("/signIn", async (req, res: TypedResponse<{accessToken: string, refreshToken: string}>, next) => {
  const oauthToken = req.body.OAuthToken;
  const deviceID = req.body.deviceID;
  const auth = new AuthService(new GoogleOAuth());

  try {
    if (!(deviceID && oauthToken)) {
      throw new Error("Missing parameters for signing in. (/signIn)");
    }

    const { accessToken, refreshToken } = await auth.signIn(
      oauthToken,
      deviceID
    );

    console.log("signIn: success.");
    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    err.code = 401;
    console.error(err);

    next(err);
  }
});

router.post("/signInAuto", (req, res, next) => {
  const _accessToken = req.body.accessToken;
  const _refreshToken = req.body.refreshToken;
  const deviceID = req.body.deviceID;

  // No need OAuth service.
  const auth = new AuthService();

  try {
    if (!(_accessToken && _refreshToken && deviceID)) {
      throw new Error("Missing parameters for signing in. (/signInAuto)");
    }

    const { accessToken, refreshToken } = auth.signInAuto(
      _refreshToken,
      _accessToken,
      deviceID
    );

    console.log("signInAuto: success.");
    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    err.code = 401;
    console.error(err);

    next(err);
  }
});

export default router;
