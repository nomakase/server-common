import express from "express";
import AuthService from "../services/AuthService";
import GoogleOAuth from "../auth/GoogleOAuth";
const router = express.Router();

router.post("/signIn", async (req, res, next) => {
  const oauthToken = req.body.OAuthToken;
  const deviceID = req.body.deviceID;
  const auth = new AuthService(new GoogleOAuth());

  try {
    const { accessToken, refreshToken } = await auth.signIn(
      oauthToken,
      deviceID
    );
    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    // TODO: deal with err separately
    console.log(err);
    next({ code: 403 });
  }
});

export default router;
