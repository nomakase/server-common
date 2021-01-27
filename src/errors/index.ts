import { CustomError } from "../utils/CustomError";

// Common Errors
export const MissingPrameterError = new CustomError("MissingPrameterError", 400, 4000, "Required params are missing.");

// Authentication Errors
export const NoTokenError = new CustomError("NoTokenError", 401, 4010, "Missing access token to verify in Authorization header.");
export const InvalidAccessTokenError = new CustomError("InvalidAccessTokenError", 401, 4011, "This access token is invalid.");
export const InvalidRefreshTokenError = new CustomError("InvalidRefreshTokenError", 401, 4012, "This refresh token is invalid.");
export const InvalidOAuthTokenError = new CustomError("InvalidOAuthTokenError", 401, 4013, "This OAuth token is invalid.");
export const OAuthPermissionError = new CustomError("OAuthPermissionError", 401, 4014, "This OAuth token does not have access to email info.");
export const NoMatchedUserError = new CustomError("NoMatchedUserError", 401, 4015, "Not registered user.");
