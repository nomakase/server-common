import JWT, { AccessTokenPayload } from "../auth/JWT";
import OAuth from "../auth/OAuth/interface/OAuth";
import { Manager } from "../entities/Manager";
import { InvalidOAuthTokenError, OAuthPermissionError, 
  InvalidRefreshTokenError, NoMatchedUserError, 
  AnotherDeviceDetectedError, InvalidAccessTokenError } from "../errors";

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
    
    const { accessToken, refreshToken } = JWT.signTokenPair(email, deviceID);
    
    const updatedUser = await this._updateTokenInfo(email, accessToken, refreshToken);
    const { isSubmitted, isApproved } = updatedUser;
    
    return { accessToken, refreshToken, isSubmitted, isApproved };
  }

  /**
   * This function enables the user to auto-signin with refresh token saved in the device.
   **/
  async signInAuto(_refreshToken: string, _accessToken: string, deviceID: string) {

    // Check access token can be decoded.
    const decodedUserInfo = JWT.decodeAccess(_accessToken, true) as AccessTokenPayload;
    if (!decodedUserInfo) {
      throw InvalidAccessTokenError;
    }
    
    // Verify refresh Token. And this should be prior to verifying jti.
    const decodedRefreshToken = JWT.verifyRefresh(_refreshToken, _accessToken, deviceID);
    if (!decodedRefreshToken) {
      throw InvalidRefreshTokenError;
    }
    
    const user = await Manager.findOneByEmail(decodedUserInfo.email);
    if (!user) {
      throw NoMatchedUserError;
    }
    
    // Verify using jti claim.
    const jti = decodedRefreshToken.jti;
    if (user.refreshTokenID !== jti) {
      throw AnotherDeviceDetectedError;
    }
    
    const { accessToken, refreshToken } = JWT.signTokenPair(decodedUserInfo.email, deviceID);
    
    const updatedUser = await this._updateTokenInfo(user, accessToken, refreshToken);
    const { isSubmitted, isApproved } = updatedUser;
    
    return { accessToken, refreshToken, isSubmitted, isApproved };
  }

  private async _updateTokenInfo(user: string | Manager, accessToken: string, refreshToken: string) {
    const userToSignIn = 
      (typeof user === "string") ? await Manager.findOneByEmail(user) : user;
    if (!userToSignIn) {
      throw NoMatchedUserError;
    }

    if (userToSignIn.accessTokenID || userToSignIn.refreshTokenID) {
      JWT.revokeTokenpair(
        userToSignIn.accessTokenID,
        userToSignIn.refreshTokenID
      );
    }

    const accessTokenID = (JWT.decodeAccess(accessToken) as any).jti;
    const refreshTokenID = (JWT.decodeRefresh(refreshToken) as any).jti ;
    userToSignIn.accessTokenID = accessTokenID;
    userToSignIn.refreshTokenID = refreshTokenID;
    
    await userToSignIn.save();
    
    return userToSignIn;
  }
}
