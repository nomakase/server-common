import { OAuth2Client, TokenPayload } from "google-auth-library";
import OAuth from "./interface/OAuth";

export default class GoogleOAuth implements OAuth {
  private readonly CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;

  private userInfo?: TokenPayload;
  private client = new OAuth2Client(this.CLIENT_ID);

  readonly serverName = "google";

  async authenticate(token: string) {
    let ticket: any = {};
    ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: this.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const userInfo = ticket.getPayload();
    if (userInfo){
      this.userInfo = userInfo;
      return true;
    }
    
    return false;
  }

  getUserInfo() {
    return this.userInfo?.email ? this.userInfo.email : null;
  }
}
