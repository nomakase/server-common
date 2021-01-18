import express from "express";
import authenticate from "./middlewares/authenticate";
import authRouter from "./routes/authRouter";
import addErrorHandlers from "./routes/errorHandlers";
import restaurantRouter from "./routes/restaurantRouter";
import signUpRouter from "./routes/signUpRouter";

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use("/signUp", signUpRouter);
app.use("/restaurant", restaurantRouter);

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
