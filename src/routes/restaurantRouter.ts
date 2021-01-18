import express from "express";
import { Restaurant } from "../entities/Restaurant";
import { AppResponse } from "./interface";

const router = express.Router();

router.post("/register", async (req, res: AppResponse) => {
  const { name, phoneNumber, address, open, close, description, photos }: Partial<Restaurant> = req.body;

  if (!(name && phoneNumber && address && open && close)) {
    return res.json({
      success: false,
      message: "Invalid : Please check json"
    })
  }


  const regex = /\d{2,3}-\d{3,4}-\d{4}/;
  if (!regex.exec(phoneNumber)) {
    return res.json({
      success: false,
      message: "Invalid : Please check phone number"
    })
  }

  try {
    await Restaurant.insert({
      name,
      phoneNumber,
      address,
      open,
      close,
      description
    })
  } catch (err) {
    console.error(err);
  }

  return res.json({ success: true })
})

export default router;