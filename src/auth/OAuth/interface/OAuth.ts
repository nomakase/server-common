export default interface OAuth {
  authenticate(token: string): Promise<boolean>;
  getUserInfo(): string;
}
