import JWT from "../auth/JWT";
import { Request, Response, NextFunction } from "express";

const AUTH_SCHEME = "Bearer ";
export default function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.headers.authorization?.split(AUTH_SCHEME)[1];
    if (accessToken) {
      JWT.verifyAccess(accessToken);
    } else {
      throw new Error(
        "Missing access token to verify in Authorization header."
      );
    }
  } catch (err) {
    err.code = 401;
    console.error(err);

    next(err);
  }

  next();
}
