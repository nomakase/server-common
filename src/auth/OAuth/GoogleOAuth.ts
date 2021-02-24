import { OAuth2Client, TokenPayload } from "google-auth-library";
import OAuth from "./interface/OAuth";

export default class GoogleOAuth implements OAuth {
  readonly serverName = "google";

  // OAuth2Client must be static.
  private static readonly CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
  private static client = new OAuth2Client(GoogleOAuth.CLIENT_ID);

  private tokenPayload?: TokenPayload;

  async authenticate(token: string) {
    const ticket = await GoogleOAuth.client.verifyIdToken({
      idToken: token,
      audience: GoogleOAuth.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const tokenPayload = ticket.getPayload();
    if (tokenPayload){
      this.tokenPayload = tokenPayload;
      return true;
    }
    
    return false;
  }

  getUserInfo() {
    return this.tokenPayload?.email ? this.tokenPayload.email : null;
  }
}
