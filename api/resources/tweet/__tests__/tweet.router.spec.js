import router from '../tweet.router'

describe('tweet router:', () => {
  test('has crud routes', () => {
    const routes = [
      { path: '/', method: 'get' },
      { path: '/:tweetId', method: 'get' },
      { path: '/:tweetId', method: 'put' },
      { path: '/:tweetId', method: 'delete' },
      { path: '/', method: 'get' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
