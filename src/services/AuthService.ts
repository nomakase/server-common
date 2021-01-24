import hash from "../utils/hash";
import OAuth from "../auth/OAuth/interface/OAuth";
import { Manager } from "../entities/Manager";
import JWT, { AccessTokenPayload, RefreshTokenPayload } from "../auth/JWT";

export default class AuthService {
  constructor(private oauth?: OAuth) {}

  async signIn(tokenOrAccessCode: string, deviceID: string) {
    if (!(await this.oauth?.authenticate(tokenOrAccessCode))) {
      const error = new Error("Invalid user signature.");
      error.name = "InvalidUserSigError";

      throw error;
    }

    // In case user disallows to access email info. 
    const email = this.oauth?.getUserInfo();
    if (!email) {
      const error = new Error("Email required.");
      error.name = "NoEmailError";

      throw error;
    }

    let userToSignIn = await Manager.findOne({ where: { email: email } });
    if (!userToSignIn) {
      const error = new Error("Not registered user.");
      error.name = "NoMatchedUserError";

      throw error;
    }

    if (userToSignIn.accessToken || userToSignIn.refreshToken) {
      this._revokeTokenpair(userToSignIn.accessToken, userToSignIn.refreshToken)
    }

    // Update token info.
    const {accessToken, refreshToken} = this._signTokenPair(email, deviceID)
    userToSignIn.accessToken = accessToken;
    userToSignIn.refreshToken = refreshToken;
    await userToSignIn.save();

    return userToSignIn as Pick<Manager, "accessToken" | "refreshToken" | "isSubmitted" | "isApproved">;
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

      return this._signTokenPair(decodedUserInfo.email, deviceID);
    } catch (error) {
      throw error;
    }
  }

  private _revokeTokenpair(accessToken: string, refreshToken: string) {
    // TODO: If tokens are still valid, revoke the both of tokens by inserting in Redis.
    accessToken;
    refreshToken;
  }

  private _signTokenPair(email: string, deviceID: string) {
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
