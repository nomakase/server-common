import { Request, Response, NextFunction } from "express";
import JWT from "../auth/JWT";
import { NoTokenError, InvalidAccessTokenError, AnotherDeviceDetectedError } from "../errors";
import { BlackList } from "../entities/BlackList";

const AUTH_SCHEME = "Bearer ";
export default async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization?.split(AUTH_SCHEME)[1];
  if (!accessToken) {
    next(NoTokenError);
    return;
  }
  
  const decoded: any = JWT.verifyAccess(accessToken);
  if (!decoded) {
    next(InvalidAccessTokenError);
    return;
  }
  
  const reason = await BlackList.findAccessToken(decoded.jti)
  if (reason) {
    if (reason == BlackList.REASON_NEW_SIGNIN) {
      next(AnotherDeviceDetectedError);
      return;
    } else {
      next(InvalidAccessTokenError);
      return;
    }
  }
    
  next();
}
