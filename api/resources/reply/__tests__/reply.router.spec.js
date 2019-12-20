import router from '../reply.router'

describe('reply router:', () => {
  test('has crud routes', () => {
    const routes = [
      { path: '/reply', method: 'post' },
      { path: '/reply', method: 'put' },
      { path: '/reply', method: 'delete' },
      { path: '/replies', method: 'get' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
