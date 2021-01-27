import { CustomError } from "../utils/CustomError";

export const NoTokenError = new CustomError("NoTokenError", 401, 4010, "Missing access token to verify in Authorization header.");
export const InvalidAccessTokenError = new CustomError("InvalidAccessTokenError", 401, 4011, "The token is invalid.");