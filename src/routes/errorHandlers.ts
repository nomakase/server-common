import express from "express";
import { ErrorResponse } from "@custom-types/express";
import { CustomError } from "src/utils/CustomError";

export default function addErrorHandlers(app: express.Application) {
  /* 404 ERROR */
  app.use((_req, res: ErrorResponse) => {
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
    ) => {
      console.log(httpStatus + " " + req.originalUrl);
      res.status(httpStatus).json({
        type: type ?? name ?? "Internal Server Error",
        status: httpStatus ?? 500,
        message: message ?? "The server has been deserted for a while.",
        errorCode: errorCode
      });
    }
  );
}
