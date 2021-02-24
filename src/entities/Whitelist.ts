import TokenStore, { TokenReason } from "../tokenStore";

export class Whitelist {
    public static readonly MAX_REMAINING = 86400; //1 day in sec
    
    private static readonly ADMIN_TOKEN_PREFIX = "ADMIN:";

    /* ADMIN TOKEN */
    public static async addAdminToken(jti: string) {
        return await TokenStore.addToken(Whitelist.ADMIN_TOKEN_PREFIX, jti, TokenReason.REASON_ADMIN, Whitelist.MAX_REMAINING);
    }

    public static async findAdminToken(jti: string) {
        return await TokenStore.findToken(Whitelist.ADMIN_TOKEN_PREFIX, jti);
    }

    public static async removeAdminToken(jti: string) {
        return await TokenStore.removeToken(Whitelist.ADMIN_TOKEN_PREFIX, jti);
    }
}