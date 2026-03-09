import { userRepository } from '@/repositories/userRepository';
import { CreateUserDTO } from '@/types/user';

// Service 层：负责业务逻辑
// 比如：参数校验、权限检查、调用 Repository
export const userService = {
  // 获取用户列表
  getUsers: async () => {
    // 确保表存在 (仅演示用)
    await userRepository.initTable();
    return await userRepository.findAll();
  },

  // 创建新用户
  createUser: async (username: string, email: string, passwordhash?: string) => {
    // 1. 简单的业务校验
    if (!username || !email) {
      throw new Error('用户名和邮箱不能为空');
    }

    if (!email.includes('@')) {
      throw new Error('邮箱格式不正确');
    }

    // 2. 构造数据对象
    const newUser: CreateUserDTO = {
      username,
      email,
      passwordhash: passwordhash ?? null
    };

    // 3. 调用数据层保存
    const result = await userRepository.create(newUser);
    
    // 4. 返回新创建的用户 ID
    return result.insertId;
  },

  // 根据登录信息查询用户
  findUserForLogin: async (username: string, email: string, passwordhash: string) => {
    if (!username || !email || !passwordhash) {
      throw new Error("用户名、邮箱和密码不能为空");
    }

    return await userRepository.findByCredentials(username, email, passwordhash);
  }
};

