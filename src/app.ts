import express from "express";
import authenticate from "./middlewares/authenticate";
import authRouter from "./routes/authRouter";
import signUpRouter from "./routes/signUpRouter";
import addErrorHandlers from "./routes/errorHandlers";

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use("/", (req, _res, next) => {
  console.log(req.originalUrl);
  next();
});

// Need to authenticate except for the url starting with "sign".
app.use(/\/((?!sign).)*/, authenticate);

app.use("/", authRouter);
app.use("/signUp", signUpRouter);

addErrorHandlers(app);
export default app;
