import { useUser } from '../contexts/UserContext'
import { useNavigate } from 'react-router-dom'

const roleMenus = {
  designer: ['设计任务', '素材上传', '待完成图片'],
  operator: ['上架提醒', '订单管理', '产品发布'],
  admin: ['用户管理', '权限配置', '系统设置']
}

export default function DashboardPage() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const menus = roleMenus[user.role] || []

  const handleLogout = () => {
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧导航栏 */}
      <div className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">🌲 ForestField</h2>
        <p className="text-sm">👤 {user.email}</p>
        <p className="text-sm mb-4">🔐 角色：{user.role}</p>

        {menus.map((item, idx) => (
          <div key={idx} className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">
            {item}
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          退出登录
        </button>
      </div>

      {/* 主体内容区域 */}
      <div className="flex-1 p-10 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">欢迎，{user.role}</h1>
        <p className="text-gray-700">这是你的工作面板，你可以在左侧看到你的操作菜单。</p>
      </div>
    </div>
  )
}
