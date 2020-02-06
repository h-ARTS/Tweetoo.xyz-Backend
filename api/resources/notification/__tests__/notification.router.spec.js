import router from '../notification.router'

describe('notification router:', () => {
  test('has getter route', () => {
    const routes = [{ path: '/', method: 'get' }]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
