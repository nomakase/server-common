import hash from "../utils/hash";
import OAuth from "../auth/OAuth/interface/OAuth";
import JWT, { AccessTokenPayload, RefreshTokenPayload } from "../auth/JWT";

export default class AuthService {
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
      const decodedUserInfo: any = JWT.verifyRefresh(
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
    const accessToken = JWT.signAccess(accessTokenPayload);

    // Use hashed access token.
    const refreshTokenPayload = new RefreshTokenPayload(
      hash(accessToken),
      deviceID
    );
    const refreshToken = JWT.signRefresh(refreshTokenPayload);

    return { accessToken, refreshToken };
  }
}
