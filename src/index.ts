import "reflect-metadata";
import "./config/config";
import normalizePort from "./utils/normalizePort";
import app from "./app";
import { createConnection } from "typeorm";
import ormconfig from "./config/ormconfig";

async function main() {
  const port = normalizePort(process.env.PORT);

  // TODO: Need to change ormconfig.ts for connect nomakase DB
  try {
    await createConnection(ormconfig);
  } catch (err) {
    console.log(
      `
        ################################################
                  ⚠️ Fail to connect DB ⚠️
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
