import OAuth from "./interface/OAuth";
import GoogleOAuth from "./GoogleOAuth";
import KakaoOAuth from "./KakaoOAuth";

interface OAuthCreater{
    create: () => OAuth,
}

const authServer: Record<string, OAuthCreater> = {
    google: { create: () => new GoogleOAuth() },
    kakao: { create: () => new KakaoOAuth() },
}

export default authServer;