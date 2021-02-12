import { Request, Response, NextFunction } from "express";
import JWT from "../auth/JWT";
import { NoTokenError, InvalidAccessTokenError, AnotherDeviceDetectedError } from "../errors";
import { BlackList } from "../entities/BlackList";
import { AccessTokenPayload, JwtPayload } from "@custom-types/jsonwebtoken";
import { AuthorizedRequest } from "@custom-types/express";

/**
 * @description verifies access token given from the request 
 * and extracts user's info from decoded access token if the token is valid.
 * After verifying the token, type of request will be `AuthorizedRequest`, which contains
 * identifier field.  
 */
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
  
  (<AuthorizedRequest>req).Identifier = decoded.payload;
  next();
}
