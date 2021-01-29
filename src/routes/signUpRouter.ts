import express from "express";
import { Manager } from "../entities/Manager";
import { MissingPrameterError, InvalidEmailError, DuplicatedEmailError } from "src/errors";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { email }: Partial<Manager> = req.body;

  if (!email) return next(MissingPrameterError);
  if (!email.includes("@")) return next(InvalidEmailError);

  let managerId: number;
  try {
    const insertResult = await Manager.insert({ email })

    // TODO: 해당 유저 ID로 자동로그인할 수 있도록 합니다.
    managerId = insertResult.identifiers[0].id;
  } catch (error) {
    // console.log(err);
    if (error.errno === 1062) {
      next(DuplicatedEmailError);
    }
    return;
  }

  return res.json({ id: managerId })
});

export default router;