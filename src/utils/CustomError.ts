export class CustomError extends Error {
  type: string;
  httpStatus: number;
  errorCode: number;

  constructor(type: string, httpStatus: number, errorCode: number, ...params: string[]) {
    super(...params);

    this.type = type;
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
  }
}