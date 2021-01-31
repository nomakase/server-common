import express from "express";
import authenticate from "./middlewares/authenticate";
import addErrorHandlers from "./routes/errorHandlers";
import restaurantRouter from "./routes/restaurantRouter";
import signInRouter from "./routes/signInRouter";
import signUpRouter from "./routes/signUpRouter";

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use("/", (req, _res, next) => {
  console.log(req.originalUrl);
  next();
});

// Need to authenticate except for the url starting with "sign".
app.use(/\/((?!sign).)*/, authenticate);

app.use("/signIn", signInRouter);
app.use("/signUp", signUpRouter);
app.use("/restaurant", restaurantRouter);


addErrorHandlers(app);
export default app;
