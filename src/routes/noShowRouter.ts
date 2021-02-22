import { AuthorizedRequest } from "@custom-types/express";
import express from "express";
import { NoShow } from "../entities/NoShow";
import { MissingParameterError } from "../errors";
import PostingService from "../services/PostingService";

//default url path: 
const router =  express.Router();

// Set Authorized user as a writer.
router.use("/", (req: AuthorizedRequest, _res, next) => {
    req.body.writer = req.Identifier!.email;
    next();
})

router.get("/all", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        const from = Number(req.query.from);
        const to = Number(req.query.to);
        
        if (!(posting.writer && (from >= 0) && (to >= 0))){
            throw MissingParameterError;
        }
        
        const postingService = new PostingService();
        const result =  await postingService.getAllPosting(posting.writer, from, to);
        
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.get("/:postingID", async (req, res, next) => {
    try {
        let posting: Partial<NoShow> = req.body;
        posting.id = Number(req.params.postingID);

        if (!(posting.id && posting.writer)){
            throw MissingParameterError;
        }
        
        const postingService = new PostingService();
        const result =  await postingService.getPosting(posting.writer, posting.id);
        
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const posting: NoShow = req.body;
        console.log(posting);
        if (!(posting.costPrice && posting.from && posting.to && posting.maxPeople)){
            throw MissingParameterError;
        }

        const postingService = new PostingService();
        const result = await postingService.createPosting(posting);

        res.json({ postingID: result.id });
    } catch (err) {
        next(err);
    }
});

router.put("/", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id)){
            throw MissingParameterError;
        }

        const postingService = new PostingService();
        const result = await postingService.updatePosting(posting);
        
        res.json({ postingID: result.id });
    } catch (err) {
        next(err);
    }
});

router.delete("/", async (req: AuthorizedRequest, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id && posting.writer)){
            throw new Error("UUUU");
            //throw MissingParameterError;
        }
        
        const postingService = new PostingService();
        const result =  await postingService.deletePosting(posting.writer, posting.id);
        
        res.json({ result });
    } catch (err) {
        next(err);
    }
});

export default router;
