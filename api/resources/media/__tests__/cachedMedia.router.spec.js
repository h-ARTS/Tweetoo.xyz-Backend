import router from '../cachedMedia.router'

describe('cached media router:', () => {
  test('has post and delete routes for cached media', () => {
    const routes = [
      {
        path: '/:type',
        method: 'post'
      },
      {
        path: '/',
        method: 'delete'
      }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
