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
  signAccess = (payload: object) =>
    jwt.sign(payload, this.secretKeyA, this.optionsA);
  verifyAccess = (token: string) => {
    try {
      jwt.verify(token, this.secretKeyA);
    } catch (error) {
      throw error;
    }
  };

  /* REFRESH TOKEN */
  signRefresh = (payload: object) =>
    jwt.sign(payload, this.secretKeyR, this.optionsR);
  verifyRefresh = (
    refreshToken: string,
    accessToken: string,
    deviceID: string
  ) => {
    try {
      const payload: any = jwt.verify(refreshToken, this.secretKeyR);

      if (payload.androidID == deviceID && payload.accessToken == accessToken) {
        return jwt.decode(payload.accessToken);
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
