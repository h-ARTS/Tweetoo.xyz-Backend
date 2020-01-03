import router from '../reply.router'

describe('reply router:', () => {
  test('has crud and like/unlike routes', () => {
    const routes = [
      // { path: '/', method: 'get' },
      { path: '/', method: 'post' },
      { path: '/', method: 'put' },
      { path: '/', method: 'delete' },
      { path: '/like', method: 'put' },
      { path: '/unlike', method: 'put' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        console.log(route.path)
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
