import express from "express";
import authenticator from "../middlewares/authenticator";
import AuthService from "../services/AuthService";
import { AuthorizedRequest } from "@custom-types/express";
import { Restaurant } from "../entities/Restaurant";
import { deleteFile, UPLOAD_DIR } from "../utils/upload";
import path from "path";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { InactiveNoShow } from "../entities/InactiveNoShow";

const router = express.Router();

router.use(authenticator.owner);

router.post("/", async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization!;
        const result = await AuthService.signOut(accessToken);
        
        res.json({ result });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.post("/unregister", async (req: AuthorizedRequest, res, next) => {
    try {
        // Sign-out
        const accessToken = req.headers.authorization!;
        await AuthService.signOut(accessToken);

        // Get from the DB
        const email = req.Identifier!.email;
        const user = await AuthService.getUser(email);
        
        const restaurants = await Restaurant.find({ 
            where: {
                manager: user
            }, 
            relations: ["photos"]
        });

        // Remove photos
        restaurants.map(async (restaurant) => {
            restaurant.photos.forEach((photo) => {
                const fileName = path.basename(photo.filePath);
                deleteFile(fileName);
            });

            const actives = await ActiveNoShow.find({
                where: {
                    restaurant
                },
                relations: ["photos"]
            })
            actives.forEach((active) => {
                active.photos.forEach((photo) => {
                    const fileName = path.basename(photo.filePath);
                    deleteFile(fileName, UPLOAD_DIR.ACTIVE_NO_SHOW);
                })
            })

            const inactives = await InactiveNoShow.find({
                where: {
                    restaurant
                },
                relations: ["photos"]
            })
            inactives.forEach((inactive) => {
                inactive.photos.forEach((photo) => {
                    const fileName = path.basename(photo.filePath);
                    deleteFile(fileName, UPLOAD_DIR.INACTIVE_NO_SHOW);
                })
            })
        })

        const result = await AuthService.unregisterUser(email);

        res.json({ result });
    } catch (err) {
        console.log(err);
        next(err);
    }
})

export default router;
