import { Request, Response, NextFunction } from "express";

const AUTH_SCHEME = process.env.AUTH_SCHEME + " ";

export default function tokenParser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization?.split(AUTH_SCHEME)[1];
  req.headers.authorization = accessToken;
  
  next();
} 