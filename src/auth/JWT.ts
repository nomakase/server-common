import jwt from "jsonwebtoken";
import hash from "../utils/hash";
import { AccessTokenPayload, JwtPayload, RefreshTokenPayload } from "@custom-types/jsonwebtoken";

export default class JWT {
  private static secretKeyA = process.env.ACCESS_SECRET as jwt.Secret;
  private static secretKeyR = process.env.REFRESH_SECRET as jwt.Secret;
  private static secretKeyU = process.env.USER_SECRET as jwt.Secret;

  private static optionsA = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    issuer: process.env.TOKEN_ISSUER,
    subject: process.env.TOKEN_SUBJECT,
  };

  private static optionsR = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    issuer: process.env.TOKEN_ISSUER,
    subject: process.env.TOKEN_SUBJECT,
  };

  private static optionsU =  {
    expiresIn: process.env.USER_TOKEN_EXPIRE,
    issuer: process.env.TOKEN_ISSUER,
    subject: process.env.TOKEN_SUBJECT,  
  };

  /* ACCESS TOKEN */
  static signAccess = (payload: AccessTokenPayload, jwtID?: string) => {
    return jwt.sign({ payload }, JWT.secretKeyA, {
      jwtid: jwtID || JWT._generateJWTID(payload.email),
      ...JWT.optionsA
    });
  }

  static verifyAccess = (token: string) => {
    try {
      return jwt.verify(token, JWT.secretKeyA) as JwtPayload<AccessTokenPayload>;
    } catch (error) {
      return null;
    }
  };
  
  static decodeAccess = (token: string, extractPayload: boolean = false) => {  
    try {
      const decodeAccess = jwt.verify(token, JWT.secretKeyA, {ignoreExpiration: true}) as JwtPayload<AccessTokenPayload>;
      if (extractPayload){
        return decodeAccess.payload;
      }
      
      return decodeAccess;
    } catch (error) {
      return null;
    }
  }
  
  static getAccessTokenRemainingTime(token: string) {
    const decodedAccessToken = JWT.decodeAccess(token) as JwtPayload<AccessTokenPayload>;
    let remaining = 0;
    if (decodedAccessToken?.exp) {
      remaining = decodedAccessToken.exp - Math.floor(Date.now()/1000);
    }

    return remaining > 0 ? remaining : 0;
  }

  /* REFRESH TOKEN */
  static signRefresh = (payload: RefreshTokenPayload, jwtID?: string) => {
    return jwt.sign({ payload }, JWT.secretKeyR, {
      // Not important which values to be used for generating jti, just have to keep it unique.
      jwtid: jwtID || JWT._generateJWTID(payload.deviceID),
      ...JWT.optionsR
    });
  }
    
  static verifyRefresh = (
    refreshToken: string,
    accessToken: string,
    deviceID: string
  ) => {
    try {
      const decodedAccessToken = JWT.decodeAccess(accessToken) as JwtPayload<AccessTokenPayload>;
      const accessTokenID = decodedAccessToken.jti;

      const decodedRefreshToken = jwt.verify(refreshToken, JWT.secretKeyR) as JwtPayload<RefreshTokenPayload>;
      const refreshTokenPayload = decodedRefreshToken.payload;

      // Check token pair using jti and deviceID.
      if (
        refreshTokenPayload.deviceID == deviceID &&
        refreshTokenPayload.hashedAccessTokenID == hash(accessTokenID)
      ) {
        
        return decodedRefreshToken;
      } else {
        const error = new Error("Invalid token payload.");
        error.name = "InvalidTokenPayloadError";

        throw error;
      }
    } catch (error) {
      return null;
    }
  };
  
  static decodeRefresh = (token: string) => {
    try {
      return jwt.verify(token, JWT.secretKeyR, {ignoreExpiration: true}) as JwtPayload<RefreshTokenPayload>;
    } catch (error) {
      return null;
    }
  }
  
  static getRefreshTokenRemainingTime(token: string) {
    const decodedRefreshToken = JWT.decodeRefresh(token) as JwtPayload<RefreshTokenPayload>;
    let remaining = 0;
    if (decodedRefreshToken?.exp) {
      remaining = decodedRefreshToken.exp - Math.floor(Date.now()/1000);
    }

    return remaining > 0 ? remaining : 0;
  }

  /* USER_TOKEN */
  static signUser = () => {
    return jwt.sign({}, JWT.secretKeyU, JWT.optionsU)
  }

  static verifyUser = (token: string) => {
    try {
      return jwt.verify(token, JWT.secretKeyU);
    } catch (error) {
      return null;
    }
  }

  static signTokenPair = (email: string, deviceID: string) => {
    const accessTokenPayload: AccessTokenPayload = { email };
    const accessTokenID = JWT._generateJWTID(email)
    const accessToken = JWT.signAccess(accessTokenPayload, accessTokenID);

    // Use hashed access token.
    const refreshTokenPayload: RefreshTokenPayload = {
      hashedAccessTokenID: hash(accessTokenID),
      deviceID,
    };
    const refreshToken = JWT.signRefresh(refreshTokenPayload);

    return { accessToken, refreshToken };
  }

  private static _generateJWTID(email: string){
    return hash(email + Date.now());
  }
}

