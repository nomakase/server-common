import express from "express";
import { Restaurant } from "../entities/Restaurant";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { name, phoneNumber, address, openningHour, breakTime, description, photos }: Partial<Restaurant> = req.body;

  if (!(name && phoneNumber && address)) {
    const error: any = new Error("Name, address, and phone number are required.");
    error.code = 400;
    error.type = "Invalid Input";

    next(error);
    return;
  }

  const regex = /\d{2,3}-\d{3,4}-\d{4}/;
  if (!regex.exec(phoneNumber)) {
    const error: any = new Error("Please check phone number");
    error.code = 400;
    error.type = "Invalid Phone Number";

    next(error);
    return;
  }

  let restaurantId: number;
  try {
    const insertResult = await Restaurant.insert({
      name,
      phoneNumber,
      address,
      openningHour,
      breakTime,
      description,
      photos
    })
    restaurantId = insertResult.identifiers[0].id;
  } catch (err) {
    console.error(err);

    if (err.errno === 1062) {
      err.code = 500;
      err.type = "Duplicated Phone Number"
      err.message = `${phoneNumber} has already taken`
      next(err);
    }
    return;
  }

  return res.json({ id: restaurantId })
})

export default router;