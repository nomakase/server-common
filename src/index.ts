import "reflect-metadata";
import "./config/config";
import app from "./app";
import { createConnection } from "typeorm";
import normalizePort from "./utils/normalizePort";
import ormconfig from "./config/ormconfig";
import Redis from "./config/Redis";

async function main() {
  const port = normalizePort(process.env.PORT);

  try {
    await createConnection(ormconfig);
    console.log("MYSQL connected.");
  } catch (err) {
    console.log(
      `
        ################################################
                  ⚠️ Fail to connect MYSQL ⚠️
        ################################################
    ` + err
    );
  }

  try {
    await Redis.createConnection();
    console.log("REDIS connected.");
  } catch (err) {
    console.log(
      `
        ################################################
                  ⚠️ Fail to connect REDIS ⚠️
        ################################################
    ` + err
    );
  }

  try {
    app.listen(port, () => {
      console.log(`
        ################################################
            🛡️  Server listening on port ${port} 🛡️ 
        ################################################
    `);
    });
  } catch (err) {
    console.log(
      `
        ################################################
                  ⚠️ Fail to create server ⚠️
        ################################################
    ` + err
    );
  }
}

main();
