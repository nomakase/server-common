import express from "express";
import { AppResponse } from "./interface";

export default function addErrorHandlers(app: express.Application) {
  /* 404 ERROR */
  app.use((_req, res: AppResponse) => {
    res.status(404).json({
      message: "Not Found."
    });
  });

  /* 401 ERROR */
  app.use(
    (
      err: any,
      req: express.Request,
      res: AppResponse,
      next: express.NextFunction
    ) => {
      if (err.code == 401) {
        console.log("Auth Failed - " + err.code + req.originalUrl);
        res.status(err.code || 401).json({
          message: "Unauthorized : Access to this resource is denied."
        });
      } else {
        next(err);
      }
    }
  );

  /* 403 ERROR */
  app.use(
    (
      err: any,
      req: express.Request,
      res: AppResponse,
      next: express.NextFunction
    ) => {
      if (err.code == 403) {
        console.log("Auth Failed - " + err.code + req.originalUrl);
        res.status(err.code || 403).json({
          message: "Forbidden : Access to this resource is denied."
        });
      } else {
        next(err);
      }
    }
  );

  /* 500 ERROR */
  app.use(
    (
      err: any,
      req: express.Request,
      res: AppResponse,
      _next: express.NextFunction
    ) => {
      console.log("Internal Server Error - " + err.code + req.originalUrl);
      res.status(err.status || 500).json({
        message:
          "Internal Server Error : The server has been deserted for a while."
      });
    }
  );
}
