import { InstanceNotFoundError, InvalidParameterError } from "../errors";
import { NoShow } from "../entities/NoShow";

export default class PostingService{

    async createPosting(posting: NoShow) {
        if ((posting.id) || (!this._verifyParams(posting))) {
            throw InvalidParameterError;
        }

        const result = await NoShow.insert(posting);
        return { id: result.identifiers[0].id }
    }

    async updatePosting(posting: Partial<NoShow>) {
        const postingToUpdate = await NoShow.findOne({ id:posting.id, writer:posting.writer });
        if (!postingToUpdate) {
            throw InstanceNotFoundError;
        }
        
        const updatedPosting = { ...postingToUpdate, ...posting } as NoShow;
        if (!this._verifyParams(updatedPosting)) {
            throw InvalidParameterError;
        }

        const updateResult = await NoShow.save(updatedPosting);
        return { id: updateResult.id };
    }

    async deletePosting(writer: string, postingID: number) {
        try {
            await NoShow.delete({ id:postingID, writer });
            return true
        } catch(err) {
            console.error(err);
            return false;
        }
    }

    private _verifyParams(posting: NoShow) {
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