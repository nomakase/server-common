import express from "express";
import authenticator from "../middlewares/authenticator";
import AuthService from "../services/AuthService";

const router = express.Router();

router.use(authenticator.user);

router.post("/", async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization!;
        const authService = new AuthService();
        const result = authService.signOut(accessToken);
        
        res.json({ result });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

export default router;
