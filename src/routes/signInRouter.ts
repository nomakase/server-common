import express from "express";
import AuthService from "../services/AuthService";
import OAuth from "../auth/OAuth";
import { SignInResponse } from "@custom-types/express";

const router = express.Router();

router.post(
  "/signIn/:authServer",
  async (
    req,
    res: SignInResponse,
    next
  ) => {
    const authServer = OAuth[req.params.authServer?.toLowerCase()]
    const oauthToken = req.body.OAuthToken;
    const deviceID = req.body.deviceID;
    
    try {

      if (!(authServer && deviceID && oauthToken)) {
        throw new Error("Missing parameters for signing in. (/signIn)");
      }

      const auth = new AuthService(authServer);
      const authResult = await auth.signIn(
        oauthToken,
        deviceID
      );

      console.log("signIn: success.");
      res.json({
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        isSubmitted: authResult.isSubmitted,
        isApproved: authResult.isApproved,
      });
    } catch (err) {
      err.code = 401;
      console.error(err);

      next(err);
    }
  }
);

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
