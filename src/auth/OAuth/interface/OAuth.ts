export default interface OAuth {
  serverName: string;

  authenticate(token: string): Promise<boolean>;
  getUserInfo(): string | null;
}
