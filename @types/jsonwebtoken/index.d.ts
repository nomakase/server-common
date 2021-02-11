type payload<T> = Readonly<{
  payload: T;
  iat: number;
  exp: number;
  iss: string;
  sub: string;
  jti: string;
}>;

export type AccessTokenPayload = Readonly<{
  email: string;
}>;

export type RefreshTokenPayload = Readonly<{
  hashedAccessTokenID: string;
  deviceID: string;
}>;

export type JwtPayload<
  PayloadType extends AccessTokenPayload | RefreshTokenPayload
> = payload<PayloadType>;
