import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "test",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 获取数据库连接
export async function connect() {
  const connection = await pool.getConnection();
  return connection;
}

// 查询操作，返回所有结果
export async function query(sql: string, params: any[]) {
  const connection = await connect();
  try {
    const [rows, fields] = await connection.execute(sql, params);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

// 查询单条记录
export async function queryOne(sql: string, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// 执行更新操作，返回受影响的行数
export async function execute(sql: string, params = []) {
  const connection = await connect();
  try {
    const [result] = await connection.execute(sql, params);
    return "affectedRows" in result ? result.affectedRows : 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

// 执行删除操作，返回受影响的行数
export async function deleteRecord(
  table: string,
  conditionParams: { conditions: any[]; params: never[] },
) {
  const { conditions, params } = conditionParams;
  const sql = `DELETE FROM ${table} WHERE ${conditions}`;
  return await execute(sql, params);
}

// 执行插入操作，返回插入的行的ID
export async function insert(sql: string, params = []) {
  const connection = await connect();
  try {
    const [result] = await connection.execute(sql, params);
    return "insertId" in result ? result.insertId : 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}
