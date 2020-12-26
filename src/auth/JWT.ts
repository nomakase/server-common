import jwt from "jsonwebtoken"

export default class JWT {
    
    private secretKeyA = process.env.ACCESS_SECRET + ""
    private secretKeyR = process.env.REFRESH_SECRET + ""
    
    private optionsA = {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRE,
            issuer : process.env.TOKEN_ISSUER,
            subject: process.env.TOKEN_SUBJECT
    }
    
    private optionsR = {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRE,
            issuer : process.env.TOKEN_ISSUER,
            subject: process.env.TOKEN_SUBJECT
    }
    
    /* ACCESS TOKEN */
    signAccess = (payload: object) => jwt.sign(payload, this.secretKeyA, this.optionsA)
    verifyAccess = (token: string) => {
        try{
            jwt.verify(token, this.secretKeyA)
        } catch (error) {
            throw error
        }
    }
    
    /* REFRESH TOKEN */
    signRefresh = (payload: object) => jwt.sign(payload, this.secretKeyR, this.optionsR)
    verifyRefresh = (token: string, clientInfo: any) => {
        try{
            const payload: any = jwt.verify(token, this.secretKeyR)
            
            if ((payload.androidID == clientInfo.androidID) 
                && (payload.accessToken == clientInfo.accessToken)) {
                let error = new Error("Invalid client info.")
                error.name = "InvalidClientError"
                
                throw error
            }
        } catch (error) {
            throw error
        }
    }
}