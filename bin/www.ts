import {createServer} from 'http';
import "../src/config/config";
import app from "../src/app";

const port = normalizePort(process.env.PORT);


createServer(app).listen(port, () => {
    console.log(`
        ################################################
            🛡️  Server listening on port ${port} 🛡️ 
        ################################################
    `);
}).on('error', (err) => {
    console.log(`
        ################################################
                  ⚠️ Fail to create server ⚠️
        ################################################
    ` + err);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}