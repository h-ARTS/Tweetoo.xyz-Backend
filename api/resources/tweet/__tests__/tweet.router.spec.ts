import router from '../tweet.router'

describe('tweet router:', () => {
  test('has crud and like/unlike routes', () => {
    const routes = [
      { path: '/', method: 'get' },
      { path: '/:tweetId', method: 'put' },
      { path: '/:tweetId', method: 'delete' },
      { path: '/:tweetId/like', method: 'put' },
      { path: '/:tweetId/unlike', method: 'put' },
      { path: '/:tweetId/retweet', method: 'post' },
      { path: '/:tweetId/undoretweet', method: 'delete' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(s => {
        return s.route.path === route.path && s.route.methods[route.method]
      })
      expect(match).toBeTruthy()
    })
  })
})
