import { SignInBody } from "@custom-types/express";
import JWT, { AccessTokenPayload } from "../auth/JWT";
import OAuth from "../auth/OAuth/interface/OAuth";
import { Manager } from "../entities/Manager";
import { InvalidOAuthTokenError, OAuthPermissionError, InvalidRefreshTokenError, NoMatchedUserError, AnotherDeviceDetectedError } from "../errors";

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
    // TODO: Need to handle more error.
    
    // Verify refresh Token. And this should be prior to verifying jti.
    try {
      JWT.verifyRefresh(_refreshToken, _accessToken, deviceID);
    } catch (err) {
      throw InvalidRefreshTokenError;
    }
    
    // Verify using jti claim.
    let decodedUserInfo;
    try {
      decodedUserInfo = JWT.decodeAccess(_accessToken, true) as AccessTokenPayload;
      const user = await Manager.findOneByEmail(decodedUserInfo.email);
      if (!user) {
        throw NoMatchedUserError;
      }
      
      const jti = (JWT.decodeRefresh(_refreshToken) as any).jti;
      if (user.refreshTokenID !== jti) {
        throw AnotherDeviceDetectedError;
      }
    } catch (err) {
      throw err;
    }
    
    // Return updated user info.
    return this._updateTokenInfo(decodedUserInfo.email, deviceID);
  }

  private async _updateTokenInfo(email: string, deviceID: string) {
    let userToSignIn = await Manager.findOneByEmail(email);
    if (!userToSignIn) {
      throw NoMatchedUserError;
    }

    if (userToSignIn.accessTokenID || userToSignIn.refreshTokenID) {
      JWT.revokeTokenpair(
        userToSignIn.accessTokenID,
        userToSignIn.refreshTokenID
      );
    }

    const { accessToken, refreshToken } = JWT.signTokenPair(email, deviceID);
    const accessTokenID = (JWT.decodeAccess(accessToken) as any).jti;
    const refreshTokenID = (JWT.decodeRefresh(refreshToken) as any).jti ;
    
    userToSignIn.accessTokenID = accessTokenID;
    userToSignIn.refreshTokenID = refreshTokenID;
    
    await userToSignIn.save();
    
    const isSubmitted = userToSignIn.isSubmitted;
    const isApproved = userToSignIn.isApproved;
    return {accessToken, refreshToken, isSubmitted , isApproved} as SignInBody;
  }
}
