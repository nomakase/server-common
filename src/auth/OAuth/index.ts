import GoogleOAuth from "./GoogleOAuth";
import KakaoOAuth from "./KakaoOAuth";

export default {
    google: new GoogleOAuth(),
    kakao: new KakaoOAuth(),
}