import pool from '../src/config/db.config.js';

async function check() {
  const [logs] = await pool.query("SELECT * FROM login_logs WHERE login_status = 'failed' ORDER BY id DESC LIMIT 10");
  console.log("Failed login logs:", logs);
  const [lastLogs] = await pool.query("SELECT * FROM login_logs ORDER BY id DESC LIMIT 10");
  console.log("Last 10 logs:", lastLogs);
  process.exit(0);
}
check();
