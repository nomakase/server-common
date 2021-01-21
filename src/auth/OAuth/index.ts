import OAuth from "./interface/OAuth";
import GoogleOAuth from "./GoogleOAuth";
import KakaoOAuth from "./KakaoOAuth";

const authServer: Record<string, OAuth> = {
    google: new GoogleOAuth(),
    kakao: new KakaoOAuth(),
}

export default authServer;