import { Manager } from "../entities/Manager";
import { Photo } from "../entities/Photo";
import { Restaurant } from "../entities/Restaurant";
import { RestaurantPhoto } from "../entities/RestaurantPhoto";
import { Time } from "../entities/Time";
import { ConnectionOptions } from "typeorm";
import { Admin } from "../entities/Admin";
import { ActiveNoShowPhoto } from "../entities/ActiveNoShowPhoto";
import { ActiveNoShow } from "../entities/ActiveNoShow";
import { InactiveNoShow } from "../entities/InactiveNoShow";
import { InactiveNoShowPhoto } from "../entities/InactiveNoShowPhoto";

// TODO: Should connect nomakase DB
const ormconfig: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  entities: [Manager, Restaurant, RestaurantPhoto, Photo, Time, Admin, ActiveNoShowPhoto, ActiveNoShow, InactiveNoShowPhoto, InactiveNoShow],
  migrations: ["src/migration/**/*.ts"],
};

export default ormconfig;
