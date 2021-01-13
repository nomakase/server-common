import OAuth from "../auth/interface/OAuth";
import JWT, { AccessTokenPayload, RefreshTokenPayload } from "../auth/JWT";

export default class AuthService {
  private jwt = new JWT();

  constructor(private oauth?: OAuth) {}

  async signIn(tokenOrAccessCode: string, deviceID: string) {
    if (!(await this.oauth?.authenticate(tokenOrAccessCode))) {
      const error = new Error("Invalid user signature.");
      error.name = "InvalidUserSigError";

      throw error;
    }

    // TODO: Check the user info exists in our DB.
    const email = this.oauth?.getUserInfo();
    let exist = true;

    if (!email || !exist) {
      const error = new Error("Not registered user.");
      error.name = "NoMatchedUserError";

      throw error;
    }

    return this.signTokenPair(email, deviceID);
  }

  /**
   * This function enables the user to auto-signin with refresh token saved in the device.
   **/
  signInAuto(refreshToken: string, accessToken: string, deviceID: string) {
    try {
      const decodedUserInfo: any = this.jwt.verifyRefresh(
        refreshToken,
        accessToken,
        deviceID
      );

      return this.signTokenPair(decodedUserInfo.email, deviceID);
    } catch (error) {
      throw error;
    }
  }

  private signTokenPair(email: string, deviceID: string) {
    const accessTokenPayload = new AccessTokenPayload(email);
    const accessToken = this.jwt.signAccess(accessTokenPayload);

    // TODO: Hash access token
    const hashedAccessToken = accessToken + "";

    const refreshTokenPayload = new RefreshTokenPayload(
      hashedAccessToken,
      deviceID
    );
    const refreshToken = this.jwt.signRefresh(refreshTokenPayload);

    return { accessToken, refreshToken };
  }
}
