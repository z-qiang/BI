/**
 * 用户业务逻辑层 (Service)
 */
class UserService {
  constructor() {
    // 模拟内存数据库
    this.users = [
      { id: 1, name: 'Ethan', email: 'ethan@example.com', role: 'admin' },
      { id: 2, name: 'Alice', email: 'alice@example.com', role: 'user' }
    ]
  }

  async getAllUsers() {
    return this.users
  }

  async getUserById(id) {
    const user = this.users.find(u => u.id === Number(id))
    if (!user) {
      const error = new Error('未找到该用户')
      error.statusCode = 404
      throw error
    }
    return user
  }

  async createUser(userData) {
    const { name, email, role = 'user' } = userData
    if (!name || !email) {
      const error = new Error('姓名与邮箱为必填项')
      error.statusCode = 400
      throw error
    }

    const newUser = {
      id: this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
      name,
      email,
      role
    }

    this.users.push(newUser)
    return newUser
  }

  async deleteUser(id) {
    const index = this.users.findIndex(u => u.id === Number(id))
    if (index === -1) {
      const error = new Error('用户不存在')
      error.statusCode = 404
      throw error
    }
    const [deleted] = this.users.splice(index, 1)
    return deleted
  }
}

module.exports = new UserService()
