const userService = require('../services/userService')
const ApiResponse = require('../utils/apiResponse')
const asyncHandler = require('../middlewares/asyncHandler')

/**
 * 用户控制器 (Controller)
 */
class UserController {
  // 获取用户列表
  getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers()
    return ApiResponse.success(res, users, '获取用户列表成功')
  })

  // 获取用户详情
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id)
    return ApiResponse.success(res, user, '获取用户详情成功')
  })

  // 创建新用户
  createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body)
    return ApiResponse.success(res, user, '创建用户成功', 201)
  })

  // 删除用户
  deleteUser = asyncHandler(async (req, res) => {
    const user = await userService.deleteUser(req.params.id)
    return ApiResponse.success(res, user, '删除用户成功')
  })
}

module.exports = new UserController()
