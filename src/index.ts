import "reflect-metadata";
import express from "express";
import normalizePort from "./utils/normalizePort";

async function main() {
  const app = express();
  const port = normalizePort(process.env.PORT);

  // TODO: Need to change ormconfig.ts for connect nomakase DB 
  // const connection = await createConnection(ormconfig);

  app.get("/", (_req, res) => {
    res.send("hello world");
  });

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
