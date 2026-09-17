import Mock from 'mockjs'

// 文章相关 Mock 接口（演示用，结构对齐后端 DRF：裸数据，无 {code,message,data} 包装）
export default [
  {
    url: '/api/posts',
    method: 'get',
    response: () => {
      const { list } = Mock.mock({
        'list|8': [
          {
            id: '@id',
            title: '@ctitle(8, 16)',
            views: '@integer(10, 9999)',
            createdAt: '@datetime',
          },
        ],
      })
      return list
    },
  },
]
