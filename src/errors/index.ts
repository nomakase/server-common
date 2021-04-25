import { CustomError } from "./CustomError";

// Common Errors
export const MissingParameterError = new CustomError("MissingParameterError", 400, 4000, "Required params are missing.");
export const InvalidEmailError = new CustomError("Unexpected Email", 400, 4001, "Please check email address");
export const InvalidPhoneNumberError = new CustomError("Invalid Phone Number", 400, 4002, "Please check phone number");
export const InvalidParameterError = new CustomError("InvalidParameterError", 400, 4003, "Invalid params are detected.");

// Authentication Errors
export const NoTokenError = new CustomError("NoTokenError", 401, 4010, "Missing access token to verify in Authorization header.");
export const InvalidAccessTokenError = new CustomError("InvalidAccessTokenError", 401, 4011, "This access token is invalid.");
export const InvalidRefreshTokenError = new CustomError("InvalidRefreshTokenError", 401, 4012, "This refresh token is invalid.");
export const InvalidOAuthTokenError = new CustomError("InvalidOAuthTokenError", 401, 4013, "This OAuth token is invalid.");
export const OAuthPermissionError = new CustomError("OAuthPermissionError", 401, 4014, "This OAuth token does not have access to email info.");
export const NoMatchedUserError = new CustomError("NoMatchedUserError", 401, 4015, "Not registered user.");
export const AnotherDeviceDetectedError = new CustomError("AnotherDeviceDetectedError", 401, 4016, "This account has been signed in on another device.");


// DB Errors
export const InstanceNotFoundError = new CustomError("InstanceNotFoundError", 500, 5000, "Please check identifier");
export const DuplicatedEmailError = new CustomError("Duplicated Email", 500, 5001, "Inputed email has already taken");
export const DuplicatedPhoneNumberError = new CustomError("Duplicated Phone Number", 500, 5002, "Inputed phone number has already taken");
export const QueryFailedError = new CustomError("QueryFailedError", 500, 5003, "Fail to execute query.");
export const PhotoMaxExceededError = new CustomError("PhotoMaxExceededError", 500, 5004, "Photos can be saved up to 5.");