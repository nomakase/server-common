import { OAuth2Client, TokenPayload } from "google-auth-library";
import OAuth from "./interface/OAuth";

export default class GoogleOAuth implements OAuth {
  private readonly CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;

  private userInfo?: TokenPayload;
  private client = new OAuth2Client(this.CLIENT_ID);

  async authenticate(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: this.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const userInfo = ticket.getPayload();
    const email = userInfo?.email;
    if (email) {
      this.userInfo = userInfo;
      return true;
    }

    return false;
  }

  getUserInfo() {
    return this.userInfo ? this.userInfo.email + "" : "";
  }
}
