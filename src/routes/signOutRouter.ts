import express from "express";
import authenticator from "../middlewares/authenticator";
import AuthService from "../services/AuthService";
import { AuthorizedRequest } from "@custom-types/express";

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

        // Remove from the DB
        const email = req.Identifier!.email;
        const result = await AuthService.unregisterUser(email);

        res.json({ result });
    } catch (err) {
        console.log(err);
        next(err);
    }
})

export default router;
