import router from '../bookmarks.router'

describe('Bookmarks router:', () => {
  test('has get and post router', () => {
    const routes = [
      { path: '/', method: 'get' },
      { path: '/', method: 'post' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(r => {
        return r.route.path === route.path && r.route.method[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
