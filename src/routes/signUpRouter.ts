import express from "express";
import { Manager } from "../entities/Manager";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { email }: Partial<Manager> = req.body;

  if (!email) {
    const error: any = new Error("Please input email")
    error.code = 400;
    error.type = "Unexpected Email";
    
    next(error);
  }

  else if (!email.includes("@")) {
    const error: any = new Error("Please check email address");
    error.code = 400;
    error.type = "Unexpected Email";

    next(error);
  }

  let managerId: number;
  try {
    const insertResult = await Manager.insert({ email })

    // TODO: 해당 유저 ID로 자동로그인할 수 있도록 합니다.
    managerId = insertResult.identifiers[0].id;
  } catch (err) {
    // console.log(err);
    if (err.errno === 1062) {
      err.code = 500;
      err.type = "Duplicated Email"
      err.message `${email} has already taken`
      next(err)
    }
    return;
  }

  return res.json({ id: managerId })
});

export default router;