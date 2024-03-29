import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { Restaurant } from "../entities/Restaurant";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { InactiveNoShow } from "../entities/InactiveNoShow";
import { InstanceNotFoundError, InvalidFileFormat, MissingParameterError } from "../errors";
import { RestaurantPhoto } from "../entities/RestaurantPhoto";
import { ActiveNoShowPhoto } from "../entities/ActiveNoShowPhoto";
import { InactiveNoShowPhoto } from "../entities/InactiveNoShowPhoto";

export const UPLOAD_BASE = "images/";

export const enum UPLOAD_DIR {
  ACTIVE_NO_SHOW = "NoShow/",
  INACTIVE_NO_SHOW = "NoShow/"
}

export const enum UPLOAD_FIELD {
  ACTIVE_NO_SHOW = "activeNoShowPhotos",
}

export const mkStorage = (dirName: string = "") => {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const destination = path.join(__dirname, "../public/images/" + dirName);

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
}

const fileFilter = (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  if (!isValidFileFormat(file)) return callback(InvalidFileFormat);
  return callback(null, true);
}

function isValidFileFormat(file: Express.Multer.File) {
  const reg = /\.(jpe?g|png|JPE?G)$/i;

  return reg.test(file.originalname);
}

export const upload = multer({
  storage: mkStorage(),
  fileFilter,
  limits: {
    fileSize: 1 * 1000 * 1024,
  },
});

export const uploadTo = (dirName: UPLOAD_DIR | "" = "") => {
  return multer({ storage: mkStorage(dirName), fileFilter });
}

export const enum EntityType { Restaurant, ActiveNoShow, InactiveNoShow }

async function findEntity(entityType: EntityType, id: number) {
  if (entityType === EntityType.Restaurant)
    return await Restaurant.findOne({ id });

  if (entityType === EntityType.ActiveNoShow)
    return await ActiveNoShow.findOne({ id });

  return await InactiveNoShow.findOne({ id });
}

function createPhotoEntity(entity: Restaurant | ActiveNoShow | InactiveNoShow) {
  if (entity instanceof Restaurant) return new RestaurantPhoto();
  if (entity instanceof ActiveNoShow) return new ActiveNoShowPhoto();
  return new InactiveNoShowPhoto();
}

function setRelation(
  entity: Restaurant | ActiveNoShow | InactiveNoShow,
  photoEntity: RestaurantPhoto | ActiveNoShowPhoto | InactiveNoShowPhoto,
) {
  if (photoEntity instanceof RestaurantPhoto) {
    photoEntity.restaurant = entity as Restaurant;
  } else if (photoEntity instanceof ActiveNoShowPhoto) {
    photoEntity.noShow = entity as ActiveNoShow;
  } else {
    photoEntity.noShow = entity as InactiveNoShow;
  }
}

async function insertPhotos(photos: (RestaurantPhoto | ActiveNoShowPhoto | InactiveNoShowPhoto)[]) {
  if (photos[0] instanceof RestaurantPhoto)
    return Promise.all(photos.map(photo => RestaurantPhoto.insert(photo)));

  if (photos[0] instanceof ActiveNoShowPhoto)
    return Promise.all(photos.map(photo => ActiveNoShowPhoto.insert(photo)));

  return Promise.all(photos.map(photo => InactiveNoShowPhoto.insert(photo)));
}

export function createPhotosCallBack(entityType: EntityType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;
    if (!id) return next(MissingParameterError);

    if (!req.files || req.files.length === 0) return res.send({ id });

    let entity: Restaurant | ActiveNoShow | InactiveNoShow | undefined;
    try {
      entity = await findEntity(entityType, id);
      if (!entity) throw InstanceNotFoundError;
    } catch (error) {
      return next(error);
    }

    const photos = (req.files as Express.Multer.File[]).map((file) => {
      const filePath = `images/${file.filename}`
      const photo = createPhotoEntity(entity!);
      photo.filePath = filePath;
      setRelation(entity!, photo);

      return photo;
    })

    try {
      await insertPhotos(photos);
    } catch (error) {
      console.error(error);
      return next(error);
    }

    return res.json({ id })
  };
}
export const deleteFile = (fileName: string, dirName: UPLOAD_DIR | "" = "") => {
  const file = path.join(__dirname, `../public/images/${dirName}${fileName}`);
  fs.unlinkSync(file);
}
