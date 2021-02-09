import express from "express";
import authenticate from "../middlewares/authenticate";
import AuthService from "../services/AuthService";

const router = express.Router();

router.use(authenticate);

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
