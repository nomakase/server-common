import express from "express";
import OAuth from "../auth/OAuth";
import { DuplicatedEmailError, InvalidOAuthTokenError, MissingPrameterError, OAuthPermissionError } from "../errors";
import { Manager } from "../entities/Manager";

const router = express.Router();

router.post("/:authServer", async (req, res, next) => {
  const authServer = OAuth[req.params.authServer?.toLowerCase()]?.create();
  const oauthToken = req.body.OAuthToken;

  if (!oauthToken) return next(MissingPrameterError);

  let isAuthenticated;
  try {
    isAuthenticated = await authServer.authenticate(oauthToken);
  } catch (error) {
    console.error(error);
    return next(error);
  }

  if (!isAuthenticated) return next(InvalidOAuthTokenError);

  const email = authServer.getUserInfo();
  if (!email) return next(OAuthPermissionError);

  let managerId: number;
  try {
    const insertResult = await Manager.insert({ email })

    // TODO: 해당 유저 ID로 자동로그인할 수 있도록 합니다.
    managerId = insertResult.identifiers[0].id;
  } catch (error) {
    // console.log(err);
    if (error.errno === 1062) {
      next(DuplicatedEmailError);
    }
    return;
  }

  return res.json({ id: managerId })
});

export default router;