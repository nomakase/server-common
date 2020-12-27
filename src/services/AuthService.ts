import OAuth from "../auth/interface/OAuth";
import JWT from "../auth/JWT";

export default class AuthService {
    
    private jwt = new JWT();
    
    constructor(private oauth: OAuth) {}
    
    signIn(tokenOrAccessCode: string, deviceID: string) {
        if (!this.oauth.authenticate(tokenOrAccessCode)) {
            let error = new Error("Invalid user signature.");
            error.name = "InvalidUserSigError";
            
            throw error;
        }

        // TODO: Check the user info exists in our DB.
        const email = this.oauth.getUserInfo();
        let exist = true
        
        if (!exist) {
            let error = new Error("Not registered user.");
            error.name = "NoMatchedUserError";
            
            throw error;
        }
        
        return this.signTokenPair(email, deviceID);
    }
    
    private signTokenPair(email: string, deviceID: string) {
        let accessTokenPayload = { "email": email };
        let accessToken = this.jwt.signAccess(accessTokenPayload);
            
        // TODO: Hash access token
        let hashedAccessToken = accessToken+"";
            
        let refreshTokenPayload = { 
            "hashed": hashedAccessToken,
            "device": deviceID
        };
        let refreshToken = this.jwt.signRefresh(refreshTokenPayload);
        
        return {accessToken, refreshToken};
    }
}