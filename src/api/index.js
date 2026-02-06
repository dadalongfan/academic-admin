import request from '../utils/api'

// 成员角色管理 API
export const memberRoleApi = {
  // 获取所有角色
  getList: () => request.get('/member-roles/list'),

  // 获取所有可见角色
  getVisibleList: () => request.get('/member-roles/visible'),

  // 根据ID获取角色
  getById: (id) => request.get(`/member-roles/${id}`),

  // 添加角色
  create: (data) => request.post('/member-roles', data),

  // 更新角色
  update: (id, data) => request.put(`/member-roles/${id}`, data),

  // 删除角色
  delete: (id) => request.delete(`/member-roles/${id}`),

  // 批量更新排序
  updateSort: (data) => request.put('/member-roles/sort', data),

  // 切换显示状态
  toggleVisibility: (id, isVisible) => request.put(`/member-roles/${id}/visibility?isVisible=${isVisible}`),

  // 获取角色成员数量
  getMemberCount: (roleId) => request.get(`/member-roles/${roleId}/member-count`)
}

// 成员管理 API
export const memberApi = {
  // 获取所有成员
  getList: () => request.get('/members/list'),

  // 按角色排序获取成员
  getListByRole: () => request.get('/members/list/by-role'),

  // 根据角色ID获取成员
  getByRoleId: (roleId) => request.get(`/members/role/${roleId}`),

  // 根据ID获取成员
  getById: (id) => request.get(`/members/${id}`),

  // 添加成员
  create: (data) => request.post('/members', data),

  // 更新成员
  update: (id, data) => request.put(`/members/${id}`, data),

  // 删除成员
  delete: (id) => request.delete(`/members/${id}`),

  // 获取指导教师
  getSupervisors: () => request.get('/members/supervisors'),

  // 获取专任教师
  getTeachers: () => request.get('/members/teachers'),

  // 获取在读研究生
  getCurrentGraduates: () => request.get('/members/graduates/current'),

  // 获取毕业生
  getGraduatedStudents: () => request.get('/members/graduates/completed')
}

export default {
  memberRoleApi,
  memberApi
}
