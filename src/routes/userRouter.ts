import express from "express";
import authenticator from "../middlewares/authenticator";
import JWT from "../auth/JWT";
import { InvalidAccessTokenError } from "../errors";

const router = express.Router();

router.use(/^\/(?!auth).*$/, authenticator.user);

router.get("/auth", async(req, res) => {
    const accessKey = req.headers[process.env.USER_ACCESS_HEADER as string];
    if (accessKey !== (process.env.USER_ACCESS_KEY as string)) {
        throw InvalidAccessTokenError;
    }

    res.json({
        accessToken: JWT.signUser()
    });
});

router.get("/noShow");

router.get("/noShow/:postingID");

router.get("/restaurant");


export default router;
