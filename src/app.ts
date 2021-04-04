import express from "express";
import tokenParser from "./middlewares/tokenParser";
import authenticator from "./middlewares/authenticator";
import addErrorHandlers from "./routes/errorHandlers";
import restaurantRouter from "./routes/restaurantRouter";
import signInRouter from "./routes/signInRouter";
import signUpRouter from "./routes/signUpRouter";
import signOutRouter from "./routes/signOutRouter";
import noShowRouter from "./routes/noShowRouter";
import adminRouter from "./routes/adminRouter";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));
app.use(cookieParser());

app.use("/", (req, _res, next) => {
  console.log(req.originalUrl);
  next();
});

// Need to authenticate except for the url starting with "sign" or "admin".
app.use(tokenParser);
app.use(/^\/(?!sign|admin).*$/, authenticator.owner);

app.use("/signIn", signInRouter);
app.use("/signUp", signUpRouter);
app.use("/signOut", signOutRouter);
app.use("/restaurant", restaurantRouter);
app.use("/noShow", noShowRouter);
app.use("/admin", adminRouter);

addErrorHandlers(app);
export default app;
