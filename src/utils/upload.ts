import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";

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

export const upload = multer({ storage });
