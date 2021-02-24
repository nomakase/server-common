export default interface TokenStore {
    addToken(prefix: string, jti: string, reason: string, expiresIn?: number): Promise<void>;
    findToken(prefix: string, jti: string): Promise<TokenReason>;
    removeToken(prefix: string, jti: string): Promise<void>
}

export enum TokenReason {
    REASON_ADMIN = "0",
    REASON_REFRESH = "1",
    REASON_NEW_SIGNIN = "2",
    REASON_SIGNOUT = "3",
}