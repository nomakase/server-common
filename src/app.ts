import express from "express";
import authRouter from "./routes/authRouter";
import addErrorHandlers from "./routes/errorHandlers";
import restaurantRouter from "./routes/restaurantRouter";
import signUpRouter from "./routes/signUpRouter";

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use("/signUp", signUpRouter);
app.use("/restaurant", restaurantRouter);

app.use("/", (_req, _res, next) => {
  next();
});

app.use("/", authRouter);

addErrorHandlers(app);
export default app;
