import express from "express";
import authRouter from "./routes/authRouter";

const app = express();

app.use("/", (_req, _res, _next) => {
  _next();
});

app.use("/", authRouter);

export default app;
