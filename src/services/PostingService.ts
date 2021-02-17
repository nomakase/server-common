import { NoShow } from "../entities/NoShow";

export default class PostingService{

    createPosting() {}
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