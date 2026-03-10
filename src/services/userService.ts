import { userRepository } from '@/repositories/userRepository';
import { CreateUserDTO } from '@/types/user';
import { hashPassword, verifyPassword } from '@/lib/password';

// Service 层：负责业务逻辑
// 比如：参数校验、权限检查、调用 Repository
export const userService = {
  // 获取用户列表
  getUsers: async () => {
    // 确保表存在 (仅演示用)
    // await userRepository.initTable();
    return await userRepository.findAll();
  },

  // 创建新用户
  createUser: async (username: string, email: string, password?: string) => {
    // await userRepository.initTable();

    const normalizedUsername = username?.trim();
    const normalizedEmail = email?.trim();

    // 1. 简单的业务校验
    if (!normalizedUsername || !normalizedEmail || !password) {
      throw new Error('用户名、邮箱和密码不能为空');
    }

    if (!normalizedEmail.includes('@')) {
      throw new Error('邮箱格式不正确');
    }

    if (password.length < 6) {
      throw new Error('密码长度不能少于 6 位');
    }

    const existingUser = await userRepository.findByUsername(normalizedUsername);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 2. 构造数据对象
    const newUser: CreateUserDTO = {
      username: normalizedUsername,
      email: normalizedEmail,
      password_hash: hashPassword(password)
    };

    // 3. 调用数据层保存
    const result = await userRepository.create(newUser);
    
    // 4. 返回新创建的用户 ID
    return result.insertId;
  },

  // 根据登录信息查询用户
  login: async (username: string, password: string) => {
    // await userRepository.initTable();

    const normalizedUsername = username?.trim();

    if (!normalizedUsername || !password) {
      throw new Error("用户名和密码不能为空");
    }

    const user = await userRepository.findByUsername(normalizedUsername);
    console.log(user,'userService中的 user');
    if (!user) {
      return null;
    }

    if (!verifyPassword(password, user.password_hash as string)) {
      return null;
    }

    return user;
  }
};

