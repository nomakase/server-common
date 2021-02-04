import Redis from "../config/Redis";

export class BlackList {
    
    public static readonly MAX_REMAINING = 86400; //sec

    private static readonly ACCESS_TOKEN_PREFIX = "ACCESS:";
    //private static readonly REFRESH_TOKEN_PREFIX = "REFRESH:";
    
    private static readonly DUMMY = "true";
    private static readonly SET_SUCCESS = "OK";
    private static readonly EXPIRE_SUCCESS = true;
    
    
    static addAccessToken = async (jti: string, expiresIn: number) => {
        const key = BlackList.ACCESS_TOKEN_PREFIX + jti;
        
        try {
            let res: any = await Promise.resolve()
                .then(() => Redis.getClient().SET(key, BlackList.DUMMY));
            
            if (res !== BlackList.SET_SUCCESS) {
                throw new Error("Fail to set value in Redis.");
            }
            
            res = await Promise.resolve()
                .then(() => Redis.getClient().EXPIRE(key, expiresIn));
            
            if (res !== BlackList.EXPIRE_SUCCESS) {
                throw new Error("Fail to set expiration time.");
            }
                
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    static findAccessToken = async (jti: string) => {
        try {
            return await Promise.resolve().then(
                () => Redis.getClient().get(BlackList.ACCESS_TOKEN_PREFIX + jti));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    //static addRefreshToken(jti: string) {}
    //static findRefreshToken(jti: string) {}
}
