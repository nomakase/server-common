import express from "express";
import authRouter from "./routes/authRouter";
import addErrorHandlers from "./routes/errorHandlers";

const app = express();

app.use(express.json());

app.use("/", (_req, _res, _next) => {
  _next();
});

app.use("/", authRouter);

addErrorHandlers(app);
export default app;
