// 定义用户数据模型
// 对应数据库中的 users 表结构
export interface User {
  id: number;
  username: string; // 将 name 改为 username
  email: string;
  password_hash: string | null;
  created_at: Date;
}

// 用于创建用户的类型（不需要 id 和 created_at，因为数据库会自动生成）
export type CreateUserDTO = Omit<User, "id" | "created_at">;

