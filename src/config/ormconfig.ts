import { ConnectionOptions } from "typeorm";
import { Manager } from "../entities/Manager";

// TODO: Should connect nomakase DB
const ormconfig: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  entities: [Manager],
  migrations: ["src/migration/**/*.ts"],
};

export default ormconfig;
