import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  /*
   * Gestion du pool
   */
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60_000,
  queueLimit: 50,

  /*
   * Connexions réseau
   */
  connectTimeout: 10_000,

  /*
   * Maintient les connexions TCP actives.
   * Utile avec TiDB Cloud / connexion distante.
   */
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function testDatabaseConnection() {
  let connection;

  try {
    connection = await db.getConnection();

    await connection.ping();

    console.log("✅ Connecté à TiDB");

  } catch (error) {
    console.error(
      "❌ Erreur de connexion TiDB",
      error
    );

  } finally {
    connection?.release();
  }
}