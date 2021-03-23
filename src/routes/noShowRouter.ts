import { AuthorizedRequest } from "@custom-types/express";
import express from "express";
import { ActiveNoShow } from "../entities/ActiveNoShow";
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

router.get("/active/all", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        const from = Number(req.query.from);
        const to = Number(req.query.to);
        
        if (!(posting.writer && (from >= 0) && (to >= 0))){
            throw MissingParameterError;
        }
        
        const result =  await PostingService.getAllActivePosting(posting.writer, from, to);
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.get("/active/:postingID", async (req, res, next) => {
    try {
        let posting: Partial<NoShow> = req.body;
        posting.id = Number(req.params.postingID);

        if (!(posting.id && posting.writer)){
            throw MissingParameterError;
        }
        
        const result =  await PostingService.getActivePosting(posting.writer, posting.id);
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.post("/active", async (req, res, next) => {
    try {
        const posting: ActiveNoShow = req.body;
        if (!(posting.costPrice && posting.from && posting.to && posting.maxPeople)){
            throw MissingParameterError;
        }

        const result = await PostingService.createActivePosting(posting);
        res.json({ postingID: result.id });
    } catch (err) {
        next(err);
    }
});

router.put("/active", async (req, res, next) => {
    try {
        const posting: Partial<ActiveNoShow> = req.body;
        if (!(posting.id)){
            throw MissingParameterError;
        }

        const result = await PostingService.updateActivePosting(posting);        
        res.json({ postingID: result.id });
    } catch (err) {
        next(err);
    }
});

router.delete("/active", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id && posting.writer)){
            throw MissingParameterError;
        }
        
        const result =  await PostingService.deleteActivePosting(posting.writer, posting.id);
        res.json({ result });
    } catch (err) {
        next(err);
    }
});

router.get("/inactive/all", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        const from = Number(req.query.from);
        const to = Number(req.query.to);
        
        if (!(posting.writer && (from >= 0) && (to >= 0))){
            throw MissingParameterError;
        }

        if (from == 0) {
            const actives =  await PostingService.getAllActivePosting(posting.writer, undefined, undefined);
            await Promise.all(actives.filter((actives) => new Date(actives.to) <= new Date())
            .map(async (active) => await PostingService.convertToInactive(active)));
        }

        const result =  await PostingService.getAllInactivePosting(posting.writer, from, to);
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.get("/inactive/:postingID", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id && posting.writer)) {
            throw MissingParameterError;
        }

        const result = await PostingService.getInactivePosting(posting.writer, posting.id);
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.delete("/inactive", async (req, res, next) => {
    try {
        const posting: Partial<NoShow> = req.body;
        if (!(posting.id && posting.writer)){
            throw MissingParameterError;
        }

        const result = await PostingService.deleteInactivePosting(posting.writer, posting.id);
        res.json({ result });         
    } catch (err) {
        next(err);
    }
})

export default router;
