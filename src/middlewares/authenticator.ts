import { Request, Response, NextFunction } from "express";
import JWT from "../auth/JWT";
import { NoTokenError, InvalidAccessTokenError, AnotherDeviceDetectedError } from "../errors";
import { Blacklist } from "../entities/Blacklist";
import { AuthorizedRequest } from "@custom-types/express";
import { TokenReason } from "../tokenStore";
import { Whitelist } from "../entities/Whitelist";

/**
 * @description verifies access token given from the request 
 * and extracts owner's info from decoded access token if the token is valid.
 * After verifying the token, type of request will be `AuthorizedRequest`, which contains
 * identifier field.  
 */
async function owner(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization
  if (!accessToken) {
    return next(NoTokenError);
  }
  
  const decoded = JWT.verifyAccess(accessToken);
  if (!decoded) {
    return next(InvalidAccessTokenError);
  }
  
  const reason = await Blacklist.findAccessToken(decoded.jti)
  if (reason) {
    if (reason == TokenReason.REASON_NEW_SIGNIN) {
      return next(AnotherDeviceDetectedError);
    } else {
      return next(InvalidAccessTokenError);
    }
  }
  
  (<AuthorizedRequest>req).Identifier = decoded.payload;
  next();
}

async function user(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const userToken = req.headers.authorization
  if (!userToken) {
    return next(NoTokenError);
  }

  const decoded = JWT.verifyUser(userToken);
  if (!decoded) {
    return next(InvalidAccessTokenError);
  }

  next();
}

async function admin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return next(NoTokenError);
  }
  
  const decoded = JWT.verifyAccess(accessToken);
  if (!decoded) {
    return next(InvalidAccessTokenError);
  }

  const isValid = Whitelist.findAdminToken(decoded.jti);
  if (!isValid) {
    return next(InvalidAccessTokenError);
  }

  (<AuthorizedRequest>req).Identifier = decoded.payload;
  next();
}

export default { owner, user, admin };
