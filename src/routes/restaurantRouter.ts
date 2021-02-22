import express from "express";
import multer, { diskStorage } from "multer";
import fs from "fs";
import path from "path";
import { Restaurant } from "../entities/Restaurant";
import { RestaurantPhoto } from "../entities/RestaurantPhoto";
import { MissingParameterError, InvalidPhoneNumberError, DuplicatedPhoneNumberError, InstanceNotFoundError } from "../errors";

const router = express.Router();
const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const destination = path.join(__dirname, "../public/images");

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    cb(null, destination);
  },
  filename: (_, file, cb) => {
    const { ext, name } = path.parse(file.originalname);
    const fileName = name + "_" + Date.now() + ext;
    cb(null, fileName);
  }
})
const upload = multer({ storage });

router.post("/", upload.array("photos", 5), async (req, _res, next) => {
  const { name, phoneNumber, address, openningHour, breakTime, description }: Partial<Restaurant> = req.body;
  if (!(name && phoneNumber && address)) {
    return next(MissingParameterError);
  }

  const regex = /\d{2,3}-\d{3,4}-\d{4}/;
  if (!regex.exec(phoneNumber)) {
    return next(InvalidPhoneNumberError);
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
    })
    restaurantId = insertResult.identifiers[0].id;
  } catch (err) {
    console.error(err);

    if (err.errno === 1062) {
      next(DuplicatedPhoneNumberError);
    }
    return;
  }

  req.body.restaurantId = restaurantId;
  return next();
})

router.post("/", async (req, res, next) => {
  if (req.files.length === 0) return;

  const { restaurantId } = req.body;

  let restaurant: Restaurant | undefined;
  try {
    restaurant = await Restaurant.findOne({ id: restaurantId });
    if (!restaurant) throw new Error("Unexpected Error");
  } catch (error) {
    return next(error);
  }

  const photos = (req.files as Express.Multer.File[]).map((file) => {
    const filePath = `${process.env.DB_HOST}:${process.env.PORT}/images/${file.filename}`
    const photo = new RestaurantPhoto();
    photo.filePath = filePath;
    photo.restaurant = restaurant!;

    return photo;
  })

  try {
    await Promise.all(photos.map(photo => RestaurantPhoto.insert(photo)));
  } catch (error) {
    console.error(error);
    return next(error);
  }
  return res.json({ id: restaurantId })
})

// TODO: 파일 업로드를 추가해야합니다.
router.put("/", async (req, res, next) => {
  const { id, name, phoneNumber, address, openningHour, breakTime, description }: Partial<Restaurant> = req.body;

  if (!id) return next(MissingParameterError);

  const restaurantToUpdate = await Restaurant.findOne({ id });
  if (!restaurantToUpdate) return next(InstanceNotFoundError);

  try {
    await Restaurant.update(id, {
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
    })
  } catch (err) {
    console.log(err);
    if (err.errno === 1062) {
      next(DuplicatedPhoneNumberError);
    }
    return;
  }
  res.send({ id })
})

export default router;