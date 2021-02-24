import Redis from "../config/Redis";
import TokenStore, { TokenReason } from "./interface/TokenStore";

export default class RedisTokenStore implements TokenStore{
    private static readonly PADDING_TIME = 60; //sec 

    private static readonly SET_SUCCESS = "OK";
    private static readonly EXPIRE_SUCCESS = 1;
    private static readonly DEL_SUCCESS = 1;

    async addToken(prefix: string, jti: string, reason: string, expiresIn: number) {
        const key = prefix + jti;
        
        try {
            let res: any = await Promise.resolve()
                .then(() => Redis.getClient().SET(key, reason));
            
            if (res !== RedisTokenStore.SET_SUCCESS) {
                throw new Error("Fail to set value in Redis.");
            }
            
            res = await Promise.resolve()
                .then(() => Redis.getClient().EXPIRE(key, RedisTokenStore.PADDING_TIME + expiresIn));
                
            if (res !== RedisTokenStore.EXPIRE_SUCCESS) {
                throw new Error("Fail to set expiration time.");
            }
                
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async findToken(prefix: string, jti: string): Promise<TokenReason>  {
        try {
            return await Promise.resolve().then(
                () => (<TokenReason><unknown>Redis.getClient().GET(prefix + jti)));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async removeToken(prefix: string, jti: string) {
        try {
            const res: any = await Promise.resolve().then(
                () => Redis.getClient().DEL(prefix + jti));

            if (res !== RedisTokenStore.DEL_SUCCESS) {
                throw new Error("Fail to delete key in Redis.");
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}