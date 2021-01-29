import JWT from "src/auth/JWT";
import { Request, Response, NextFunction } from "express";
import { InvalidAccessTokenError, NoTokenError } from "src/errors";

const AUTH_SCHEME = "Bearer ";
export default function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization?.split(AUTH_SCHEME)[1];
  if (!accessToken) {
    next(NoTokenError);
    return;
  }

  try {
    JWT.verifyAccess(accessToken);
  } catch (err) {
    console.error(err);
    next(InvalidAccessTokenError);
    return;
  }
  next();
}
