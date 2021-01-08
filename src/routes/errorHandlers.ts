import express from "express";

export default function addErrorHandlers(app: express.Application) {
  /* 404 ERROR */
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Not Found.",
    });
  });

  /* 401 ERROR */
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err.code == 401) {
        console.log("Auth Failed - " + err.code + req.originalUrl);
        res.status(err.code || 401).json({
          success: false,
          message: "Unauthorized : Access to this resource is denied.",
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
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err.code == 403) {
        console.log("Auth Failed - " + err.code + req.originalUrl);
        res.status(err.code || 403).json({
          success: false,
          message: "Forbidden : Access to this resource is denied.",
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
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.log("Internal Server Error - " + err.code + req.originalUrl);
      res.status(err.status || 500).json({
        success: false,
        message:
          "Internal Server Error : The server has been deserted for a while.",
      });
    }
  );
}
