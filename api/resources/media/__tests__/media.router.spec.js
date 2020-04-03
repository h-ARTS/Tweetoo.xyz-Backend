import router from '../media.router'

describe('media router:', () => {
  test('has getter routes for media', () => {
    const routes = [
      { path: '/user/:handle/:filename', method: 'get' },
      { path: '/tweet/:tweetId/:filename', method: 'get' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })

  test('has post and delete routes for cached media', () => {
    const routes = [
      {
        path: '/cached/:type',
        method: 'post'
      },
      {
        path: '/cached',
        method: 'put'
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
