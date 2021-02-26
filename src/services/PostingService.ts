import { InstanceNotFoundError, InvalidParameterError, QueryFailedError } from "../errors";
import { NoShow } from "../entities/NoShow";

export default class PostingService{

    static async createPosting(posting: NoShow) {
        if ((posting.id) || (!this._verifyParams(posting))) {
            throw InvalidParameterError;
        }

        try {
            const result = await NoShow.insert(posting);
            return { id: result.identifiers[0].id }
        } catch (err) {
            throw QueryFailedError;
        }
    }

    static async updatePosting(posting: Partial<NoShow>) {
        const postingToUpdate = await NoShow.findOne({ id:posting.id, writer:posting.writer });
        if (!postingToUpdate) {
            throw InstanceNotFoundError;
        }
        
        const updatedPosting = { ...postingToUpdate, ...posting } as NoShow;
        if (!this._verifyParams(updatedPosting)) {
            throw InvalidParameterError;
        }

        try {
            const updateResult = await NoShow.save(updatedPosting);
            return { id: updateResult.id };
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async deletePosting(writer: string, postingID: number) {
        try {
            await NoShow.delete({ id:postingID, writer });
            return true
        } catch(err) {
            throw QueryFailedError;
        }
    }

    static async getPosting(writer: string, postingID: number) {
        const posting = await NoShow.findOne({ id:postingID, writer });
        if (!posting) {
            throw InstanceNotFoundError;
        }
        
        return posting;
    }

    static async getAllPosting(writer: string, from: number, to: number) {
        try {
            const postings = await NoShow.find({
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

    private static _verifyParams(posting: NoShow) {
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