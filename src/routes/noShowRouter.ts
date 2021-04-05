import { AuthorizedRequest } from "@custom-types/express";
import express from "express";
import { InactiveNoShow } from "../entities/InactiveNoShow";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { NoShow } from "../entities/NoShow";
import { MissingParameterError } from "../errors";
import PostingService from "../services/PostingService";
import { uploadTo, UPLOAD_DIR, UPLOAD_FIELD } from "../utils/upload";

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

        if (from == 0) {
            await PostingService.checkActive(posting.writer);
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
        
        const result =  await PostingService.getActivePosting(posting.id, posting.writer);
        res.json({ result });
    } catch (err) {
        next(err);
    }
})

router.post("/active/match/:postingID", async (req, res, next) => {
    try {
        let posting: Partial<NoShow> = req.body;
        posting.id = Number(req.params.postingID);

        if (!(posting.id && posting.writer)){
            throw MissingParameterError;
        }

        const activeToConvert = await PostingService.getActivePosting(posting.id, posting.writer);
        const result =  await PostingService.convertToInactive(activeToConvert, InactiveNoShow.REASON_MATCHED);
        
        res.json({ id: result.id });
    } catch (err) {
        next(err)
    }
});

router.post("/active", uploadTo(UPLOAD_DIR.ACTIVE_NO_SHOW).array(UPLOAD_FIELD.ACTIVE_NO_SHOW, 5), async (req: AuthorizedRequest, res, next) => {
    try {
        let posting: ActiveNoShow = { ...req.body };
        posting.writer = req.Identifier!.email;

        if (!(posting.costPrice && posting.from && posting.to && posting.maxPeople)){
            throw MissingParameterError;
        }
        
        const postingResult = await PostingService.createActivePosting(posting);

        let photoIDs: Number[] = [];
            if (req.files && req.files.length !== 0) {
                photoIDs = await PostingService.saveActivePhotos(posting.writer, 
                    postingResult.id, req.files as Express.Multer.File[]);
        }

        res.json({ 
            postingID: posting.id,
            photoIDs: photoIDs
        });
    } catch (err) {
        next(err);
    }
});

router.put("/active", async (req: AuthorizedRequest, res, next) => {
    try {
        const posting: Partial<ActiveNoShow> = { ...req.body };
        posting.writer = req.Identifier!.email;

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
            await PostingService.checkActive(posting.writer);
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
