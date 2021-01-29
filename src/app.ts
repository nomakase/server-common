import express from "express";
import authenticate from "src/middlewares/authenticate";
import signInRouter from "src/routes/signInRouter";
import addErrorHandlers from "src/routes/errorHandlers";
import restaurantRouter from "src/routes/restaurantRouter";
import signUpRouter from "src/routes/signUpRouter";

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
