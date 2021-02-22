import express from "express";
import { ErrorResponse } from "@custom-types/express";
import { CustomError } from "../errors/CustomError";

export default function addErrorHandlers(app: express.Application) {
  /* 404 ERROR */
  app.use((_req, res: ErrorResponse) => {
    console.log(`${404} ${_req.originalUrl}\nNotFoundError: The requested URL was not found.`);
    res.status(404).json({
      type: "NotFoundError",
      status: 404,
      message: "The requested URL was not found.",
      errorCode: 4040
    });
  });

  app.use(
    (
      { httpStatus, type, name, message, errorCode }: CustomError,
      req: express.Request,
      res: ErrorResponse,
      _n: express.NextFunction
    ) => {
      console.log(`${httpStatus||500} ${req.originalUrl}\n${type ?? name}: ${message}`);
      res.status(httpStatus || 500).json({
        type: type ?? name ?? "Internal Server Error",
        status: httpStatus ?? 500,
        message: message ?? "The server has been deserted for a while.",
        errorCode: errorCode
      });
    }
  );
}
