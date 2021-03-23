import { InstanceNotFoundError, InvalidParameterError, QueryFailedError } from "../errors";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { InactiveNoShow } from "../entities/InactiveNoShow";


export default class PostingService{

    static async createActivePosting(posting: ActiveNoShow) {
        if ((posting.id) || (!this._verifyParams(posting))) {
            throw InvalidParameterError;
        }

        try {
            const result = await ActiveNoShow.insert(posting);
            return { id: result.identifiers[0].id }
        } catch (err) {
            throw QueryFailedError;
        }
    }

    static async updateActivePosting(posting: Partial<ActiveNoShow>) {
        const postingToUpdate = await ActiveNoShow.findOne({ id:posting.id, writer:posting.writer });
        if (!postingToUpdate) {
            throw InstanceNotFoundError;
        }
        
        const updatedPosting = { ...postingToUpdate, ...posting } as ActiveNoShow;
        if (!this._verifyParams(updatedPosting)) {
            throw InvalidParameterError;
        }

        try {
            const updateResult = await ActiveNoShow.save(updatedPosting);
            return { id: updateResult.id };
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

    static async getActivePosting(writer: string, postingID: number) {
        const posting = await ActiveNoShow.findOne({ id:postingID, writer });
        if (!posting) {
            throw InstanceNotFoundError;
        }
        
        return posting;
    }

    static async getAllActivePosting(writer: string, from: number | undefined, to: number | undefined) {
        try {
            let take = undefined;
            if ((from !== undefined) && (to !== undefined)) {
                take = to-from;
            }

            const postings = await ActiveNoShow.find({
                where: { writer },
                order: { id: "ASC" },
                skip: from,
                take: take,
            });
            return postings;
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async getInactivePosting(writer: string, postingID: number) {
        const posting = await InactiveNoShow.findOne({ id:postingID, writer });
        if (!posting) {
            throw InstanceNotFoundError;
        }
        
        return posting;
    }

    static async getAllInactivePosting(writer: string, from: number, to: number) {
        try {
            const postings = await InactiveNoShow.find({
                where: { writer },
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

    static async convertToInactive(active: ActiveNoShow, reason: 0 | 1 = InactiveNoShow.REASON_EXPIRED){
        await active.remove()
        const result = await InactiveNoShow.insert({ 
            ...active,
            reason: reason
        });
        return { id: result.identifiers[0].id }
    }

    private static _verifyParams(posting: ActiveNoShow) {
        if ((posting.salePrice && 
                ((Number(posting.salePrice) < 0) || 
                (Number(posting.salePrice) >= Number(posting.costPrice)))) ||
            (new Date(posting.to) <= new Date()) || 
            (posting.from >= posting.to) ||
            (Number(posting.minPeople) < 1) ||
            (Number(posting.minPeople) > Number(posting.maxPeople))) {
                return false;
        }

        return true;
    }
}