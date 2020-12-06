/**
 * Normalize a port into a number, string, or default value.
 */

const default_port = 3000;

export default function normalizePort(val: string | number | undefined) {
  if (!val) return default_port;

  let port: number;
  if (typeof val === "string") port = parseInt(val, 10);
  else port = val;

  // port is 'named pipe' or 'positive integer' or 'negative integer'
  return isNaN(port) ? val : port >= 0 ? port : default_port;
}
