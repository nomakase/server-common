import "reflect-metadata";
import "src/config/config";
import normalizePort from "src/utils/normalizePort";
import app from "src/app";
import { createConnection } from "typeorm";
import ormconfig from "src/config/ormconfig";
import Redis from "src/config/Redis";

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
