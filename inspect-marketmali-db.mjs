import mysql from "mysql2/promise";
import fs from "fs";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connection = await pool.getConnection();

try {
  const [tables] = await connection.query(`
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);

  let output = "";

  for (const table of tables) {
    const tableName = table.TABLE_NAME;

    output += `\n\n============================================================\n`;
    output += `TABLE: ${tableName}\n`;
    output += `============================================================\n\n`;

    const [columns] = await connection.query(`
      SELECT
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [tableName]);

    output += "COLUMNS:\n";

    for (const column of columns) {
      output += [
        `  ${column.COLUMN_NAME}`,
        `type=${column.COLUMN_TYPE}`,
        `nullable=${column.IS_NULLABLE}`,
        `default=${column.COLUMN_DEFAULT ?? "NULL"}`,
        `key=${column.COLUMN_KEY || "-"}`,
        `extra=${column.EXTRA || "-"}`
      ].join(" | ") + "\n";
    }

    const [indexes] = await connection.query(`
      SELECT
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        SEQ_IN_INDEX
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `, [tableName]);

    output += "\nINDEXES:\n";

    for (const index of indexes) {
      output += [
        `  ${index.INDEX_NAME}`,
        `column=${index.COLUMN_NAME}`,
        `unique=${index.NON_UNIQUE === 0 ? "YES" : "NO"}`,
        `position=${index.SEQ_IN_INDEX}`
      ].join(" | ") + "\n";
    }

    const [foreignKeys] = await connection.query(`
      SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY CONSTRAINT_NAME, ORDINAL_POSITION
    `, [tableName]);

    output += "\nFOREIGN KEYS:\n";

    if (foreignKeys.length === 0) {
      output += "  Aucun\n";
    } else {
      for (const fk of foreignKeys) {
        output += [
          `  ${fk.CONSTRAINT_NAME}`,
          `${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
        ].join(" | ") + "\n";
      }
    }
  }

  fs.writeFileSync(
    "/tmp/marketmali-schema.txt",
    output,
    "utf8"
  );

  console.log(`✅ Schéma récupéré : ${tables.length} tables`);
  console.log("📄 Fichier : /tmp/marketmali-schema.txt");

} finally {
  connection.release();
  await pool.end();
}
