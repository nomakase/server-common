import { InvalidParameterError } from "../errors";
import { NoShow } from "../entities/NoShow";

export default class PostingService{

    async createPosting(posting: NoShow) {
        
        // Verify params 
        if ((posting.id) ||
            (posting.salePrice && 
                ((Number(posting.salePrice) < 0) || 
                (Number(posting.salePrice) >= Number(posting.costPrice)))) ||
            (new Date(posting.to) <= new Date()) || 
            (posting.from >= posting.to) ||
            (Number(posting.minPeople < 1) ||
            (Number(posting.minPeople) > Number(posting.maxPeople)))) {
            throw InvalidParameterError;
        }

        // Insert
        const result = await NoShow.insert(posting);
        return { id: result.identifiers[0].id }
    }

    updatePosting() {}
    async deletePosting(writer: string, postingID: number) {
        try {
            await NoShow.delete({ id:postingID, writer });
            return true
        } catch(err) {
            console.error(err);
            return false;
        }
    }

    generatePostID() {

    }
}