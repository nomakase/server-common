import express from "express";
import { Manager } from "../entities/Manager";
import hash from "../utils/hash";
import { AppResponse } from "./interface";

const router = express.Router();

router.post("/", async (req, res: AppResponse) => {
  const { email, password }: Partial<Pick<Manager, "email" | "password">> = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Invalid : Please check json"
    })
  }

  if (!email.includes("@")) {
    return res.json({
      success: false,
      message: "Invalid : Please check email address",
    })
  }

  if (password.length <= 2) {
    return res.json({
      success: false,
      message: "Invalid : Password must be longer than 2",
    });
  }

  const hashedPassword = hash(password);
  try {
    const insertResult = await Manager.insert({
      email,
      password: hashedPassword
    })

    // TODO: 해당 유저 ID로 자동로그인할 수 있도록 합니다.
    const userId = insertResult.identifiers[0].id;
    console.log(userId);
  } catch (err) {
    // console.log(err);
    if (err.errno === 1062) {
      return res.json({
        success: false,
        message: `Duplicate : ${email} has already taken`
      })
    }
  }

  return res.json({
    success: true
  })
});

export default router;