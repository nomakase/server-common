import express from "express";
import { NoShow } from "../entities/NoShow";
import { MissingPrameterError } from "../errors";
import { CustomError } from "../errors/CustomError";
import PostingService from "../services/PostingService";

//default url path: 
const router =  express.Router();

router.post("/", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
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

router.delete("/", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id)){
            throw MissingPrameterError;
        }

        const postingService = new PostingService();
        postingService;
        //const delResult = postingService.deletePosting(posting.id);
        
        
        res.json({});

    } catch (err) {
        if (!(err instanceof CustomError)) {
            console.error("Unhandled Error occured.");
            console.error(err);
        } 
        next(err);
    }

});

export default router;
