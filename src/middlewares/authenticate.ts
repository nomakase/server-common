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
    if (!accessToken) {
      throw new Error(
        "Missing access token to verify in Authorization header."
      );
    }
    JWT.verifyAccess(accessToken);
    next();
    
  } catch (err) {
    err.code = 401;
    console.error(err);

    next(err);
  }
}
