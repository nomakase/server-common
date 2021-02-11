import { Request, Response, NextFunction } from "express";
import JWT from "../auth/JWT";
import { NoTokenError, InvalidAccessTokenError, AnotherDeviceDetectedError } from "../errors";
import { BlackList } from "../entities/BlackList";
import { AccessTokenPayload, JwtPayload } from "@custom-types/jsonwebtoken";

export default async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization
  if (!accessToken) {
    next(NoTokenError);
    return;
  }
  
  const decoded = JWT.verifyAccess(accessToken) as JwtPayload<AccessTokenPayload>;
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
