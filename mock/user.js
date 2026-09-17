import Mock from 'mockjs'

// 用户相关 Mock 接口（演示用，结构对齐后端 DRF：裸数据，无 {code,message,data} 包装）
// 注：后端目前无 /user/list、/user/detail 这类账号列表接口（属规划中受阻页面 #7），
// 以下仅为本地开发演示，接真后端时需由对应业务接口替换。
export default [
  {
    url: '/api/user/list',
    method: 'get',
    response: () => {
      const { list } = Mock.mock({
        'list|12': [
          {
            id: '@id',
            name: '@cname',
            age: '@integer(18, 60)',
            email: '@email',
          },
        ],
      })
      return list
    },
  },
  {
    url: '/api/user/detail',
    method: 'get',
    response: ({ query }) => ({
      id: query.id || '1',
      name: '张三',
      role: 'admin',
      bio: '这是一条来自 Mock 的用户简介。',
    }),
  },
]
