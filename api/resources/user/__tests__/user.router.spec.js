import router from '../user.router'

describe('user router:', () => {
  test('has user routes', () => {
    const routes = [
      { path: '/', method: 'get' },
      { path: '/', method: 'put' },
      { path: '/:handle', method: 'get' },
      { path: '/:handle', method: 'put' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
