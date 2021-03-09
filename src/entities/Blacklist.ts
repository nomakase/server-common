import TokenStore from "../tokenStore";

export class Blacklist {
  public static readonly MAX_REMAINING = 86400; //1 day in sec

  private static readonly ACCESS_TOKEN_PREFIX = "ACCESS:";

  /* ACCESS TOKEN */
  public static async addAccessToken(
    jti: string,
    reason: string,
    expiresIn: number
  ) {
    return await TokenStore.addToken(
      Blacklist.ACCESS_TOKEN_PREFIX,
      jti,
      reason,
      expiresIn
    );
  }

  public static async findAccessToken(jti: string) {
    return await TokenStore.findToken(Blacklist.ACCESS_TOKEN_PREFIX, jti);
  }
}
