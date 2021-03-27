import JWT from "../auth/JWT";
import OAuth from "../auth/OAuth/interface/OAuth";
import { Manager } from "../entities/Manager";
import { InvalidOAuthTokenError, OAuthPermissionError, 
  InvalidRefreshTokenError, NoMatchedUserError, 
  AnotherDeviceDetectedError, InvalidAccessTokenError } from "../errors";
import { Blacklist } from "../entities/Blacklist";
import { AccessTokenPayload, JwtPayload, RefreshTokenPayload } from "@custom-types/jsonwebtoken";
import { TokenReason } from "../tokenStore";
import hash from "../utils/hash";

// TODO: Need to refactor for reusability.(divide)

export default class AuthService {
  
  static async signIn(authServer: OAuth, tokenOrAccessCode: string, deviceID: string) {
    if (!(await authServer.authenticate(tokenOrAccessCode))) {
      throw InvalidOAuthTokenError;
    }

    // In case user disallows to access email info.
    const email = authServer.getUserInfo();
    if (!email) {
      throw OAuthPermissionError;
    }
    
    const userToSignIn = await this.getUser(email);
    if (userToSignIn.accessTokenID) {
      await this._revokeAccessToken(userToSignIn.accessTokenID, TokenReason.REASON_NEW_SIGNIN);
    }
    
    const { accessToken, refreshToken } = JWT.signTokenPair(email, deviceID);
    const { isSubmitted, isApproved } = await this._updateTokenInfo(userToSignIn, accessToken, refreshToken);
    
    return { accessToken, refreshToken, isSubmitted, isApproved };
  }

  /**
   * This function enables the user to auto-signin with refresh token saved in the device.
   **/
  static async signInAuto(_refreshToken: string, _accessToken: string, deviceID: string) {

    // Check access token can be decoded.
    const decodedUserInfo = JWT.decodeAccess(_accessToken, true) as AccessTokenPayload;
    if (!decodedUserInfo) {
      throw InvalidAccessTokenError;
    }
    
    // Verify refresh Token. This should be prior to verifying jti.
    const decodedRefreshToken = JWT.verifyRefresh(_refreshToken, _accessToken, deviceID);
    if (!decodedRefreshToken) {
      throw InvalidRefreshTokenError;
    }
    
    const userToSignIn = await this.getUser(decodedUserInfo.email)
    
    // Verify using jti claim.
    const jti = decodedRefreshToken.jti;
    if (userToSignIn.refreshTokenID !== jti) {
      throw AnotherDeviceDetectedError;
    }
    
    if (userToSignIn.accessTokenID) {
      const remaining = JWT.getAccessTokenRemainingTime(_accessToken);
      await this._revokeAccessToken(userToSignIn.accessTokenID, TokenReason.REASON_REFRESH, remaining);
    }
    
    const { accessToken, refreshToken } = JWT.signTokenPair(decodedUserInfo.email, deviceID);
    const { isSubmitted, isApproved } = await this._updateTokenInfo(userToSignIn, accessToken, refreshToken);
    
    return { accessToken, refreshToken, isSubmitted, isApproved };
  }
  
  static async signOut(accessToken: string) {
    const decodeAccess = JWT.decodeAccess(accessToken) as JwtPayload<AccessTokenPayload>;

    const accessTokenID = decodeAccess.jti;
    const remaining = JWT.getAccessTokenRemainingTime(accessToken);
    await this._revokeAccessToken(accessTokenID, TokenReason.REASON_SIGNOUT, remaining);
    
    const decodedUserInfo = decodeAccess.payload;
    await this._updateTokenInfo(decodedUserInfo.email, null, null);
    
    return true;
  }

  static async unregisterUser(email: string){
    const userToUnregister = await this.getUser(email);
    userToUnregister.remove();

    return true;
  }

  static generateUID(...params: any[]) {
    const delimiter = ":";   
    let uid = "";
    for (const p of params) {
      uid += p.toString() + delimiter;
    }
    
    return uid ? hash(uid.substring(0, uid.length-1)) : null;
  }

  private static async _updateTokenInfo(user: string | Manager, accessToken: string | null, refreshToken: string | null) {
    const userToSignIn = 
      (typeof user === "string") ? await this.getUser(user) : user;
    
    const accessTokenID = accessToken ? (JWT.decodeAccess(accessToken) as JwtPayload<AccessTokenPayload>).jti : null;
    const refreshTokenID = refreshToken ? (JWT.decodeRefresh(refreshToken) as JwtPayload<RefreshTokenPayload>).jti : null;
    userToSignIn.accessTokenID = accessTokenID;
    userToSignIn.refreshTokenID = refreshTokenID;
    
    await userToSignIn.save();
    
    return userToSignIn;
  }
  
  static async getUser(email: string) {
    const user = await Manager.findOneByEmail(email);
    if (!user) {
      throw NoMatchedUserError;
    }
    return user;
  }
  
  private static async _revokeAccessToken(accessTokenID: string, reason: string, tokenRemaining: number = Blacklist.MAX_REMAINING) {
    if (tokenRemaining > 0) {
      await Blacklist.addAccessToken(accessTokenID, reason, tokenRemaining);
    }
  }
}
