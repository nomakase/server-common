import express from "express";
import { SignInResponse } from "@custom-types/express";
import OAuth from "../auth/OAuth";
import { MissingParameterError } from "../errors";
import AuthService from "../services/AuthService";

const router = express.Router();

router.post(
  "/signIn/:authServer",
  async (
    req,
    res: SignInResponse,
    next
  ) => {
    const authServer = OAuth[req.params.authServer?.toLowerCase()];
    const oauthToken = req.body.OAuthToken;
    const deviceID = req.body.deviceID;

    try {
      if (!(authServer && deviceID && oauthToken)) {
        throw MissingParameterError;
      }

      const signedInUser = await AuthService.signIn(
        authServer.create(),
        oauthToken,
        deviceID
      );

      console.log("signIn: success.");
      console.log("acces : " + signedInUser.accessToken);
      console.log("refre : " + signedInUser.refreshToken);
      console.log("devID : " + deviceID);
      
      res.json(signedInUser);
    } catch (err) {
      console.error(err);

      next(err);
    }
  }
);

router.post("/signInAuto", async (req, res: SignInResponse, next) => {
  const accessToken = req.body.accessToken;
  const refreshToken = req.body.refreshToken;
  const deviceID = req.body.deviceID;

  try {
    if (!(accessToken && refreshToken && deviceID)) {
      throw MissingParameterError;
    }

    const signedInUser = await AuthService.signInAuto(
      refreshToken,
      accessToken,
      deviceID
    );

    console.log("signInAuto: success.");
    res.json(signedInUser);
  } catch (err) {
    console.error(err);

    next(err);
  }
});

export default router;
