import express from "express";
import { AuthorizedRequest } from "@custom-types/express";
import { Restaurant } from "../entities/Restaurant";
import { MissingParameterError, InvalidPhoneNumberError, DuplicatedPhoneNumberError, InstanceNotFoundError, NoMatchedUserError } from "../errors";
import { EntityType, upload, createPhotosCallBack } from "../utils/upload"
import AuthService from "../services/AuthService";
import { Manager } from "../entities/Manager";

const router = express.Router();

router.get("/", async (req: AuthorizedRequest, res, next) => {
  const email = req.Identifier!.email;
  const user = await Manager.findOne({ email }, { relations: ["restaurants"] });
  if (!user) return next(NoMatchedUserError);

  res.json(user.restaurants);
})

router.post("/", upload.array("photos", 5), async (req: AuthorizedRequest, _res, next) => {
  const { name, phoneNumber, address, openningHour, breakTime, description }: Partial<Restaurant> = req.body;
  const email = req.Identifier!.email;
  const user = await AuthService.getUser(email);

  if (!(name && phoneNumber && address)) {
    return next(MissingParameterError);
  }

  const regex = /\d{2,3}-\d{3,4}-\d{4}/;
  if (!regex.exec(phoneNumber)) {
    return next(InvalidPhoneNumberError);
  }

  let id: number;
  try {
    const insertResult = await Restaurant.insert({
      name,
      phoneNumber,
      address,
      openningHour,
      breakTime,
      description,
      manager: user,
    })
    id = insertResult.identifiers[0].id;
  } catch (err) {
    console.error(err);

    if (err.errno === 1062) {
      next(DuplicatedPhoneNumberError);
    }
    return;
  }

  req.body.id = id;
  return next();
})
router.post("/", createPhotosCallBack(EntityType.Restaurant));

router.put("/", upload.array("photos", 5), async (req: AuthorizedRequest, _, next) => {
  const email = req.Identifier!.email;
  const user = await Manager.findOne({ email }, { relations: ["restaurants"] });
  if (!user) return next(NoMatchedUserError);

  const { id, name, phoneNumber, address, openningHour, breakTime, description }: Partial<Restaurant> = req.body;
  if (!id) return next(MissingParameterError);

  const restaurantToUpdate = user.restaurants.find(restaurant => restaurant.id === Number(id));
  if (!restaurantToUpdate) return next(InstanceNotFoundError);

  const updatedRestaurant = {
    ...restaurantToUpdate,
    name: name ? name : restaurantToUpdate.name,
    phoneNumber: phoneNumber ? phoneNumber : restaurantToUpdate.phoneNumber,
    address: address ? address : restaurantToUpdate.address,
    openningHour: {
      start: openningHour?.start ? openningHour.start : restaurantToUpdate.openningHour.start,
      end: openningHour?.end ? openningHour.end : restaurantToUpdate.openningHour.end,
    },
    breakTime: {
      start: breakTime?.start ? breakTime.start : restaurantToUpdate.breakTime.start,
      end: breakTime?.end ? breakTime.end : restaurantToUpdate.breakTime.end,
    },
    description: description ? description : restaurantToUpdate.description,
  };

  try {
    await Restaurant.update(restaurantToUpdate, updatedRestaurant);
  } catch (error) {
    console.log(error);
    if (error.errno === 1062) return next(DuplicatedPhoneNumberError);
    return next(error);
  }
  return next();
})
router.put("/", createPhotosCallBack(EntityType.Restaurant));

export default router;