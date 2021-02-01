import { SignInBody } from "@custom-types/express";
import JWT from "../auth/JWT";
import OAuth from "../auth/OAuth/interface/OAuth";
import { Manager } from "../entities/Manager";
import { InvalidOAuthTokenError, OAuthPermissionError, InvalidRefreshTokenError, NoMatchedUserError } from "../errors";

// TODO: Need to refactor for reusability.(divide)

export default class AuthService {
  constructor(private oauth?: OAuth) { }

  async signIn(tokenOrAccessCode: string, deviceID: string) {
    if (!(await this.oauth?.authenticate(tokenOrAccessCode))) {
      throw InvalidOAuthTokenError;
    }

    // In case user disallows to access email info.
    const email = this.oauth?.getUserInfo();
    if (!email) {
      throw OAuthPermissionError;
    }

    // Return updated user info.
    return this._updateTokenInfo(email, deviceID);
  }

  /**
   * This function enables the user to auto-signin with refresh token saved in the device.
   **/
  async signInAuto(_refreshToken: string, _accessToken: string, deviceID: string) {

    // TODO: Search refresh token in Redis. If exists, token is not valid.

    const decodedUserInfo = (() => {
      try {
        return JWT.verifyRefresh(
          _refreshToken,
          _accessToken,
          deviceID
        );
      } catch (err) {
        console.log(err);
        throw InvalidRefreshTokenError;
      }
    })();

    // Return updated user info.
    return this._updateTokenInfo(decodedUserInfo.email, deviceID);
  }

  private async _updateTokenInfo(email: string, deviceID: string) {
    let userToSignIn = await Manager.findOneByEmail(email);
    if (!userToSignIn) {
      throw NoMatchedUserError;
    }

    if (userToSignIn.accessToken || userToSignIn.refreshToken) {
      JWT.revokeTokenpair(
        userToSignIn.accessToken,
        userToSignIn.refreshToken
      );
    }

    const { accessToken, refreshToken } = JWT.signTokenPair(email, deviceID);
    userToSignIn.accessToken = accessToken;
    userToSignIn.refreshToken = refreshToken;
    await userToSignIn.save();

    return userToSignIn as SignInBody;
  }
}
