import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";

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

export const upload = multer({ storage : mkStorage() });

export const uploadTo = (dirName: string) => {
  return multer({ storage : mkStorage(dirName) });
}
