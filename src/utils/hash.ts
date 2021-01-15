import crypto from "crypto";

const hashingAlgo = process.env.HASH_ALGORITHM as string;
const hashingEncd = process.env.HASH_ENCODING as crypto.HexBase64Latin1Encoding;

export default function hash(s: string) {
  return crypto.createHash(hashingAlgo).update(s).digest(hashingEncd);
}
