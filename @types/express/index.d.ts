import { Response } from "express";

type Overwrite<T, U> = Omit<T, keyof U> & U;

export type TypedResponse<T> = Overwrite<
  Response,
  {
    json(data: T): TypedResponse<T>;
    status(code: number): TypedResponse<T>;
  }
>;

export type SignInResponse = TypedResponse<{
  accessToken: string;
  refreshToken: string;
  isSubmitted: boolean;
  isApproved: boolean;
}>;

export type ErrorBody = { type: string; status: number; message: string };
export type ErrorResponse = TypedResponse<ErrorBody>;
export type CustomError = Overwrite<Error, { name?: string }> & {
  type: string;
  code: number;
};
