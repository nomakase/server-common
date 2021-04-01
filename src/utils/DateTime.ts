import moment from "moment-timezone";

export default class DateTime {

    static nowKST() {
        return moment.utc(moment().tz("Asia/Seoul").format('YYYY-MM-DD HH:mm:ss')).format();
    } 
    
    static toUTC(date: string | Date) {
        return moment.utc(date).format();
    }
}
