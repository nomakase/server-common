import express from "express";

type Overwrite<T, U> = Omit<T, keyof U> & U;

type TypedResponse<T> = Overwrite<
  express.Response,
  { json(data: T): TypedResponse<T>; status(code: number): TypedResponse<T> }
>;

export type ErrorBody = { type: string; status: number; message: string };

export type ErrorResponse = TypedResponse<ErrorBody>;

export type CustomError = Overwrite<Error, { name?: string }> & {
  type: string;
  code: number;
};

//export type TypedResponse<T> = Omit<express.Response, 'json' | 'status'> & { json(data: T): TypedResponse<T> } & { status(code: number): TypedResponse<T> };
