import jwt from "jsonwebtoken";

export default class JWT {
  private secretKeyA = process.env.ACCESS_SECRET + "";
  private secretKeyR = process.env.REFRESH_SECRET + "";

  private optionsA = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    issuer: process.env.TOKEN_ISSUER,
    subject: process.env.TOKEN_SUBJECT,
  };

  private optionsR = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    issuer: process.env.TOKEN_ISSUER,
    subject: process.env.TOKEN_SUBJECT,
  };

  /* ACCESS TOKEN */
  signAccess = (payload: AccessTokenPayload) =>
    jwt.sign(payload, this.secretKeyA, this.optionsA);
  verifyAccess = (token: string) => {
    try {
      jwt.verify(token, this.secretKeyA);
    } catch (error) {
      throw error;
    }
  };

  /* REFRESH TOKEN */
  signRefresh = (payload: RefreshTokenPayload) =>
    jwt.sign(payload, this.secretKeyR, this.optionsR);
  verifyRefresh = (
    refreshToken: string,
    accessToken: string,
    deviceID: string
  ) => {
    try {
      const payload: RefreshTokenPayload = <RefreshTokenPayload>(
        jwt.verify(refreshToken, this.secretKeyR)
      );

      // TODO: hash {accessToken} and compare with {payload.hashedToken}
      if (payload.deviceID == deviceID && payload.hashedToken == accessToken) {
        return jwt.decode(accessToken);
      } else {
        let error = new Error("Invalid client info.");
        error.name = "InvalidClientError";

        throw error;
      }
    } catch (error) {
      throw error;
    }
  };
}

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
  private readonly _hashedToken: string;
  private readonly _deviceID: string;

  constructor(hashedToken: string, deviceID: string) {
    this._hashedToken = hashedToken;
    this._deviceID = deviceID;
  }

  get hashedToken(): string {
    return this._hashedToken;
  }

  get deviceID(): string {
    return this._deviceID;
  }
}

export { AccessTokenPayload, RefreshTokenPayload };
