import mysql from 'mysql2/promise';

// 创建数据库连接池
// 这样可以复用连接，提高性能，避免频繁建立/断开连接
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'zhaixu123',
  database: 'my_app_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

