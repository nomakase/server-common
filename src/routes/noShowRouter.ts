import { AuthorizedRequest } from "@custom-types/express";
import express from "express";
import { NoShow } from "../entities/NoShow";
import { MissingPrameterError } from "../errors";
import { CustomError } from "../errors/CustomError";
import PostingService from "../services/PostingService";

//default url path: 
const router =  express.Router();

// Set Authorized user as a writer.
router.use("/", (req: AuthorizedRequest, _res, next) => {
    req.body.writer = req.Identifier!.email;
    next();
})

router.post("/", async (req, res, next) => {
    try {
        const posting: NoShow = req.body;
        console.log(posting);
        if (!(posting.costPrice && posting.from && posting.to && posting.skeleton && posting.maxPeople)){
            throw MissingPrameterError;
        }

        const postingService = new PostingService();
        postingService;
        
        res.json({});

    } catch (err) {
        if (!(err instanceof CustomError)) {
            console.error("Unhandled Error occured.");
            console.error(err);
        } 
        next(err);
    }

});

router.put("/", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id)){
            throw MissingPrameterError;
        }

        const postingService = new PostingService();
        postingService;
        
        
        res.json({});

    } catch (err) {
        if (!(err instanceof CustomError)) {
            console.error("Unhandled Error occured.");
            console.error(err);
        } 
        next(err);
    }
});

router.delete("/", async (req: AuthorizedRequest, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id && posting.writer)){
            throw MissingPrameterError;
        }
        
        const postingService = new PostingService();
        const result = postingService.deletePosting(posting.writer, posting.id);
        
        res.json({ result });
    } catch (err) {
        if (!(err instanceof CustomError)) {
            console.error("Unhandled Error occured.");
            console.error(err);
        } 
        next(err);
    }

});

export default router;
