import express from "express";
import { Admin } from "../entities/Admin";
import JWT from "../auth/JWT";
import { MissingPrameterError, NoMatchedUserError } from "../errors";
import hash from "../utils/hash";
import { BlackList } from "../entities/BlackList";
import { JwtPayload, AccessTokenPayload } from "@custom-types/jsonwebtoken";

const router = express.Router();

router.post("/signIn", async (req, res, next) => {
    try {
        const id = req.body.id;
        const pw = req.body.pw || req.body.password;
        
        if (!(id || pw)) {
            throw MissingPrameterError;
        }
        
        const admin = await Admin.findOne({ id:hash(id), pw:hash(pw) });
        if (!admin) {
            throw NoMatchedUserError;
        }
        
        const accessToken = JWT.signAccess({ email:id });
        const tokenID = (JWT.decodeAccess(accessToken) as JwtPayload<AccessTokenPayload>).jti;
        await BlackList.addAccessToken(tokenID, "0", BlackList.MAX_REMAINING);
        
        res.json({ accessToken });
    
    } catch(err) {
        next(err);
    }

})


export default router;