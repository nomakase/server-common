import express from "express";

// Generic typed response, we omit 'json' and we add a new json method with the desired parameter type
export type TypedResponse<T> = Omit<express.Response, 'json' | 'status'> & { json(data: T): TypedResponse<T> } & { status(code: number): TypedResponse<T> };

// An example of a typed response
export type AppResponse = TypedResponse<{
  success: boolean,
  message?: string,
}>