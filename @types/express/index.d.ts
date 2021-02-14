import { AccessTokenPayload } from "@custom-types/jsonwebtoken";
import { Response, Request } from "express";

type Overwrite<T, U> = Omit<T, keyof U> & U;

export type TypedResponse<T> = Overwrite<
  Response,
  {
    json(data: T): TypedResponse<T>;
    status(code: number): TypedResponse<T>;
  }
>;

export type SignInBody = {
  accessToken: string;
  refreshToken: string;
  isSubmitted: boolean;
  isApproved: boolean;
};
export type SignInResponse = TypedResponse<SignInBody>;

export type ErrorBody = { type: string; status: number; message: string; errorCode: number; };
export type ErrorResponse = TypedResponse<ErrorBody>;

export type Identifier = { Identifier?: AccessTokenPayload };
export type AuthorizedRequest = Request & Identifier;
