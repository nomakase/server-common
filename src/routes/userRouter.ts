import express from "express";
import authenticator from "../middlewares/authenticator";
import JWT from "../auth/JWT";
import { InvalidAccessTokenError } from "../errors";
import PostingService from "../services/PostingService";
import { ActiveNoShow } from "../entities/ActiveNoShow";

const router = express.Router();

router.use(/^\/(?!auth).*$/, authenticator.user);

router.get("/auth", (req, res) => {
    const accessKey = req.headers[process.env.USER_ACCESS_HEADER as string];
    if (accessKey !== (process.env.USER_ACCESS_KEY as string)) {
        throw InvalidAccessTokenError;
    }

    res.json({
        accessToken: JWT.signUser()
    });
});


router.get("/noShow/active", async (req, res, _) => {
    const from = Number(req.query.from);
    const to  = Number(req.query.to);

    const select: (keyof ActiveNoShow)[] = ["id","costPrice","salePrice","from","to","minPeople","maxPeople"];
    const result = await PostingService.getAllActivePosting(undefined, from, to, select)

    res.json({ result });
});

router.get("/noShow/:postingID");

router.get("/restaurant");


export default router;
