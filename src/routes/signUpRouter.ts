import express from "express";
import { Manager } from "../entities/Manager";
import hash from "../utils/hash";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password }: { email?: string, password?: string } = req.body;

  if (!email || !password) {
    res.send({
      success: false,
      message: "Invalid : Please check json"
    })
    return;
  }

  if (!email.includes("@")) {
    res.send({
      success: false,
      message: "Invalid : Please check email address",
    })
    return;
  }

  if (password.length <= 2) {
    res.send({
      success: false,
      message: "Invalid : Password must be longer than 2",
    });
    return;
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
      res.send({
        success: false,
        message: `Duplicate : ${email} has already taken`
      })
    }
    return;
  }

  res.send({
    success: true
  })
});

export default router;