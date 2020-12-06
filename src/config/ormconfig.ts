import { ConnectionOptions } from "typeorm";

// TODO: Should connect nomakase DB
const ormconfig: ConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  synchronize: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
};

export default ormconfig;
