export default interface OAuth {
    authenticate(token: string): Promise<boolean>
    getUserInfo(token: string): string
}