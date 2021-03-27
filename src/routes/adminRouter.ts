import express from "express";
import { Admin } from "../entities/Admin";
import JWT from "../auth/JWT";
import { InstanceNotFoundError, MissingParameterError, NoMatchedUserError } from "../errors";
import hash from "../utils/hash";
import { Blacklist } from "../entities/Blacklist";
import { JwtPayload, AccessTokenPayload } from "@custom-types/jsonwebtoken";
import { Restaurant } from "../entities/Restaurant";
import { RestaurantPhoto } from "../entities/RestaurantPhoto";
import authenticator from "../middlewares/authenticator";
import { TokenReason } from "../tokenStore";
import { Whitelist } from "../entities/Whitelist";

const router = express.Router();

router.use(/^\/(?!signIn).*$/, authenticator.admin);

router.post("/signIn", async (req, res, next) => {
    try {
        const id = req.body.id;
        const pw = req.body.pw || req.body.password;

        if (!(id || pw)) {
            throw MissingParameterError;
        }

        const admin = await Admin.findOne({ id: hash(id), pw: hash(pw) });
        if (!admin) {
            throw NoMatchedUserError;
        }

        const accessToken = JWT.signAccess({ email: id });
        const tokenID = (JWT.decodeAccess(accessToken) as JwtPayload<AccessTokenPayload>).jti;

        // Admin token cannot be used for normal user.
        await Blacklist.addAccessToken(tokenID, TokenReason.REASON_ADMIN, Blacklist.MAX_REMAINING);
        await Whitelist.addAdminToken(tokenID);

        res.json({ accessToken });
    } catch (err) {
        next(err);
    }
})

router.post("/signOut", async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization!;
        const tokenID = (JWT.decodeAccess(accessToken) as JwtPayload<AccessTokenPayload>).jti;

        // TODO: Refactor
        // Use blacklist as a whitelist only for admin token.
        await Whitelist.removeAdminToken(tokenID);

        res.json({ result: true });
    } catch (err) {
        next(err);
    }
})

router.post("/verification", async (req, res, next) => {
    const { id, status } = req.body;
    console.log(id, status);

    if (!id || !status) return next(MissingParameterError);

    let restaurant: Restaurant | undefined;
    try {
        restaurant = await Restaurant.findOne({ id });
        if (!restaurant) throw InstanceNotFoundError;
    } catch (error) {
        return next(error);
    }

    try {
        await Restaurant.update(id, {
            ...restaurant,
            verfication: status
        })
    } catch (error) {
        return next(error);
    }
    res.send({ id });
})

router.get("/verification", async (_req, res) => {
    const restaurants = await Restaurant.find({ verfication: 0 });
    const restaurantsWithPhotos = await Promise.all(restaurants.map(async (restaurant) => {
        const photos = await RestaurantPhoto.find({
            relations: ["restaurant"],
            where: { restaurant: { id: restaurant.id } }
        });

        return {
            ...restaurant,
            images: photos.map(({ filePath }) => filePath)
        }
    }));

    res.send(restaurantsWithPhotos);
})

export default router;