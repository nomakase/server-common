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
      const signedInUser = await auth.signIn(
        oauthToken,
        deviceID
      );

      console.log("signIn: success.");
      res.json(signedInUser);
    } catch (err) {
      err.code = 401;
      console.error(err);

      next(err);
    }
  }
);

router.post("/signInAuto", async (req, res: SignInResponse, next) => {
  const accessToken = req.body.accessToken;
  const refreshToken = req.body.refreshToken;
  const deviceID = req.body.deviceID;

  // No need OAuth service.
  const auth = new AuthService();

  try {
    if (!(accessToken && refreshToken && deviceID)) {
      throw new Error("Missing parameters for signing in. (/signInAuto)");
    }

    const signedInUser = await auth.signInAuto(
      refreshToken,
      accessToken,
      deviceID
    );

    console.log("signInAuto: success.");
    res.json(signedInUser);
  } catch (err) {
    err.code = 401;
    console.error(err);

    next(err);
  }
});

export default router;