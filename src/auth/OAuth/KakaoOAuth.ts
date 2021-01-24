import OAuth from "./interface/OAuth";

export default class KakaoOAuth implements OAuth {
  readonly serverName = "kakao";

  async authenticate(token: string) {
    // Not implemented yet.

    token;
    return false;
  }

  getUserInfo() {
    // Not implemented yet.

    return "";
  }
}
