import jwt from "jsonwebtoken";
import hash from "../utils/hash";

export default class JWT {
  private static secretKeyA = process.env.ACCESS_SECRET as jwt.Secret;
  private static secretKeyR = process.env.REFRESH_SECRET as jwt.Secret;

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

  /* ACCESS TOKEN */
  static signAccess = (payload: AccessTokenPayload, jwtID?: string) => {
    return jwt.sign({ payload }, JWT.secretKeyA, {
      jwtid: jwtID || JWT._generateJWTID(payload.email),
      ...JWT.optionsA
    });
  }

  static verifyAccess = (token: string) => {
    try {
      return jwt.verify(token, JWT.secretKeyA);
    } catch (error) {
      return null;
    }
  };
  
  static decodeAccess = (token: string, extractPayload: boolean = false) => {
    try {
      if (extractPayload){
        const payload = (jwt.verify(token, JWT.secretKeyA, {ignoreExpiration: true}) as any).payload;
        return new AccessTokenPayload(payload._email);
      }
      
      return jwt.verify(token, JWT.secretKeyA, {ignoreExpiration: true});
    } catch (error) {
      return null;
    }
  }
  
  static getAccessTokenRemainingTime(token: string) {
    const decodedAccessToken = JWT.decodeAccess(token) as any;
    const remaining = decodedAccessToken.exp - Math.floor(Date.now()/1000);
    
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
      const decodedAccessToken = JWT.decodeAccess(accessToken) as any;
      const accessTokenID = decodedAccessToken.jti;

      const decodedRefreshToken = jwt.verify(refreshToken, JWT.secretKeyR) as any;
      const refreshTokenPayload = decodedRefreshToken.payload;

      // Check token pair using jti and deviceID.
      if (
        refreshTokenPayload._deviceID == deviceID &&
        refreshTokenPayload._hashedAccessTokenID == hash(accessTokenID)
      ) {
        
        return decodedRefreshToken;
      } else {
        const error = new Error("Invalid token payload.");
        error.name = "InvalidTokenPayloadError";

        throw error;
      }
    } catch (error) {
      throw null;
    }
  };
  
  static decodeRefresh = (token: string) => {
    try {
      return jwt.verify(token, JWT.secretKeyR, {ignoreExpiration: true});
    } catch (error) {
      throw null;
    }
  }
  
  static getRefreshTokenRemainingTime(token: string) {
    const decodedRefreshToken = JWT.decodeRefresh(token) as any;
    const remaining = decodedRefreshToken.exp - Math.floor(Date.now()/1000);
    
    return remaining > 0 ? remaining : 0;
  }

  static signTokenPair = (email: string, deviceID: string) => {
    const accessTokenPayload = new AccessTokenPayload(email);
    const accessTokenID = JWT._generateJWTID(email)
    const accessToken = JWT.signAccess(accessTokenPayload, accessTokenID);

    // Use hashed access token.
    const refreshTokenPayload = new RefreshTokenPayload(
      hash(accessTokenID),
      deviceID
    );
    const refreshToken = JWT.signRefresh(refreshTokenPayload);

    return { accessToken, refreshToken };
  }

  private static _generateJWTID(email: string){
    return hash(email + Date.now());
  }
}

// TODO: change into type
class AccessTokenPayload {
  private readonly _email: string;

  constructor(email: string) {
    this._email = email;
  }

  get email(): string {
    return this._email;
  }
}

class RefreshTokenPayload {
  private readonly _hashedAccessTokenID: string;
  private readonly _deviceID: string;

  constructor(hashedAccessTokenID: string, deviceID: string) {
    this._hashedAccessTokenID = hashedAccessTokenID;
    this._deviceID = deviceID;
  }

  get hashedAccessTokenID(): string {
    return this._hashedAccessTokenID;
  }

  get deviceID(): string {
    return this._deviceID;
  }
}

export { AccessTokenPayload, RefreshTokenPayload };
