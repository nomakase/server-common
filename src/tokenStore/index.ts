import TokenStore, { TokenReason } from "./interface/TokenStore";
import RedisTokenStore from "./RedisTokenStore";

const TokenStore: TokenStore = new RedisTokenStore();

export default TokenStore;
export { TokenReason };