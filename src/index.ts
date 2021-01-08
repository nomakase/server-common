import "reflect-metadata";
import "./config/config";
import normalizePort from "./utils/normalizePort";
import app from "./app";

async function main() {
  const port = normalizePort(process.env.PORT);

  // TODO: Need to change ormconfig.ts for connect nomakase DB
  // const connection = await createConnection(ormconfig);

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
