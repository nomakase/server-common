import { InstanceNotFoundError, InvalidParameterError, QueryFailedError } from "../errors";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { InactiveNoShow } from "../entities/InactiveNoShow";
import DateTime from "../utils/DateTime";
import { ActiveNoShowPhoto } from "../entities/ActiveNoShowPhoto";
import { UPLOAD_BASE, UPLOAD_DIR } from "../utils/upload";
import { Restaurant } from "../entities/Restaurant";
import { InactiveNoShowPhoto } from "../entities/InactiveNoShowPhoto";

export default class PostingService{

    static async createActivePosting(posting: ActiveNoShow) {
        if ((posting.id) || (!this._verifyParams(posting))) {
            throw InvalidParameterError;
        }

        this._correctParams(posting);
        
        try {
            const result = await ActiveNoShow.insert(posting);
            return { id: result.identifiers[0].id }
        } catch (err) {
            console.log(err)
            throw QueryFailedError;
        }
    }

    static async updateActivePosting(posting: Partial<ActiveNoShow>) {
        const postingToUpdate = await ActiveNoShow.findOne({ id:posting.id, writer:posting.writer });
        if (!postingToUpdate) {
            throw InstanceNotFoundError;
        }
        
        const updatedPosting = { 
            ...postingToUpdate,
            costPrice: posting.costPrice? posting.costPrice : postingToUpdate.costPrice,
            salePrice: posting.salePrice? posting.salePrice : postingToUpdate.salePrice,
            from: posting.from? posting.from : postingToUpdate.from,
            to: posting.to? posting.to : postingToUpdate.to,
            minPeople: posting.minPeople? posting.minPeople : postingToUpdate.minPeople,
            maxPeople: posting.maxPeople? posting.maxPeople : postingToUpdate.maxPeople,
            description: posting.description? posting.description : postingToUpdate.description
        } as ActiveNoShow;
        if (!this._verifyParams(updatedPosting)) {
            throw InvalidParameterError;
        }

        this._correctParams(updatedPosting);

        try {
            await ActiveNoShow.update(updatedPosting.id, updatedPosting);
            return { id: updatedPosting.id };
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async deleteActivePosting(writer: string, postingID: number) {
        try {
            await ActiveNoShow.delete({ id:postingID, writer });
            return true
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async getActivePosting(postingID: number, writer?: string, select?: (keyof ActiveNoShow)[]) {
        const conditions: any = { 
            id: postingID,
            ...(writer ? { writer: writer } : {})
        };

        const posting = await ActiveNoShow.findOne(conditions, { 
            relations: ["photos", "restaurant"],
            select: select 
        });
        
        if (!posting) {
            throw InstanceNotFoundError;
        }
        
        return posting;
    }

    static async getAllActivePosting(restaurant?: Restaurant, from?: number, to?: number, select?: (keyof ActiveNoShow)[], order?: (keyof ActiveNoShow)[]) {
        try {
            let take = undefined;
            if ((from !== undefined) && (to !== undefined)) {
                take = to-from;
            }

            const where = restaurant ? { restaurant } : undefined

            order;
            /*
            const order = {

            };
            */
            const postings = await ActiveNoShow.find({
                relations: ["photos"],
                where: where,
                order: { id: "ASC" },
                skip: from,
                take: take,
                select: select
            });
            return postings;
        } catch(err) {
            console.log(err)
            throw QueryFailedError;
        }
    }

    static async saveActivePhotos(writer: string, postingID: number, files: Express.Multer.File[]) {

        const posting = await PostingService.getActivePosting(postingID, writer);
             
        const photos = files.map((file) => {
            const filePath = `${process.env.MAIN_HOST}:${process.env.PORT}${UPLOAD_BASE}${UPLOAD_DIR.ACTIVE_NO_SHOW}/${file.filename}`
            const photo = new ActiveNoShowPhoto();
            photo.filePath = filePath;
            photo.noShow = posting;

            return photo;
        });

        const photoIDs = await Promise.all(photos.map(async (photo) => {
            const res = await ActiveNoShowPhoto.insert(photo);
            return Number(res.identifiers[0].id);
        })).catch(() => {
                throw QueryFailedError;
            }
        );

        return photoIDs
    }

    static async getInactivePosting(writer: string, postingID: number) {
        const posting = await InactiveNoShow.findOne({ id:postingID, writer });
        if (!posting) {
            throw InstanceNotFoundError;
        }
        
        return posting;
    }

    static async getAllInactivePosting(restaurant: Restaurant, from: number, to: number) {
        try {
            const postings = await InactiveNoShow.find({
                where: { restaurant },
                order: { id: "ASC" },
                skip: from,
                take: to-from,
            });
            return postings;
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async deleteInactivePosting(writer: string, postingID: number) {
        try {
            await InactiveNoShow.delete({ id:postingID, writer });
            return true;
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async convertToInactive(active: ActiveNoShow, reason: "EXPIRED" | "MATCHED" = InactiveNoShow.REASON_EXPIRED){
        const result = await InactiveNoShow.insert({ 
            ...active,
            id: undefined,
            reason: reason
        });

        const inactiveID = result.identifiers[0].id;
        await Promise.all(active.photos.map(async (activePhoto) => {
            await InactiveNoShowPhoto.insert({
                ...activePhoto,
                noShow: inactiveID
            });
            await activePhoto.remove();
        }));

        await active.remove();

        return { id: inactiveID }
    }

    static async checkActive(restaurant: Restaurant) {
        const actives =  await PostingService.getAllActivePosting(restaurant);
        
        return await Promise.all(actives.filter((actives) => {
            return new Date(DateTime.toUTC(actives.to)) <= new Date(DateTime.nowKST())
        }).map(async (active) => {
            return await PostingService.convertToInactive(active)
        }));
    }

    private static _verifyParams(posting: ActiveNoShow) {
        try {
            posting.from = new Date(DateTime.toUTC(posting.from));
            posting.to = new Date(DateTime.toUTC(posting.to));

            if ((posting.salePrice && 
                (isNaN(posting.salePrice) || 
                (Number(posting.salePrice) < 0) || 
                (Number(posting.salePrice) >= Number(posting.costPrice)))) ||
            (posting.to <= new Date(DateTime.nowKST())) || 
            (posting.from >= posting.to) ||
            (Number(posting.minPeople) < 1) ||
            (Number(posting.minPeople) > Number(posting.maxPeople))) {
                return false;
            }
        } catch {
            return false;
        }

        return true;
    }

    
    private static _correctParams(posting: ActiveNoShow) {

        // Calc discount rate.
        if ((posting.salePrice === undefined) || isNaN(posting.salePrice)) {
            posting.discountRate = 0
        } else {
            posting.discountRate = (posting.costPrice - posting.salePrice) / posting.costPrice * 100;
        }

        console.log("disc rate : " + posting.discountRate)
    }
}