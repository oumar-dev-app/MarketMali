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

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection();

    console.log("✅ Connecté à TiDB");

    connection.release();
  } catch (error) {
    console.error(
      "❌ Erreur de connexion TiDB",
      error
    );
  }
}