import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";

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

export const upload = multer({ storage : mkStorage() });

export const uploadTo = (dirName: UPLOAD_DIR | "" = "") => {
  return multer({ storage : mkStorage(dirName) });
}
