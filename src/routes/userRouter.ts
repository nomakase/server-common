import express from "express";
import authenticator from "../middlewares/authenticator";
import JWT from "../auth/JWT";
import { InvalidAccessTokenError } from "../errors";
import PostingService from "../services/PostingService";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import RestaurantService from "../services/RestaurantService";

const router = express.Router();

router.use(/^\/(?!auth).*$/, authenticator.user);

router.get("/auth", (req, res, next) => {
    try {
        const accessKey = req.headers[process.env.USER_ACCESS_HEADER as string];
        if (accessKey !== (process.env.USER_ACCESS_KEY as string)) {
            throw InvalidAccessTokenError;
        }

        res.json({
            accessToken: JWT.signUser()
        });
    } catch (err) {
        next(err);
    }
});

router.get("/noShow/active", async (req, res, next) => {
    try {
        const from = Number(req.query.from);
        const to  = Number(req.query.to);

        const select: (keyof ActiveNoShow)[] = ["id","costPrice","salePrice","from","to","minPeople","maxPeople"];
        const result = await PostingService.getAllActivePosting(undefined, from, to, select)

        res.json({ result });
    } catch (err) {
        next(err);
    }
});

router.get("/noShow/active/:postingID", async (req, res, next) => {
    try {
        const postingID = Number(req.params.postingID);
        const result = await PostingService.getActivePosting(
            postingID,
            undefined, 
            ["id","costPrice","salePrice","from","to","minPeople","maxPeople", "description"]);

        res.json({ result });
    } catch (err) {
        next(err);
    }
});


router.get("/restaurant/:restaurant", async (req, res, next) => {
    try {
        const resID = Number(req.params.restaurant);
        const restaurant = await RestaurantService.getRestaurant(resID);

        const result = {
            id: restaurant.id,
            name: restaurant.name,
            phoneNumber: restaurant.phoneNumber,
            address: restaurant.address,
            description: restaurant.description,
            openningHour: restaurant.openningHour,
            breakTime: restaurant.breakTime
        }
        res.json({ result });
    } catch (err) {
        next(err);
    }
    
});


export default router;
