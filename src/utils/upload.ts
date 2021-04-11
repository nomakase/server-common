import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { Restaurant } from "../entities/Restaurant";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { InactiveNoShow } from "../entities/InactiveNoShow";
import { InstanceNotFoundError, MissingParameterError } from "../errors";
import { RestaurantPhoto } from "../entities/RestaurantPhoto";
import { ActiveNoShowPhoto } from "../entities/ActiveNoShowPhoto";
import { InactiveNoShowPhoto } from "../entities/InactiveNoShowPhoto";

export const UPLOAD_BASE = "/images";

export const enum UPLOAD_DIR {
  ACTIVE_NO_SHOW = "/ActiveNoShow",
  INACTIVE_NO_SHOW = "/InactiveNoShow"
}

export const enum UPLOAD_FIELD {
  ACTIVE_NO_SHOW = "activeNoShowPhotos",
}

export const mkStorage = (dirName: string = "") => {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const destination = path.join(__dirname, `../public${UPLOAD_BASE}/` + dirName);

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

export const upload = multer({ storage: mkStorage() });

export const uploadTo = (dirName: UPLOAD_DIR | "" = "") => {
  return multer({ storage: mkStorage(dirName) });
}

/*
  1. multer로 form-data 파싱
  2. photos가 있다면, 알맞는 photos 객체 생성
    - RestaurantPhoto or ActiveNoShowPhoto or InActiveNoShowPhoto
  3. photos 객체에 insert

  
*/

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
    if (!req.files || req.files.length === 0) return;
    const { id } = req.body;

    if (!id) return next(MissingParameterError);

    let entity: Restaurant | ActiveNoShow | InactiveNoShow | undefined;
    try {
      entity = await findEntity(entityType, id);
      if (!entity) throw InstanceNotFoundError;
    } catch (error) {
      return next(error);
    }

    const photos = (req.files as Express.Multer.File[]).map((file) => {
      const filePath = `${process.env.MAIN_HOST}:${process.env.PORT}${UPLOAD_BASE}/${file.filename}`
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