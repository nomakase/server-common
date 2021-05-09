import { AuthorizedRequest } from "@custom-types/express";
import express from "express";
import { InactiveNoShow } from "../entities/InactiveNoShow";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { NoShow } from "../entities/NoShow";
import { MissingParameterError, InvalidParameterError, PhotoMaxExceededError } from "../errors";
import PostingService from "../services/PostingService";
import { uploadTo, UPLOAD_BASE, UPLOAD_DIR, UPLOAD_FIELD, deleteFile } from "../utils/upload";
import RestaurantService from "../services/RestaurantService";

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
        const resID = Number(req.query.restaurant);
        const from = Number(req.query.from);
        const to = Number(req.query.to);
        
        if (!(posting.writer && resID && (from >= 0) && (to >= 0))){
            throw MissingParameterError;
        }
        
        const restaurant = await RestaurantService.getRestaurant(resID);
        if (restaurant.manager.email !== posting.writer) {
            throw InvalidParameterError;
        }

        if (from == 0) {
            await PostingService.checkActive(restaurant);
        }
        
        const result =  await PostingService.getAllActivePosting(restaurant, from, to);
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
        const resID = Number(req.body.restaurant);
        let posting: ActiveNoShow = { ...req.body };
        posting.writer = req.Identifier!.email;

        if (!(resID && posting.costPrice && posting.from && posting.to && posting.maxPeople)){
            throw MissingParameterError;
        }

        const restaurant = await RestaurantService.getRestaurant(resID);
        if (restaurant.manager.email !== posting.writer) {
            throw InvalidParameterError;
        }
        posting.restaurant = restaurant;
        
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

router.put("/active", uploadTo(UPLOAD_DIR.ACTIVE_NO_SHOW).array(UPLOAD_FIELD.ACTIVE_NO_SHOW, 5), async (req: AuthorizedRequest, res, next) => {
    const posting: Partial<ActiveNoShow> = { ...req.body };
    const photoToDelete: number[] = req.body.photoToDelete as number[] || [] ;
    const uploadedPhotos = req.files as Express.Multer.File[];
    posting.writer = req.Identifier!.email;
    let isPostingUpdated = false;
    let originPosting: ActiveNoShow | undefined;

    try {
        if (!(posting.id)){
            throw MissingParameterError;
        }

        if (!(Array.isArray(photoToDelete))) {
            throw InvalidParameterError;
        }

        // Check the number of photos.
        const postingToUpdate = await PostingService.getActivePosting(posting.id, posting.writer);
        originPosting = postingToUpdate;
        const existingPhotos  = postingToUpdate.photos;
        if (existingPhotos.length - photoToDelete.length + uploadedPhotos.length > 5) {
            throw PhotoMaxExceededError;
        }

        // Validate photo id to delete.
        photoToDelete.forEach(id => {
            const photoToUpdate = existingPhotos.find(existing => Number(existing.id) === Number(id));
            if (!photoToUpdate) {
                throw InvalidParameterError;
            }
        })

        // Update posting.
        const result = await PostingService.updateActivePosting(posting);
        isPostingUpdated = true;

        // Update photos.
        let updated = 0;
        await Promise.all(photoToDelete.map(async (photoID, idx) => {
            if(idx < uploadedPhotos.length) {
                const photoToUpdate = existingPhotos.find(existing => Number(existing.id) === Number(photoID))!;

                photoToUpdate.filePath = `${UPLOAD_BASE}${UPLOAD_DIR.ACTIVE_NO_SHOW}` + uploadedPhotos[idx].filename;
                await photoToUpdate.save();
                updated = idx + 1;
            }
                
        }))

        if (uploadedPhotos.length < photoToDelete.length) {
            const photoIDsToDelete = photoToDelete.slice(updated);
            await Promise.all(photoIDsToDelete.map(async (photoID) => {
                const photo = existingPhotos.find(existing => Number(existing.id) === Number(photoID))!;
                await photo.remove();
            }));
        }

        if (uploadedPhotos.length > photoToDelete.length) {
            await PostingService.saveActivePhotos(postingToUpdate.writer, postingToUpdate.id, uploadedPhotos.slice(updated))
        }

        res.json({ postingID: result.id });
    } catch (err) {

        // Delete newly saved photos.
        uploadedPhotos.forEach((photo) => {
            deleteFile(photo.filename, UPLOAD_DIR.ACTIVE_NO_SHOW);
        });

        // Roll-back updated ActiveNoShow.
        if (isPostingUpdated && originPosting) {
            await originPosting.save();
        }

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
        const resID = Number(req.query.restaurant);
        const from = Number(req.query.from);
        const to = Number(req.query.to);
        
        if (!(resID && posting.writer && (from >= 0) && (to >= 0))){
            throw MissingParameterError;
        }

        const restaurant = await RestaurantService.getRestaurant(resID);
        if (restaurant.manager.email !== posting.writer) {
            throw InvalidParameterError;
        }

        if (from == 0) {
            await PostingService.checkActive(restaurant);
        }

        const result =  await PostingService.getAllInactivePosting(restaurant, from, to);
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
