import router from '../media.router'

describe('media router:', () => {
  test('has getter routes for users and tweets', () => {
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
})
