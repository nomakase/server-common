import Redis from "../config/Redis";

export class BlackList {
    
    public static readonly MAX_REMAINING = 86400; //sec
    public static readonly REASON_REFRESH = "0";
    public static readonly REASON_NEW_SIGNIN = "1";
    public static readonly REASON_SIGNOUT = "2";
    
    private static readonly ACCESS_TOKEN_PREFIX = "ACCESS:";
    private static readonly ADMIN_TOKEN_PREFIX = "ADMIN:";
    
    private static readonly SET_SUCCESS = "OK";
    private static readonly EXPIRE_SUCCESS = 1;
    private static readonly DUMMY = "o";
    
    /* ACCESS TOKEN */
    public static addAccessToken = async (jti: string, reason: string, expiresIn: number) => {
        return await BlackList.addToken(BlackList.ACCESS_TOKEN_PREFIX, jti, reason, expiresIn); 
    }

    public static findAccessToken = async (jti: string) => {
        return await BlackList.findToken(BlackList.ACCESS_TOKEN_PREFIX, jti);
    }

    /* ADMIN TOKEN */
    public static addAdminToken = async (jti: string) => {
        await BlackList.addToken(BlackList.ACCESS_TOKEN_PREFIX, jti, BlackList.DUMMY, BlackList.MAX_REMAINING);
        return await BlackList.addToken(BlackList.ADMIN_TOKEN_PREFIX, jti, BlackList.DUMMY, BlackList.MAX_REMAINING);
    }

    public static findAdminToken = async (jti: string) => {
        return await BlackList.findToken(BlackList.ADMIN_TOKEN_PREFIX, jti);
    }


    private static addToken = async (prefix: string, jti: string, reason: string, expiresIn: number) => {
        const key = prefix + jti;
        
        try {
            let res: any = await Promise.resolve()
                .then(() => Redis.getClient().SET(key, reason));
            
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
    
    private static findToken = async (prefix: string, jti: string): Promise<any> => {
        try {
            return await Promise.resolve().then(
                () => Redis.getClient().get(prefix + jti));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
