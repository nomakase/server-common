import { Manager } from "src/entities/Manager";
import { Photo } from "src/entities/Photo";
import { Restaurant } from "src/entities/Restaurant";
import { RestaurantPhoto } from "src/entities/RestaurantPhoto";
import { Time } from "src/entities/Time";
import { ConnectionOptions } from "typeorm";

// TODO: Should connect nomakase DB
const ormconfig: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  entities: [Manager, Restaurant, RestaurantPhoto, Photo, Time],
  migrations: ["src/migration/**/*.ts"],
};

export default ormconfig;
