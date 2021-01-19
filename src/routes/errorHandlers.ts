import express from "express";
import { ErrorResponse, CustomError } from "../@types/errorHandlers";

export default function addErrorHandlers(app: express.Application) {
  /* 404 ERROR */
  app.use((_req, res: AppResponse) => {
    res.status(404).json({
      type: "NotFoundError",
      status: 404,
      message: "The requested URL was not found.",
    });
  });

  app.use(
    (
      err: CustomError,
      req: express.Request,
      res: ErrorResponse,
      _next: express.NextFunction
    ) => {
      console.log(err.code + " " + req.originalUrl);
      res.status(err.code).json({
        type: err.type ?? err.name ?? "Internal Server Error",
        status: err.code ?? 500,
        message: err.message ?? "The server has been deserted for a while.",
      });
    }
  );
}
