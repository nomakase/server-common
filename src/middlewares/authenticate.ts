import { Request, Response, NextFunction } from "express";
import JWT from "../auth/JWT";
import { NoTokenError, InvalidAccessTokenError } from "../errors";

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
  
  const res = JWT.verifyAccess(accessToken);
  if (!res) {
    next(InvalidAccessTokenError);
    return;
  }
  
  next();
}
